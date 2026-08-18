import * as admin from "firebase-admin";
import { logger, runWith } from "firebase-functions/v1";

type BlockedUserRecord = {
  blockerId?: string;
  blockedUserId?: string;
  active?: boolean;
  reason?: string;
  sourceType?: string;
  sourceId?: string | null;
};

const uniqueStrings = (values: unknown): string[] =>
  Array.isArray(values)
    ? Array.from(
        new Set(values.filter((value): value is string => typeof value === "string" && value.length > 0)),
      )
    : [];

async function syncPairChats(
  blockerId: string,
  blockedUserId: string,
): Promise<void> {
  const db = admin.firestore();
  const forwardBlockReference = db
    .collection("BlockedUsers")
    .doc(`${blockerId}__${blockedUserId}`);
  const reverseBlockId = `${blockedUserId}__${blockerId}`;
  const reverseBlockReference = db.collection("BlockedUsers").doc(reverseBlockId);
  const chatSnapshot = await db
    .collection("Chats")
    .where("participants", "array-contains", blockerId)
    .get();
  const matchingChats = chatSnapshot.docs.filter((chat) => {
    const participants = uniqueStrings(chat.data().participants);
    return participants.includes(blockedUserId);
  });

  for (const chat of matchingChats) {
    await db.runTransaction(async (transaction) => {
      const [chatDocument, forwardBlock, reverseBlock] = await Promise.all([
        transaction.get(chat.ref),
        transaction.get(forwardBlockReference),
        transaction.get(reverseBlockReference),
      ]);
      if (!chatDocument.exists) return;

      const chatData = chatDocument.data() || {};
      const hiddenFor = new Set(uniqueStrings(chatData.hiddenFor));
      const disabledParticipants = new Set(uniqueStrings(chatData.disabledParticipants));
      const forwardIsActive = forwardBlock.data()?.active === true;
      const reverseIsActive = reverseBlock.data()?.active === true;

      if (forwardIsActive) {
        hiddenFor.add(blockerId);
      }
      if (reverseIsActive) hiddenFor.add(blockedUserId);

      if (forwardIsActive || reverseIsActive) {
        disabledParticipants.add(blockerId);
        disabledParticipants.add(blockedUserId);
      } else {
        hiddenFor.delete(blockerId);
        hiddenFor.delete(blockedUserId);
        disabledParticipants.delete(blockerId);
        disabledParticipants.delete(blockedUserId);
      }

      transaction.update(chat.ref, {
        hiddenFor: Array.from(hiddenFor),
        disabledParticipants: Array.from(disabledParticipants),
        blockStateUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
  }
}

async function prepareModeratorNotification(
  blockReference: admin.firestore.DocumentReference,
  eventId: string,
): Promise<boolean> {
  const db = admin.firestore();
  return db.runTransaction(async (transaction) => {
    const currentDocument = await transaction.get(blockReference);
    const current = currentDocument.data();
    if (!currentDocument.exists || current?.active !== true) return false;
    if (
      current?.developerNotificationEventId === eventId &&
      current?.developerNotificationStatus === "sent"
    ) {
      return false;
    }

    transaction.set(
      blockReference,
      {
        moderationStatus: "pending",
        developerNotificationStatus: "pending",
        developerNotifiedAt: null,
        developerNotificationEventId: eventId,
        developerNotificationError: admin.firestore.FieldValue.delete(),
      },
      { merge: true },
    );
    return true;
  });
}

async function notifyModerators(
  blockReference: admin.firestore.DocumentReference,
  block: BlockedUserRecord,
): Promise<void> {
  const db = admin.firestore();
  const moderationSnapshot = await db.collection("app_content").doc("moderation").get();
  const moderatorUserIds = uniqueStrings(moderationSnapshot.data()?.moderatorUserIds);

  const moderatorSnapshots = await Promise.all(
    moderatorUserIds.map((uid) => db.collection("Users").doc(uid).get()),
  );
  const tokens = Array.from(
    new Set(
      moderatorSnapshots.flatMap((snapshot) => uniqueStrings(snapshot.data()?.fcmTokens)),
    ),
  );

  if (tokens.length === 0) {
    await blockReference.set(
      {
        developerNotificationStatus: "failed",
        developerNotifiedAt: null,
        developerNotificationError: "No moderator notification tokens configured",
      },
      { merge: true },
    );
    return;
  }

  let sent = 0;
  let failed = 0;
  for (let offset = 0; offset < tokens.length; offset += 500) {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: tokens.slice(offset, offset + 500),
      notification: {
        title: "User blocked",
        body: "A user block requires moderation review.",
      },
      data: {
        type: "moderationBlock",
        blockId: blockReference.id,
        blockerId: block.blockerId || "",
        blockedUserId: block.blockedUserId || "",
        reason: block.reason || "other",
        sourceType: block.sourceType || "profile",
        sourceId:
          typeof block.sourceId === "string" ? block.sourceId : "",
      },
      android: {
        priority: "high",
        notification: { channelId: "default", sound: "default" },
      },
      apns: { payload: { aps: { sound: "default" } } },
    });
    sent += response.successCount;
    failed += response.failureCount;
  }

  await blockReference.set(
    {
      developerNotificationStatus: sent > 0 ? "sent" : "failed",
      developerNotifiedAt:
        sent > 0 ? admin.firestore.FieldValue.serverTimestamp() : null,
      developerNotificationError:
        failed > 0 ? `${failed} moderator notification(s) failed` : admin.firestore.FieldValue.delete(),
    },
    { merge: true },
  );
}

export const syncBlockedUser = runWith({ failurePolicy: true })
  .firestore
  .document("BlockedUsers/{blockId}")
  .onWrite(async (change, context) => {
    const before = change.before.exists
      ? (change.before.data() as BlockedUserRecord)
      : undefined;
    const after = change.after.exists
      ? (change.after.data() as BlockedUserRecord)
      : undefined;
    const wasActive = before?.active === true;
    const isActive = after?.active === true;

    if (wasActive === isActive) return;

    const block = after || before;
    const blockerId = block?.blockerId;
    const blockedUserId = block?.blockedUserId;
    if (!blockerId || !blockedUserId || blockerId === blockedUserId) {
      logger.error("Ignoring malformed block record", { blockId: context.params.blockId });
      return;
    }

    let chatSynchronizationError: unknown;
    try {
      await syncPairChats(blockerId, blockedUserId);
    } catch (error) {
      chatSynchronizationError = error;
      logger.error("Failed to synchronize blocked chats", error);
    }

    if (isActive && change.after.exists && after) {
      try {
        const shouldNotify = await prepareModeratorNotification(
          change.after.ref,
          context.eventId,
        );
        if (shouldNotify) await notifyModerators(change.after.ref, after);
      } catch (error) {
        logger.error("Failed to notify moderators", error);
        await change.after.ref.set(
          {
            developerNotificationStatus: "failed",
            developerNotifiedAt: null,
            developerNotificationError: "Moderator notification failed",
          },
          { merge: true },
        );
        throw error;
      }
    }

    if (chatSynchronizationError) throw chatSynchronizationError;
  });

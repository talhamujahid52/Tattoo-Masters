import { setGlobalOptions } from "firebase-functions";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";

// Set global options for performance/cost control
setGlobalOptions({ maxInstances: 10 });

// Initialize Firebase Admin SDK
admin.initializeApp();

// Basic CORS wrapper for onRequest
const corsHandler = cors({ origin: true });

// Cloud Function: HTTP endpoint to send push notifications
// Supports either a direct token or a recipient userId that will be resolved to stored tokens
export const sendPushNotification = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      // Verify Firebase ID token from Authorization header
      const authHeader = (req.headers.authorization || req.headers.Authorization) as
        | string
        | undefined;
      if (!authHeader || !authHeader.toString().startsWith("Bearer ")) {
        res.status(401).send("Unauthorized");
        return;
      }
      const idToken = authHeader.toString().split(" ")[1];
      let senderId: string;
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        senderId = decodedToken.uid;
      } catch (e) {
        res.status(401).send("Invalid token");
        return;
      }

      const { recipientUserId, title, body, data } = req.body || {};

      if (
        typeof recipientUserId !== "string" ||
        !recipientUserId ||
        typeof title !== "string" ||
        !title ||
        typeof body !== "string" ||
        !body
      ) {
        res.status(400).send("Missing required fields");
        return;
      }

      if (recipientUserId === senderId) {
        res.status(400).send("Sender and recipient must be different users");
        return;
      }

      const db = admin.firestore();
      const [forwardBlock, reverseBlock] = await Promise.all([
        db.collection("BlockedUsers").doc(`${senderId}__${recipientUserId}`).get(),
        db.collection("BlockedUsers").doc(`${recipientUserId}__${senderId}`).get(),
      ]);
      if (forwardBlock.data()?.active === true || reverseBlock.data()?.active === true) {
        res.status(200).json({ success: false, sent: 0, failed: 0, suppressed: "blocked" });
        return;
      }

      const normalizedData: Record<string, string> = {};
      if (data && typeof data === "object" && !Array.isArray(data)) {
        Object.entries(data).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          normalizedData[key] = typeof value === "string" ? value : JSON.stringify(value);
        });
      }
      normalizedData.senderId = senderId;
      const notificationType = normalizedData.type;
      let notificationTitle = title.slice(0, 200);
      let notificationBody = body.slice(0, 1000);

      if (notificationType === "chatMessage") {
        const chatId = normalizedData.chatId;
        if (!chatId) {
          res.status(400).send("Missing chatId");
          return;
        }
        const chatSnapshot = await db.collection("Chats").doc(chatId).get();
        const chatData = chatSnapshot.data() || {};
        const participants = chatData.participants;
        if (
          !chatSnapshot.exists ||
          !Array.isArray(participants) ||
          !participants.includes(senderId) ||
          !participants.includes(recipientUserId)
        ) {
          res.status(403).send("Sender and recipient are not chat participants");
          return;
        }
        if (
          Array.isArray(chatData.disabledParticipants) &&
          chatData.disabledParticipants.length > 0
        ) {
          res.status(200).json({ success: false, sent: 0, failed: 0, suppressed: "disabled_chat" });
          return;
        }
        const senderProfile = chatData[senderId] || {};
        notificationTitle = String(senderProfile.name || title || "New message")
          .slice(0, 200);
        notificationBody = String(chatData.lastMessage || body).slice(0, 1000);
        normalizedData.chatId = chatId;
        normalizedData.url =
          `/artist/IndividualChat?existingChatId=${encodeURIComponent(chatId)}` +
          `&otherUserId=${encodeURIComponent(senderId)}`;
      } else if (notificationType === "favorite") {
        const senderSnapshot = await db.collection("Users").doc(senderId).get();
        const sender = senderSnapshot.data() || {};
        const followedArtists = Array.isArray(sender.followedArtists)
          ? sender.followedArtists
          : [];
        if (!followedArtists.includes(recipientUserId)) {
          res.status(403).send("Favorite relationship was not found");
          return;
        }
        const senderName = String(sender.name || sender.fullName || "Someone");
        notificationTitle = "Tattoo Masters";
        notificationBody = `${senderName.slice(0, 160)} added you to favorites.`;
        normalizedData.followerId = senderId;
        delete normalizedData.url;
      } else if (notificationType === "tattooLike") {
        const publicationId = normalizedData.publicationId;
        if (!publicationId) {
          res.status(400).send("Missing publicationId");
          return;
        }
        const [publicationSnapshot, senderSnapshot] = await Promise.all([
          db.collection("publications").doc(publicationId).get(),
          db.collection("Users").doc(senderId).get(),
        ]);
        const publication = publicationSnapshot.data() || {};
        const sender = senderSnapshot.data() || {};
        const likedItems = Array.isArray(sender.likedItems) ? sender.likedItems : [];
        if (
          !publicationSnapshot.exists ||
          publication.userId !== recipientUserId ||
          !likedItems.includes(publicationId)
        ) {
          res.status(403).send("Publication like was not found");
          return;
        }
        const senderName = String(sender.name || sender.fullName || "Someone");
        notificationTitle = "Tattoo Masters";
        notificationBody = `${senderName.slice(0, 160)} liked your photo.`;
        normalizedData.url =
          `/artist/TattooDetail?id=${encodeURIComponent(publicationId)}`;
      } else {
        res.status(400).send("Unsupported notification type");
        return;
      }

      let tokens: string[] = [];
      if (recipientUserId) {
        const userSnap = await db.collection("Users").doc(recipientUserId).get();
        if (!userSnap.exists) {
          res.status(404).send("Recipient user not found");
          return;
        }
        const userData = userSnap.data() as { fcmTokens?: string[] } | undefined;
        tokens = Array.from(new Set((userData?.fcmTokens || []).filter(Boolean)));
        if (tokens.length === 0) {
          res.status(200).send("No tokens to notify");
          return;
        }
      }

      // Build a cross‑platform message
      const multicast: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: notificationTitle,
          body: notificationBody,
        },
        android: {
          priority: "high",
          notification: {
            channelId: "default",
            sound: "default",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
            },
          },
        },
        data: normalizedData,
      };

      const response = await admin.messaging().sendEachForMulticast(multicast);
      console.log("sendEachForMulticast result", JSON.stringify(response));

      // Remove invalid tokens from Firestore if we addressed by recipientUserId
      if (recipientUserId && response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((r, idx) => {
          if (!r.success) {
            const code = (r.error as any)?.code || "";
            if (
              code.includes("registration-token-not-registered") ||
              code.includes("invalid-registration-token")
            ) {
              invalidTokens.push(tokens[idx]);
            }
          }
        });
        if (invalidTokens.length) {
          console.log("Pruning invalid tokens", invalidTokens);
          await admin
            .firestore()
            .collection("Users")
            .doc(recipientUserId)
            .update({ fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens) });
        }
      }

      res.status(200).json({ success: true, sent: response.successCount, failed: response.failureCount });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).send("Internal Server Error");
    }
  });
});

export * from "./cleanupUserData";
export * from "./deleteUserAccount";
export * from "./syncBlockedUser";

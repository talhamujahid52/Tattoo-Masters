import {
  beginSafetyHydration,
  clearSafetyState,
  markBlocksHydrated,
  markItemReported,
  markReportsHydrated,
  markUserBlocked,
  markUserUnblocked,
  selectBlockedUserIds,
  selectBlockedUsersById,
  selectReportedPublicationIds,
  selectReportedReviewIds,
  selectSafetyHydrated,
  setBlockedUsers,
  setReportedItems,
} from "@/redux/slices/safetySlice";
import { setUserFirestoreData } from "@/redux/slices/userSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import type {
  BlockedUserRecord,
  BlockedUserSnapshot,
  BlockUserInput,
  ReportTargetType,
  SubmitReportInput,
} from "@/types/safety";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const getBlockDocumentId = (
  blockerId: string,
  blockedUserId: string,
) => `${blockerId}__${blockedUserId}`;

export const normalizeReportTargetType = (
  value: string | null | undefined,
): ReportTargetType => {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "review") return "review";
  if (normalized === "user" || normalized === "account") return "user";
  return "publication";
};

const recordFromDocument = (
  document: any,
): BlockedUserRecord | null => {
  const data = document.data();
  if (!data?.blockerId || !data?.blockedUserId) return null;
  return {
    id: document.id,
    ...data,
  } as BlockedUserRecord;
};

/**
 * Starts the two current-user safety subscriptions. Mount this once near the
 * authenticated app root so screens can wait for `safety.hydrated` before
 * rendering user-generated content.
 */
export const useSafetyHydration = (userIdOverride?: string | null) => {
  const dispatch = useDispatch<AppDispatch>();
  const reduxUserId = useSelector((state: RootState) => state.user.user?.uid);
  const userId =
    userIdOverride === undefined ? (reduxUserId ?? null) : userIdOverride;

  useEffect(() => {
    if (!userId) {
      dispatch(clearSafetyState());
      return;
    }

    dispatch(beginSafetyHydration(userId));

    const unsubscribeBlocks = firestore()
      .collection("BlockedUsers")
      .where("blockerId", "==", userId)
      .onSnapshot(
        (snapshot) => {
          const records = snapshot.docs
            .map(recordFromDocument)
            .filter((record): record is BlockedUserRecord => Boolean(record))
            .filter((record) => record.active);
          dispatch(setBlockedUsers(records));
        },
        (error) => {
          console.error("Failed to hydrate blocked users:", error);
          dispatch(markBlocksHydrated());
        },
      );

    const unsubscribeReports = firestore()
      .collection("ReportedItems")
      .where("reportedBy", "==", userId)
      .onSnapshot(
        (snapshot) => {
          const publicationIds: string[] = [];
          const reviewIds: string[] = [];

          snapshot.docs.forEach((document) => {
            const data = document.data();
            const targetId = String(data?.targetId ?? "");
            if (!targetId) return;

            const type = normalizeReportTargetType(data?.type);
            if (type === "publication") publicationIds.push(targetId);
            if (type === "review") reviewIds.push(targetId);
          });

          dispatch(setReportedItems({ publicationIds, reviewIds }));
        },
        (error) => {
          console.error("Failed to hydrate reported items:", error);
          dispatch(markReportsHydrated());
        },
      );

    return () => {
      unsubscribeBlocks();
      unsubscribeReports();
    };
  }, [dispatch, userId]);

  return useSelector((state: RootState) => state.safety.hydrated);
};

const resolveBlockedUserSnapshot = (
  userData: any,
  supplied?: Partial<BlockedUserSnapshot>,
): BlockedUserSnapshot => ({
  name:
    supplied?.name?.trim() ||
    userData?.name?.trim() ||
    userData?.fullName?.trim() ||
    "Deleted account",
  profilePicture:
    supplied?.profilePicture ||
    userData?.profilePictureSmall ||
    userData?.profilePicture ||
    "",
});

export const useSafety = () => {
  const dispatch = useDispatch<AppDispatch>();
  const reduxUser = useSelector((state: RootState) => state.user.user);
  const userFirestore = useSelector(
    (state: RootState) => state.user.userFirestore,
  );
  const blockedUserIds = useSelector(selectBlockedUserIds);
  const blockedUsersById = useSelector(selectBlockedUsersById);
  const reportedPublicationIds = useSelector(selectReportedPublicationIds);
  const reportedReviewIds = useSelector(selectReportedReviewIds);
  const hydrated = useSelector(selectSafetyHydrated);
  const currentUserId = reduxUser?.uid ?? auth().currentUser?.uid ?? null;

  const blockUser = useCallback(
    async (input: BlockUserInput) => {
      if (!currentUserId) throw new Error("Authentication required");
      if (!input.blockedUserId) throw new Error("A user is required");
      if (input.blockedUserId === currentUserId) {
        throw new Error("You cannot block your own account");
      }

      const blockRef = firestore()
        .collection("BlockedUsers")
        .doc(getBlockDocumentId(currentUserId, input.blockedUserId));
      const blockerRef = firestore().collection("Users").doc(currentUserId);
      const blockedUserRef = firestore()
        .collection("Users")
        .doc(input.blockedUserId);

      let blockedUserData: any = null;
      try {
        const blockedUserDocument = await blockedUserRef.get();
        blockedUserData = blockedUserDocument.data();
      } catch (error) {
        console.log("Could not load blocked-user profile snapshot:", error);
      }

      const blockedUserSnapshot = resolveBlockedUserSnapshot(
        blockedUserData,
        input.blockedUserSnapshot,
      );

      const transactionResult = await firestore().runTransaction(
        async (transaction) => {
          const [blockDocument, blockerDocument, blockedUserDocument] =
            await Promise.all([
              transaction.get(blockRef),
              transaction.get(blockerRef),
              transaction.get(blockedUserRef),
            ]);
          const existing = blockDocument.data() as
            | Partial<BlockedUserRecord>
            | undefined;
          if (blockDocument.exists && existing?.active) {
            return { alreadyBlocked: true, unfollowed: false };
          }

          const blockerData = blockerDocument.data() as any;
          const blockedUserProfile = blockedUserDocument.data() as any;
          const followedArtists: string[] = Array.isArray(
            blockerData?.followedArtists,
          )
            ? blockerData.followedArtists
            : [];
          const unfollowed = followedArtists.includes(input.blockedUserId);

          const timestamp = firestore.FieldValue.serverTimestamp();
          const blockData: Record<string, unknown> = {
            active: true,
            reason: input.reason,
            sourceType: input.sourceType,
            sourceId: input.sourceId ?? null,
            blockedUserSnapshot,
            updatedAt: timestamp,
            unblockedAt: null,
          };
          if (blockDocument.exists) {
            transaction.update(blockRef, blockData);
          } else {
            transaction.set(blockRef, {
              ...blockData,
              blockerId: currentUserId,
              blockedUserId: input.blockedUserId,
              createdAt: timestamp,
              moderationStatus: "pending",
              developerNotificationStatus: "pending",
              developerNotifiedAt: null,
            });
          }
          if (unfollowed) {
            transaction.update(blockerRef, {
              followedArtists: followedArtists.filter(
                (artistId) => artistId !== input.blockedUserId,
              ),
            });
            if ((blockedUserProfile?.followersCount ?? 0) > 0) {
              transaction.update(blockedUserRef, {
                followersCount: firestore.FieldValue.increment(-1),
              });
            }
          }

          return {
            alreadyBlocked: false,
            unfollowed,
            moderationStatus: existing?.moderationStatus ?? "pending",
            developerNotificationStatus:
              existing?.developerNotificationStatus ?? "pending",
            developerNotifiedAt: existing?.developerNotifiedAt ?? null,
          };
        },
      );

      if (transactionResult.alreadyBlocked) {
        return { status: "already_blocked" as const, unfollowed: false };
      }

      const localRecord: BlockedUserRecord = {
        id: blockRef.id,
        blockerId: currentUserId,
        blockedUserId: input.blockedUserId,
        active: true,
        reason: input.reason,
        sourceType: input.sourceType,
        sourceId: input.sourceId ?? null,
        blockedUserSnapshot,
        createdAt: null,
        updatedAt: null,
        unblockedAt: null,
        moderationStatus: transactionResult.moderationStatus as
          | "pending"
          | "reviewed"
          | "actioned",
        developerNotificationStatus:
          transactionResult.developerNotificationStatus as
            | "pending"
            | "sent"
            | "failed",
        developerNotifiedAt: transactionResult.developerNotifiedAt as any,
      };
      dispatch(markUserBlocked(localRecord));

      if (transactionResult.unfollowed && userFirestore) {
        dispatch(
          setUserFirestoreData({
            ...userFirestore,
            followedArtists: (userFirestore.followedArtists ?? []).filter(
              (artistId: string) => artistId !== input.blockedUserId,
            ),
          }),
        );

      }

      return {
        status: "blocked" as const,
        unfollowed: transactionResult.unfollowed,
      };
    },
    [currentUserId, dispatch, userFirestore],
  );

  const unblockUser = useCallback(
    async (blockedUserId: string) => {
      if (!currentUserId) throw new Error("Authentication required");
      if (!blockedUserId) throw new Error("A user is required");

      const blockRef = firestore()
        .collection("BlockedUsers")
        .doc(getBlockDocumentId(currentUserId, blockedUserId));

      const didUnblock = await firestore().runTransaction(
        async (transaction) => {
          const document = await transaction.get(blockRef);
          const data = document.data();
          if (!document.exists || data?.blockerId !== currentUserId) {
            throw new Error("This blocked-user record was not found");
          }
          if (!data?.active) return false;

          transaction.update(blockRef, {
            active: false,
            updatedAt: firestore.FieldValue.serverTimestamp(),
            unblockedAt: firestore.FieldValue.serverTimestamp(),
          });
          return true;
        },
      );

      if (didUnblock) dispatch(markUserUnblocked(blockedUserId));
      return didUnblock;
    },
    [currentUserId, dispatch],
  );

  const submitReport = useCallback(
    async (input: SubmitReportInput) => {
      if (!currentUserId) throw new Error("Authentication required");
      if (!input.targetId) throw new Error("The reported item is missing");
      if (!input.reason.trim()) throw new Error("Select a reason to continue");

      const report = await firestore().collection("ReportedItems").add({
        reportedBy: currentUserId,
        type: input.type,
        targetId: input.targetId,
        targetOwnerId: input.targetOwnerId,
        reason: input.reason.trim(),
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      dispatch(markItemReported({ type: input.type, targetId: input.targetId }));
      return report.id;
    },
    [currentUserId, dispatch],
  );

  return {
    currentUserId,
    blockedUserIds,
    blockedUsersById,
    reportedPublicationIds,
    reportedReviewIds,
    hydrated,
    isUserBlocked: (userId: string) => blockedUserIds.includes(userId),
    blockUser,
    unblockUser,
    submitReport,
  };
};

export default useSafety;

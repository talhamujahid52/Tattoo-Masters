import { useSelector, useStore } from "react-redux";
import type { Store } from "@reduxjs/toolkit";
import firestore from "@react-native-firebase/firestore";
import { setUserFirestoreData } from "@/redux/slices/userSlice";
import type { RootState } from "@/redux/store";
import { UserFirestore } from "@/types/user";
import { sendUserNotification } from "@/utils/notifications";

// The latest tapped state per user+artist, and the sync carrying it to
// Firestore. Shared across hook instances so rapid taps collapse into one
// in-order sync instead of racing transactions.
const desiredFollowState = new Map<string, boolean>();
const activeSyncs = new Map<string, Promise<boolean>>();

const clearSync = (key: string) => {
  desiredFollowState.delete(key);
  activeSyncs.delete(key);
};

const setLocalFollow = (
  store: Store<RootState>,
  userId: string,
  artistId: string,
  following: boolean,
) => {
  const current = store.getState().user.userFirestore;
  if (!current || current.uid !== userId) return;

  const others = (current.followedArtists || []).filter(
    (id: string) => id !== artistId,
  );
  store.dispatch(
    setUserFirestoreData({
      ...current,
      followedArtists: following ? [...others, artistId] : others,
    }),
  );
};

const writeFollow = (userId: string, artistId: string, follow: boolean) => {
  const userRef = firestore().collection("Users").doc(userId);
  const artistRef = firestore().collection("Users").doc(artistId);

  return firestore().runTransaction(async (transaction) => {
    const [userDoc, artistDoc] = await Promise.all([
      transaction.get(userRef),
      transaction.get(artistRef),
    ]);
    if (!userDoc.exists || !artistDoc.exists) {
      throw new Error("The selected account is unavailable");
    }

    const userData = userDoc.data() as UserFirestore;
    const artistData = artistDoc.data() as UserFirestore;
    const isFollowing = !!userData.followedArtists?.includes(artistId);
    // Already in the requested state, e.g. changed from another device
    if (isFollowing === follow) {
      return { artistData, userData, becameFollower: false };
    }

    const updatedFollowedArtists = follow
      ? [...(userData.followedArtists || []), artistId]
      : userData.followedArtists.filter((id: string) => id !== artistId);
    const updatedFollowersCount = follow
      ? (artistData.followersCount || 0) + 1
      : Math.max(0, (artistData.followersCount || 1) - 1);

    transaction.update(userRef, {
      followedArtists: updatedFollowedArtists,
    });
    transaction.update(artistRef, {
      followersCount: updatedFollowersCount,
    });

    return { artistData, userData, becameFollower: follow };
  });
};

const notifyFavorited = async (
  userId: string,
  artistId: string,
  userData: UserFirestore,
  artistData: UserFirestore,
) => {
  if (
    artistId === userId ||
    !(artistData?.notificationPreferences?.favorites ?? true)
  ) {
    return;
  }

  try {
    const followerName =
      userData?.name?.trim() || userData?.fullName?.trim() || "Someone";

    const title = "Tattoo Masters";
    const body = `${followerName} added you to favorites.`;
    await sendUserNotification(artistId, title, body, {
      type: "favorite",
      followerId: userId,
    });
  } catch {
    // Failed to send favorites notification
  }
};

// Put the button back to what Firestore has after a failed sync
const restoreFollow = async (
  store: Store<RootState>,
  userId: string,
  artistId: string,
  key: string,
  fallback: boolean,
) => {
  let following = fallback;
  try {
    const snapshot = await firestore().collection("Users").doc(userId).get();
    const latestData = snapshot.data() as UserFirestore | undefined;
    if (latestData) {
      following = !!latestData.followedArtists?.includes(artistId);
    }
  } catch {
    // Fall back to the state from before the taps
  }

  // A newer tap has taken over since the failure
  if (activeSyncs.has(key)) return;
  setLocalFollow(store, userId, artistId, following);
};

const syncFollow = async (
  store: Store<RootState>,
  userId: string,
  artistId: string,
  key: string,
  wasFollowing: boolean,
): Promise<boolean> => {
  try {
    // Keep writing until Firestore matches the most recent tap
    for (;;) {
      const desired = desiredFollowState.get(key) as boolean;
      const result = await writeFollow(userId, artistId, desired);

      if (result.becameFollower) {
        void notifyFavorited(
          userId,
          artistId,
          result.userData,
          result.artistData,
        );
      }

      if (desiredFollowState.get(key) === desired) {
        clearSync(key);
        return desired;
      }
    }
  } catch (error) {
    clearSync(key);
    console.error("Error toggling follow:", error);
    await restoreFollow(store, userId, artistId, key, wasFollowing);
    throw error;
  }
};

const useFollowArtist = () => {
  const store = useStore<RootState>();
  const userFirestore = useSelector((state: any) => state.user.userFirestore);

  // Flips the favorite in Redux right away and syncs Firestore in the
  // background. Resolves with the saved state; rejects after restoring the
  // real state if the sync fails.
  const toggleFollow = async (artistId: string) => {
    const current = store.getState().user.userFirestore;
    if (!current) return;

    const userId: string = current.uid;
    const key = `${userId}:${artistId}`;
    const wasFollowing = !!current.followedArtists?.includes(artistId);

    setLocalFollow(store, userId, artistId, !wasFollowing);
    desiredFollowState.set(key, !wasFollowing);

    let sync = activeSyncs.get(key);
    if (!sync) {
      sync = syncFollow(store, userId, artistId, key, wasFollowing);
      activeSyncs.set(key, sync);
    }
    return sync;
  };

  const isFollowing = (artistId: string): boolean => {
    if (!userFirestore?.followedArtists) return false;
    return userFirestore.followedArtists.includes(artistId);
  };

  return {
    toggleFollow,
    isFollowing,
  };
};

export default useFollowArtist;

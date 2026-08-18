import { useDispatch, useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import { setUserFirestoreData } from "@/redux/slices/userSlice";
import { UserFirestore } from "@/types/user";
import { sendUserNotification } from "@/utils/notifications";

const useFollowArtist = () => {
  const dispatch = useDispatch();
  const userFirestore = useSelector((state: any) => state.user.userFirestore);

  const toggleFollow = async (artistId: string) => {
    if (!userFirestore) return;

    try {
      const userRef = firestore().collection("Users").doc(userFirestore.uid);
      const artistRef = firestore().collection("Users").doc(artistId);

      const result = await firestore().runTransaction(async (transaction) => {
        const [userDoc, artistDoc] = await Promise.all([
          transaction.get(userRef),
          transaction.get(artistRef),
        ]);
        if (!userDoc.exists || !artistDoc.exists) {
          throw new Error("The selected account is unavailable");
        }

        const userData = userDoc.data() as UserFirestore;
        const artistData = artistDoc.data() as UserFirestore;
        const isFollowing = userData.followedArtists?.includes(artistId);
        const updatedFollowedArtists = isFollowing
          ? userData.followedArtists.filter((id: string) => id !== artistId)
          : [...(userData.followedArtists || []), artistId];
        const updatedFollowersCount = isFollowing
          ? Math.max(0, (artistData.followersCount || 1) - 1)
          : (artistData.followersCount || 0) + 1;

        transaction.update(userRef, {
          followedArtists: updatedFollowedArtists,
        });
        transaction.update(artistRef, {
          followersCount: updatedFollowersCount,
        });

        return {
          artistData,
          userData,
          updatedFollowedArtists,
          becameFollower: !isFollowing,
        };
      });

      dispatch(
        setUserFirestoreData({
          ...result.userData,
          followedArtists: result.updatedFollowedArtists,
        })
      );

      if (
        result.becameFollower &&
        artistId !== userFirestore.uid &&
        (result.artistData?.notificationPreferences?.favorites ?? true)
      ) {
        try {
          const followerName =
            result.userData?.name?.trim() ||
            result.userData?.fullName?.trim() ||
            userFirestore?.name?.trim() ||
            "Someone";

          const title = "Tattoo Masters";
          const body = `${followerName} added you to favorites.`;
          await sendUserNotification(artistId, title, body, {
            type: "favorite",
            followerId: userFirestore.uid,
          });
        } catch (notifyError) {
          console.log("Failed to send favorites notification", notifyError);
        }
      }

      return result.becameFollower;
    } catch (error) {
      console.error("Error toggling follow:", error);
      // Revert optimistic Redux update on failure
      try {
        const snapshot = await firestore()
          .collection("Users")
          .doc(userFirestore.uid)
          .get();
        const latestData = (snapshot.data() || {}) as UserFirestore;
        dispatch(
          setUserFirestoreData({
            ...latestData,
          })
        );
      } catch (_) {
        // As a fallback, no-op; UI on specific screens may maintain local state
      }
      throw error;
    }
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

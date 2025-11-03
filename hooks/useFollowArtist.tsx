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

      // Get current user data
      const userDoc = await userRef.get();
      const userData = userDoc.data() as UserFirestore;

      // Get current artist data
      const artistDoc = await artistRef.get();
      const artistData = artistDoc.data() as UserFirestore;

      // Check if user is already following the artist
      const isFollowing = userData.followedArtists?.includes(artistId);

      // Update user's followedArtists array
      const updatedFollowedArtists = isFollowing
        ? userData.followedArtists.filter((id: string) => id !== artistId)
        : [...(userData.followedArtists || []), artistId];

      // Update artist's followersCount
      const updatedFollowersCount = isFollowing
        ? (artistData.followersCount || 1) - 1
        : (artistData.followersCount || 0) + 1;

      // Optimistic: update Redux immediately so UI reflects instantly
      const previousUserData = { ...userData };
      dispatch(
        setUserFirestoreData({
          ...userData,
          followedArtists: updatedFollowedArtists,
        })
      );

      // Persist updates in background
      // Update user document
      await userRef.update({
        followedArtists: updatedFollowedArtists,
      });

      // Update artist document
      await artistRef.update({
        followersCount: updatedFollowersCount,
      });

      const becameFollower = !isFollowing;

      if (
        becameFollower &&
        artistId !== userFirestore.uid &&
        (artistData?.notificationPreferences?.favorites ?? true)
      ) {
        try {
          const followerName =
            userData?.name?.trim() ||
            userData?.fullName?.trim() ||
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

      return becameFollower;
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

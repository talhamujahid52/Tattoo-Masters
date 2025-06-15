import { useDispatch, useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import { setUserFirestoreData } from "@/redux/slices/userSlice";
import { UserFirestore } from "@/types/user";

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

      // Update user document
      await userRef.update({
        followedArtists: updatedFollowedArtists,
      });

      // Update artist document
      await artistRef.update({
        followersCount: updatedFollowersCount,
      });

      // Update Redux store
      dispatch(
        setUserFirestoreData({
          ...userData,
          followedArtists: updatedFollowedArtists,
        })
      );

      return !isFollowing;
    } catch (error) {
      console.error("Error toggling follow:", error);
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
import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";

const useGetReviews = (artistId: any) => {
  const [reviews, setReviews] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!artistId) return;

      try {
        setReviews([]);
        setLoading(true);

        // Fetch reviews for the artist
        const reviewsSnapshot = await firestore()
          .collection("reviews")
          .where("artistId", "==", artistId)
          .get();

        const reviewsData = reviewsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Reviews Data: ", reviewsData);

        // Extract unique userIds from the reviews
        const userIds = [
          ...new Set(reviewsData.map((review: any) => review.user)),
        ];

        console.log("User Ids, ", userIds);

        // Fetch all users in a batch query
        const usersSnapshot = await firestore()
          .collection("Users")
          .where("uid", "in", userIds) // Use 'in' query to fetch all users
          .get();

        // Map the user data into an object for quick access by userId
        const usersData = usersSnapshot.docs.reduce((acc: any, doc: any) => {
          const user = doc.data();
          console.log("USer: ", user);
          acc[user.uid] = user; // Map userId to user data
          return acc;
        }, {});

        console.log("UserData: ", usersData);

        // Now map the reviews to include the corresponding user data
        const reviewsWithUserData = reviewsData.map((review: any) => ({
          ...review,
          userName: usersData[review.user]?.name,
          userProfilePicture: usersData[review.user]?.profilePictureSmall
            ? usersData[review.user]?.profilePictureSmall
            : usersData[review.user]?.profilePicture,
        }));

        setReviews(reviewsWithUserData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [artistId]);

  return { reviews, loading, error };
};

export default useGetReviews;

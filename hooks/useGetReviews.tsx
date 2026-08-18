import { useState, useEffect, useMemo } from "react";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  selectBlockedUserIds,
  selectReportedReviewIds,
  selectSafetyHydrated,
} from "@/redux/slices/safetySlice";
import { filterHiddenReviews } from "@/utils/safetyFilters";

const useGetReviews = (artistId: any) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const currentUserId = useSelector(
    (state: RootState) => state.user.user?.uid,
  );
  const blockedUserIds = useSelector(selectBlockedUserIds);
  const reportedReviewIds = useSelector(selectReportedReviewIds);
  const safetyHydrated = useSelector(selectSafetyHydrated);

  useEffect(() => {
    let cancelled = false;

    const fetchReviews = async () => {
      if (!artistId) {
        setReviews([]);
        setLoading(false);
        return;
      }

      try {
        setReviews([]);
        setError(null);
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

        // Extract unique userIds from the reviews
        const userIds = ([
          ...new Set(reviewsData.map((review: any) => review.user)),
        ] as unknown[]).filter(
          (userId): userId is string =>
            typeof userId === "string" && userId.length > 0,
        );

        // Firestore caps `in` queries, so fetch reviewers in safe chunks. An
        // artist with no reviews skips the query entirely.
        const chunks: string[][] = [];
        for (let index = 0; index < userIds.length; index += 10) {
          chunks.push(userIds.slice(index, index + 10));
        }
        const userSnapshots = await Promise.all(
          chunks.map((userIdChunk) =>
            firestore()
              .collection("Users")
              .where("uid", "in", userIdChunk)
              .get(),
          ),
        );

        // Map the user data into an object for quick access by userId
        const usersData = userSnapshots
          .flatMap((snapshot) => snapshot.docs)
          .reduce((acc: any, doc: any) => {
            const user = doc.data();
            acc[user.uid] = user;
            return acc;
          }, {});

        // Now map the reviews to include the corresponding user data
        const reviewsWithUserData = reviewsData.map((review: any) => ({
          ...review,
          userName: usersData[review.user]?.name,
          userProfilePicture: usersData[review.user]?.profilePictureSmall
            ? usersData[review.user]?.profilePictureSmall
            : usersData[review.user]?.profilePicture,
        }));

        if (!cancelled) setReviews(reviewsWithUserData);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchReviews();

    return () => {
      cancelled = true;
    };
  }, [artistId]);

  const visibleReviews = useMemo(() => {
    if (currentUserId && !safetyHydrated) return [];
    return filterHiddenReviews(
      reviews,
      blockedUserIds,
      reportedReviewIds,
    );
  }, [
    blockedUserIds,
    currentUserId,
    reportedReviewIds,
    reviews,
    safetyHydrated,
  ]);

  return { reviews: visibleReviews, loading, error };
};

export default useGetReviews;

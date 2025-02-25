import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";

export interface Publication {
  caption: string;
  deleteUrls: {
    high: string;
    medium: string;
    small: string;
    veryHigh: string;
  };
  downloadUrls: {
    high: string;
    medium: string;
    small: string;
    veryHigh: string;
  };
  id: string;
  styles: string[];
  timestamp: number;
  userId: string;
  // Add any additional fields as needed
}

/**
 * Custom hook to listen for realtime updates on a user's liked publications.
 * It first listens to the user's document to get liked publication IDs,
 * then listens to the publications collection for those IDs.
 *
 * @param userId The user ID to fetch liked publications for.
 * @returns An object with likedPublications, loading, and error.
 */
export const useRealtimeUserLikedPublications = (userId: string) => {
  const [likedPublications, setLikedPublications] = useState<Publication[]>([]);
  const [likedPublicationIds, setLikedPublicationIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Listen for realtime changes on the user's document to fetch liked IDs.
  useEffect(() => {
    if (!userId) {
      setLikedPublicationIds([]);
      setLoading(false);
      return;
    }

    const userDocRef = firestore().collection("Users").doc(userId);
    const unsubscribeUser = userDocRef.onSnapshot(
      (doc) => {
        if (doc.exists) {
          const data = doc.data() || {};
          // Assume the field is named "likedTattoos". Adjust if necessary.
          const ids: string[] = data.likedItems || [];

          setLikedPublicationIds(ids);
        } else {
          setLikedPublicationIds([]);
        }
      },
      (err) => {
        console.error("Error listening to user document:", err);
        setError(err);
      },
    );

    return () => unsubscribeUser();
  }, [userId]);

  // Listen for realtime changes on the publications with the liked IDs.
  useEffect(() => {
    // If there are no liked IDs, clear publications and finish loading.
    if (!likedPublicationIds || likedPublicationIds.length === 0) {
      setLikedPublications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Firestore "in" queries support up to 10 items.
    const query = firestore()
      .collection("publications")
      .where(firestore.FieldPath.documentId(), "in", likedPublicationIds);

    const unsubscribePubs = query.onSnapshot(
      (snapshot) => {
        const pubs: Publication[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Publication[];
        setLikedPublications(pubs);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching liked publications:", err);
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribePubs();
  }, [likedPublicationIds]);

  return { likedPublications, loading, error };
};

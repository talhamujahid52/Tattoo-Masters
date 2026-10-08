import { useState, useEffect, useMemo } from "react";
import firestore from "@react-native-firebase/firestore";
import { useRealtimeDocsByIds } from "@/hooks/useRealtimeDocsByIds";

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
 * @returns An object with likedPublications, loading, error and refresh.
 */
export const useRealtimeUserLikedPublications = (userId: string) => {
  const [likedPublicationIds, setLikedPublicationIds] = useState<string[]>([]);
  // True until the liked IDs have arrived, so an empty list isn't shown first
  const [idsLoading, setIdsLoading] = useState<boolean>(true);
  const [userError, setUserError] = useState<Error | null>(null);

  // Listen for realtime changes on the user's document to fetch liked IDs.
  useEffect(() => {
    if (!userId) {
      setLikedPublicationIds([]);
      setIdsLoading(false);
      return;
    }

    setIdsLoading(true);

    const userDocRef = firestore().collection("Users").doc(userId);
    const unsubscribeUser = userDocRef.onSnapshot(
      (doc) => {
        if (doc.exists) {
          const data = doc.data() || {};
          const ids: string[] = data.likedItems || [];

          setLikedPublicationIds(ids);
        } else {
          setLikedPublicationIds([]);
        }
        setIdsLoading(false);
      },
      (err) => {
        console.error("Error listening to user document:", err);
        setUserError(err);
        setIdsLoading(false);
      },
    );

    return () => unsubscribeUser();
  }, [userId]);

  // Listen for realtime changes on the publications with the liked IDs.
  const {
    docs,
    loading,
    error: publicationsError,
    refresh,
  } = useRealtimeDocsByIds("publications", likedPublicationIds);

  const likedPublications = useMemo(
    () => docs.map(({ id, data }) => ({ id, ...data })) as Publication[],
    [docs],
  );

  return {
    likedPublications,
    loading: idsLoading || loading,
    error: userError ?? publicationsError,
    refresh,
  };
};

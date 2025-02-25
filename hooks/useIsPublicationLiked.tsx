import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";

/**
 * Custom hook to listen for realtime updates to determine if a publication is liked by the user.
 *
 * @param publicationId - The ID of the publication.
 * @param userId - The ID of the user document in Firestore.
 * @returns A boolean indicating whether the publication is liked.
 */
export const useIsPublicationLiked = (
  publicationId: string,
  userId: string,
) => {
  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    const userDocRef = firestore().collection("Users").doc(userId);
    // Attach a realtime listener to the user document.
    const unsubscribe = userDocRef.onSnapshot(
      (doc) => {
        if (doc.exists) {
          const data = doc.data();
          const likedItems: string[] = data?.likedItems || [];
          setIsLiked(likedItems.includes(publicationId));
        }
      },
      (error) => {
        console.error("Error listening to user liked items:", error);
      },
    );

    // Clean up the listener on unmount.
    return () => unsubscribe();
  }, [publicationId, userId]);

  return isLiked;
};

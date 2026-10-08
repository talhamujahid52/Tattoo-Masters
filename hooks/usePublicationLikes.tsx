import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";

// Returns undefined until the first snapshot arrives.
const usePublicationLikes = (publicationId: string): number | undefined => {
  const [likes, setLikes] = useState<number | undefined>(undefined);

  useEffect(() => {
    const publicationRef = firestore()
      .collection("publications")
      .doc(publicationId);
    const unsubscribe = publicationRef.onSnapshot(
      (docSnapshot) => {
        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          setLikes(data?.likes ?? 0);
        } else {
          setLikes(0);
        }
      },
      (error) => {
        console.error("Error listening for publication likes:", error);
        setLikes((prev) => prev ?? 0);
      },
    );
    return () => unsubscribe();
  }, [publicationId]);

  return likes;
};

export default usePublicationLikes;

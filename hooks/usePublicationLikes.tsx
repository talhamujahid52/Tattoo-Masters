import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";

const usePublicationLikes = (publicationId: string): number => {
  const [likes, setLikes] = useState<number>(0);

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
      },
    );
    return () => unsubscribe();
  }, [publicationId]);

  return likes;
};

export default usePublicationLikes;

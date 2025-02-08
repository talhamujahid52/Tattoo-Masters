import { useCallback } from "react";
import firestore from "@react-native-firebase/firestore";

const useChats = (userId: string) => {
  const checkIfChatExists = useCallback(
    async (otherUserId: string) => {
      try {
        const chatSnapshot = await firestore()
          .collection("Chats")
          .where("participants", "array-contains", userId)
          .get();

        const validChats = chatSnapshot.docs.filter((doc) => {
          const participants = doc.data().participants;
          return (
            participants.includes(userId) && participants.includes(otherUserId)
          );
        });

        // console.log("Valid Chats ", validChats[0]);
        return validChats.length > 0 ? validChats[0] : null;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    [userId]
  );

  return {
    checkIfChatExists,
  };
};

export default useChats;

import { useCallback } from "react";
import firestore from "@react-native-firebase/firestore";
import { useDispatch } from "react-redux";
import { updateAllChats } from "@/redux/slices/chatSlice";
import { IMessage } from "react-native-gifted-chat";

const useChats = (userId: string) => {
  const dispatch = useDispatch();

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

        return validChats.length > 0 ? validChats[0] : null;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    [userId]
  );

  const fetchChats = useCallback(async () => {
    try {
      const chatsSnapshot = await firestore()
        .collection("Chats")
        .where("participants", "array-contains", userId)
        .get();

      const chatsList = chatsSnapshot.docs.map((doc) => {
        const chatData = doc.data();
        const id = doc.id;
        return { ...chatData, id };
      });

      console.log("Chats List Fetched: ", chatsList);
      dispatch(updateAllChats(chatsList));
      return chatsList;
    } catch (error) {
      console.error("Error fetching chats: ", error);
      return [];
    }
  }, [userId, dispatch]);

  const fetchChatMessages = useCallback(async (chatId: string) => {
    try {
      const snapshot = await firestore()
        .collection("Chats")
        .doc(chatId)
        .collection("messages")
        .get();
  
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => ({
            id: doc.id,
          ...doc.data(),
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching messages: ", error);
      return [];
    }
  }, []);

  const createChat = useCallback(
    async (selectedArtist: any, loggedInUser: any) => {
      try {
        const newChatRef = await firestore()
          .collection("Chats")
          .add({
            createdAt: firestore.FieldValue.serverTimestamp(),
            participants: [loggedInUser.uid, selectedArtist.id],
            [loggedInUser.uid]: {
              name: loggedInUser?.name || "",
              profilePicture: loggedInUser?.profilePicture || "",
            },
            [selectedArtist.id]: {
              name: selectedArtist?.data?.name || "",
              profilePicture: selectedArtist?.data?.profilePicture || "",
            },
          });
        return { id: newChatRef.id };
      } catch (error) {
        console.error("Error creating new chat:", error);
        throw new Error("Failed to create new chat");
      }
    },
    []
  );

  const addMessageToChat = useCallback(
    async (newMessages: IMessage[], currentChatID: string) => {
      try {
        await Promise.all(
          newMessages.map(async (message) => {
            const docRef = await firestore()
              .collection("Chats")
              .doc(currentChatID)
              .collection("messages")
              .add({
                _id: message._id,
                text: message.text,
                createdAt: message.createdAt,
                user: message.user,
              });

            await firestore().collection("Chats").doc(currentChatID).update({
              lastMessage: message.text,
              lastMessageTime: message.createdAt,
            });
          })
        );
      } catch (error) {
        console.error("Error adding message: ", error);
      }
    },
    []
  );

  return {
    checkIfChatExists,
    fetchChats,
    fetchChatMessages,
    createChat,
    addMessageToChat,
  };
};

export default useChats;

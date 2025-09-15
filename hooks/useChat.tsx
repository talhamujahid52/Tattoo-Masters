import { useCallback } from "react";
import firestore from "@react-native-firebase/firestore";
import { useDispatch } from "react-redux";
import { updateAllChats } from "@/redux/slices/chatSlice";
import { IMessage } from "react-native-gifted-chat";
import { sendChatNotification } from "@/utils/notifications";

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

  const fetchChats = useCallback(() => {
    // Return the unsubscribe function from onSnapshot
    return firestore()
      .collection("Chats")
      .where("participants", "array-contains", userId)
      .orderBy("lastMessageTime", "desc")

      .onSnapshot(
        (snapshot) => {
          const chatsList = snapshot.docs.map((doc) => {
            const chatData = doc.data();
            const id = doc.id;
            return { ...chatData, id };
          });

          console.log("Chats List Updated: ", chatsList);
          dispatch(updateAllChats(chatsList));
        },
        (error) => {
          console.error("Error fetching chats: ", error);
        }
      );
  }, [userId, dispatch]);

  const fetchChatMessages = useCallback(async (chatId: string) => {
    try {
      const snapshot = await firestore()
        .collection("Chats")
        .doc(chatId)
        .collection("messages")
        .orderBy("createdAt", "desc")
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

  const listenToMessages = useCallback(
    (chatId: string, onUpdate: (msgs: IMessage[]) => void) => {
      return firestore()
        .collection("Chats")
        .doc(chatId)
        .collection("messages")
        .orderBy("createdAt", "desc")
        .onSnapshot(
          (snapshot) => {
            const messages = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                _id: doc.id,
                text: data.text,
                createdAt: data.createdAt?.toDate?.() ?? new Date(),
                user: data.user,
              };
            });

            onUpdate(messages);
          },
          (error) => {
            console.error("Error listening to messages:", error);
          }
        );
    },
    []
  );

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

            // Determine the recipient and send a push notification via Cloud Function
            try {
              const chatSnap = await firestore()
                .collection("Chats")
                .doc(currentChatID)
                .get();
              const participants: string[] = chatSnap.data()?.participants || [];
              const senderId = (message.user as any)?._id as string;
              const recipientId = participants.find((p) => p !== senderId);
              if (recipientId) {
                const chatData = chatSnap.data() || {};
                const senderProfile = chatData?.[senderId] || {};
                const senderName =
                  senderProfile?.name || (message.user as any)?.name || "New message";
                const preview = (message.text || "").toString();
                await sendChatNotification(
                  recipientId,
                  senderName,
                  preview,
                  {
                    chatId: currentChatID,
                    senderId,
                    type: "chatMessage",
                    url: `/artist/IndividualChat?existingChatId=${currentChatID}&otherUserId=${senderId}`,
                  } as any
                );
              }
            } catch (notifyErr) {
              console.log("Failed to send chat push notification", notifyErr);
            }
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
    listenToMessages, // ✅ NEW
  };
};

export default useChats;

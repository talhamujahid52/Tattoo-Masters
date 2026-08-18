import { useCallback } from "react";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { useDispatch } from "react-redux";
import { updateAllChats } from "@/redux/slices/chatSlice";
import { IMessage } from "react-native-gifted-chat";
import { sendChatNotification } from "@/utils/notifications";

export const CHAT_UNAVAILABLE_MESSAGE = "This conversation is unavailable.";

export type ChatRelationship = {
  loading: boolean;
  blockedByCurrentUser: boolean;
  blockedByOtherUser: boolean;
  canSend: boolean;
};

const blockDocumentId = (blockerId: string, blockedUserId: string) =>
  `${blockerId}__${blockedUserId}`;

const activeFromSnapshot = (
  snapshot: FirebaseFirestoreTypes.DocumentSnapshot,
) => snapshot.exists && snapshot.data()?.active === true;

export const getChatRelationship = async (
  currentUserId: string,
  otherUserId: string,
): Promise<ChatRelationship> => {
  if (!currentUserId || !otherUserId || currentUserId === otherUserId) {
    return {
      loading: false,
      blockedByCurrentUser: false,
      blockedByOtherUser: false,
      canSend: false,
    };
  }

  const [forwardBlock, reverseBlock] = await Promise.all([
    firestore()
      .collection("BlockedUsers")
      .doc(blockDocumentId(currentUserId, otherUserId))
      .get(),
    firestore()
      .collection("BlockedUsers")
      .doc(blockDocumentId(otherUserId, currentUserId))
      .get(),
  ]);
  const blockedByCurrentUser = activeFromSnapshot(forwardBlock);
  const blockedByOtherUser = activeFromSnapshot(reverseBlock);

  return {
    loading: false,
    blockedByCurrentUser,
    blockedByOtherUser,
    canSend: !blockedByCurrentUser && !blockedByOtherUser,
  };
};

export const getChatAccess = async (
  currentUserId: string,
  chatId: string,
): Promise<ChatRelationship & { hidden: boolean; otherUserId?: string }> => {
  if (!currentUserId || !chatId) {
    return {
      loading: false,
      blockedByCurrentUser: false,
      blockedByOtherUser: false,
      canSend: false,
      hidden: true,
    };
  }

  const chatSnapshot = await firestore().collection("Chats").doc(chatId).get();
  if (!chatSnapshot.exists) {
    return {
      loading: false,
      blockedByCurrentUser: false,
      blockedByOtherUser: false,
      canSend: false,
      hidden: true,
    };
  }

  const chat = chatSnapshot.data() || {};
  const participants: string[] = Array.isArray(chat.participants)
    ? chat.participants
    : [];
  if (!participants.includes(currentUserId)) {
    return {
      loading: false,
      blockedByCurrentUser: false,
      blockedByOtherUser: false,
      canSend: false,
      hidden: true,
    };
  }

  const otherUserId = participants.find((participant) => participant !== currentUserId);
  if (!otherUserId) {
    return {
      loading: false,
      blockedByCurrentUser: false,
      blockedByOtherUser: false,
      canSend: false,
      hidden: true,
    };
  }

  const relationship = await getChatRelationship(currentUserId, otherUserId);
  const hiddenFor: string[] = Array.isArray(chat.hiddenFor) ? chat.hiddenFor : [];
  const disabledParticipants: string[] = Array.isArray(chat.disabledParticipants)
    ? chat.disabledParticipants
    : [];

  return {
    ...relationship,
    otherUserId,
    hidden: hiddenFor.includes(currentUserId) || relationship.blockedByCurrentUser,
    canSend:
      relationship.canSend && !disabledParticipants.includes(currentUserId),
  };
};

const useChats = (userId?: string) => {
  const dispatch = useDispatch();

  const checkIfChatExists = useCallback(
    async (otherUserId: string) => {
      if (!userId || !otherUserId) return null;
      try {
        const relationship = await getChatRelationship(userId, otherUserId);

        const chatSnapshot = await firestore()
          .collection("Chats")
          .where("participants", "array-contains", userId)
          .get();

        const validChats = chatSnapshot.docs.filter((doc) => {
          const chat = doc.data();
          const participants: string[] = Array.isArray(chat.participants)
            ? chat.participants
            : [];
          const hiddenFor: string[] = Array.isArray(chat.hiddenFor)
            ? chat.hiddenFor
            : [];
          return (
            participants.includes(otherUserId) && !hiddenFor.includes(userId)
          );
        });

        if (validChats.length > 0) return validChats[0];
        if (!relationship.canSend) {
          throw new Error(CHAT_UNAVAILABLE_MESSAGE);
        }
        return null;
      } catch (error) {
        console.error("Error checking chat:", error);
        throw error;
      }
    },
    [userId],
  );

  const fetchChats = useCallback(() => {
    if (!userId) {
      dispatch(updateAllChats([]));
      return () => undefined;
    }

    return firestore()
      .collection("Chats")
      .where("participants", "array-contains", userId)
      .orderBy("lastMessageTime", "desc")
      .onSnapshot(
        (snapshot) => {
          const chatsList: any[] = snapshot.docs
            .map<any>((doc) => ({ ...doc.data(), id: doc.id }))
            .filter((chat: any) => {
              const hiddenFor: string[] = Array.isArray(chat.hiddenFor)
                ? chat.hiddenFor
                : [];
              return !hiddenFor.includes(userId);
            });

          dispatch(updateAllChats(chatsList));
        },
        (error) => {
          console.error("Error fetching chats: ", error);
        },
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

      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching messages: ", error);
      return [];
    }
  }, []);

  const listenToMessages = useCallback(
    (chatId: string, onUpdate: (msgs: IMessage[]) => void) =>
      firestore()
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
                text: data.text || "",
                createdAt: data.createdAt?.toDate?.() ?? new Date(),
                user: data.user,
                image: data.image || undefined,
                pending: data.pending || false,
              };
            });
            onUpdate(messages);
          },
          (error) => console.error("Error listening to messages:", error),
        ),
    [],
  );

  const listenToBlockRelationship = useCallback(
    (
      otherUserId: string,
      onUpdate: (relationship: ChatRelationship) => void,
    ) => {
      if (!userId || !otherUserId || userId === otherUserId) {
        onUpdate({
          loading: false,
          blockedByCurrentUser: false,
          blockedByOtherUser: false,
          canSend: false,
        });
        return () => undefined;
      }

      let forwardLoaded = false;
      let reverseLoaded = false;
      let blockedByCurrentUser = false;
      let blockedByOtherUser = false;
      let lookupFailed = false;

      const emit = () => {
        if (!forwardLoaded || !reverseLoaded) return;
        onUpdate({
          loading: false,
          blockedByCurrentUser,
          blockedByOtherUser,
          canSend:
            !lookupFailed && !blockedByCurrentUser && !blockedByOtherUser,
        });
      };

      const handleError = (direction: "forward" | "reverse", error: Error) => {
        console.error("Error listening to block relationship:", error);
        lookupFailed = true;
        if (direction === "forward") forwardLoaded = true;
        if (direction === "reverse") reverseLoaded = true;
        emit();
      };

      const unsubscribeForward = firestore()
        .collection("BlockedUsers")
        .doc(blockDocumentId(userId, otherUserId))
        .onSnapshot(
          (snapshot) => {
            forwardLoaded = true;
            blockedByCurrentUser = activeFromSnapshot(snapshot);
            emit();
          },
          (error) => handleError("forward", error),
        );
      const unsubscribeReverse = firestore()
        .collection("BlockedUsers")
        .doc(blockDocumentId(otherUserId, userId))
        .onSnapshot(
          (snapshot) => {
            reverseLoaded = true;
            blockedByOtherUser = activeFromSnapshot(snapshot);
            emit();
          },
          (error) => handleError("reverse", error),
        );

      return () => {
        unsubscribeForward();
        unsubscribeReverse();
      };
    },
    [userId],
  );

  const createChat = useCallback(
    async (selectedArtist: any, loggedInUser: any) => {
      const currentUserId = loggedInUser?.uid || userId;
      const otherUserId = selectedArtist?.id;
      if (!currentUserId || !otherUserId || currentUserId === otherUserId) {
        throw new Error("Unable to create this conversation.");
      }

      const relationship = await getChatRelationship(currentUserId, otherUserId);
      if (!relationship.canSend) throw new Error(CHAT_UNAVAILABLE_MESSAGE);

      const newChatRef = await firestore()
        .collection("Chats")
        .add({
          createdAt: firestore.FieldValue.serverTimestamp(),
          participants: [currentUserId, otherUserId],
          [currentUserId]: {
            name: loggedInUser?.name || loggedInUser?.displayName || "",
            profilePicture:
              loggedInUser?.profilePicture || loggedInUser?.photoURL || "",
          },
          [otherUserId]: {
            name: selectedArtist?.data?.name || "",
            profilePicture: selectedArtist?.data?.profilePicture || "",
          },
        });
      return { id: newChatRef.id };
    },
    [userId],
  );

  const addMessageToChat = useCallback(
    async (newMessages: IMessage[], currentChatID: string) => {
      if (!userId) throw new Error(CHAT_UNAVAILABLE_MESSAGE);

      const chatReference = firestore().collection("Chats").doc(currentChatID);
      const chatSnapshot = await chatReference.get();
      if (!chatSnapshot.exists) throw new Error(CHAT_UNAVAILABLE_MESSAGE);

      const chatData = chatSnapshot.data() || {};
      const participants: string[] = Array.isArray(chatData.participants)
        ? chatData.participants
        : [];
      const recipientId = participants.find((participant) => participant !== userId);
      const disabledParticipants: string[] = Array.isArray(chatData.disabledParticipants)
        ? chatData.disabledParticipants
        : [];
      if (!participants.includes(userId) || !recipientId || disabledParticipants.length > 0) {
        throw new Error(CHAT_UNAVAILABLE_MESSAGE);
      }

      const relationship = await getChatRelationship(userId, recipientId);
      if (!relationship.canSend) throw new Error(CHAT_UNAVAILABLE_MESSAGE);

      for (const message of newMessages) {
        const senderId = String((message.user as any)?._id || "");
        if (senderId !== userId) throw new Error(CHAT_UNAVAILABLE_MESSAGE);

        const messageData: any = {
          _id: message._id,
          text: message.text || "",
          createdAt: message.createdAt,
          user: message.user,
        };
        if (message.image) {
          messageData.image = message.image;
          messageData.pending = true;
        }

        const lastMessageText = message.image ? "Image" : message.text || "";
        const batch = firestore().batch();
        batch.set(
          chatReference.collection("messages").doc(message._id as string),
          messageData,
        );
        batch.update(chatReference, {
          lastMessage: lastMessageText,
          lastMessageTime: message.createdAt,
        });
        await batch.commit();

        try {
          const senderProfile = chatData?.[senderId] || {};
          const senderName =
            senderProfile?.name || (message.user as any)?.name || "New message";
          await sendChatNotification(
            recipientId,
            senderName,
            message.image ? "Sent an image" : String(message.text || ""),
            {
              chatId: currentChatID,
              senderId,
              type: "chatMessage",
              url: `/artist/IndividualChat?existingChatId=${currentChatID}&otherUserId=${senderId}`,
            },
          );
        } catch (notificationError) {
          console.log("Failed to send chat push notification", notificationError);
        }
      }
    },
    [userId],
  );

  return {
    checkIfChatExists,
    fetchChats,
    fetchChatMessages,
    createChat,
    addMessageToChat,
    listenToMessages,
    listenToBlockRelationship,
  };
};

export default useChats;

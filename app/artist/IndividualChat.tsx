import React, { useState, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import Text from "@/components/Text";
import useChats from "@/hooks/useChat";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { router, useLocalSearchParams } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import useGetArtist from "@/hooks/useGetArtist";

const Example: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [chatID, setChatID] = useState<any>();
  const [messageRecieverName, setMessageRecieverName] = useState("");
  const [messageRecieverProfilePicture, setMessageRecieverProfilePicture] =
    useState("");

  const {
    selectedArtistId,
    existingChatId,
    otherUserName,
    otherUserProfilePicture,
  } = useLocalSearchParams<any>();

  const loggedInUser = useSelector((state: any) => state?.user?.user);

  const { checkIfChatExists } = useChats(loggedInUser.uid);
  const selectedArtist = useGetArtist(selectedArtistId);

  useEffect(() => {
    if (selectedArtistId) {
      // If Click on Artist.
      const fetchMessagesIfChatExists = async () => {
        try {
          const artistChat = await checkIfChatExists(selectedArtistId);

          setMessageRecieverName(artistChat?.data()?.[selectedArtistId]?.name);
          setMessageRecieverProfilePicture(
            artistChat?.data()?.[selectedArtistId]?.profilePicture
          );

          if (artistChat?.exists) {
            setChatID(artistChat.id);
            fetchChatMessages(artistChat.id);
          }
        } catch (error) {
          console.error("Error checking if chat exists: ", error);
        }
      };

      fetchMessagesIfChatExists();
    } else if (existingChatId) {
      // If Click on Already Existing Chat.
      console.log("Existing Chat Id, ", existingChatId);
      setChatID(existingChatId);
      fetchChatMessages(existingChatId);
      setMessageRecieverName(otherUserName);
      setMessageRecieverProfilePicture(otherUserProfilePicture);
    }
  }, [selectedArtistId, existingChatId]);

  const fetchChatMessages = async (chatId: any) => {
    try {
      const snapshot = await firestore()
        .collection("Chats")
        .doc(chatId)
        .collection("messages")
        .get();

      if (!snapshot.empty) {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messages);
        console.log("Messages fetched for chat ID: ", chatId, " ", messages);
      } else {
        console.log("No messages found");
      }
    } catch (error) {
      console.error("Error fetching messages: ", error);
    }
  };

  const addMessageToChat = async (newMessages: any, currentChatID: string) => {
    try {
      await Promise.all(
        newMessages.map(async (message: any) => {
          console.log(
            "Adding message:",
            message,
            "to chat chatID ",
            currentChatID
          );

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

          // console.log("Message successfully added with ID: ", docRef.id);

          await firestore().collection("Chats").doc(currentChatID).update({
            lastMessage: message.text,
            lastMessageTime: message.createdAt,
          });

          console.log("Chat updated with last message.");
        })
      );
    } catch (error) {
      console.error("Error adding message: ", error);
    }
  };

  const createChat = async () => {
    const loggedInUserID = loggedInUser.uid;
    console.log("Loggedin user : ", loggedInUser);
    console.log("Loggedin user : ", loggedInUser?.name);
    console.log("Loggedin user : ", loggedInUser?.photoURL);

    try {
      const newChatRef = await firestore()
        .collection("Chats")
        .add({
          createdAt: firestore.FieldValue.serverTimestamp(),
          participants: [loggedInUserID, selectedArtistId],
          [loggedInUserID]: {
            name: loggedInUser?.displayName ? loggedInUser?.displayName : "",
            profilePicture: loggedInUser?.photoURL
              ? loggedInUser?.photoURL
              : "",
          },
          [selectedArtistId]: {
            name: selectedArtist?.data?.name ? selectedArtist?.data?.name : "",
            profilePicture: selectedArtist?.data?.profilePicture
              ? selectedArtist?.data?.profilePicture
              : "",
          },
        });
      console.log("New chat created with ID:", newChatRef.id);
      return { id: newChatRef.id };
    } catch (error) {
      console.error("Error creating new chat:", error);
      throw new Error("Failed to create new chat");
    }
  };

  const onSend = useCallback(
    async (newMessages: IMessage[]) => {
      let currentChatID = chatID;
      if (!currentChatID) {
        console.log("NEw Chat ...");
        try {
          const newChat = await createChat();
          currentChatID = newChat.id;
          setChatID(currentChatID); // Update the state after getting the new chat ID
        } catch (error) {
          console.error("Failed to create chat:", error);
          return; // Prevent sending message if chat creation failed
        }
      }

      // Add new message to Firestore
      await addMessageToChat(newMessages, currentChatID);

      // Append new message to local state (UI)
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );
    },
    [chatID]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          style={{ height: 25, width: 25 }}
        >
          <Image
            source={require("../../assets/images/back-arrow.png")}
            style={{ height: "100%", width: "100%", resizeMode: "contain" }}
          />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Image
            source={
              messageRecieverProfilePicture
                ? { uri: messageRecieverProfilePicture }
                : require("../../assets/images/Artist.png")
            }
            style={styles.avatar}
          />
          <View>
            <Text size="p" weight="normal" color="#FBF6FA">
              {messageRecieverName ? messageRecieverName : "Martin Luis"}
            </Text>
            <Text size="medium" weight="normal" color="#A7A7A7">
              Last seen 2m ago
            </Text>
          </View>
        </View>
        <TouchableOpacity style={{ height: 31, width: 31 }}>
          <Image
            source={require("../../assets/images/call.png")}
            style={{ height: "100%", width: "100%", resizeMode: "contain" }}
          />
        </TouchableOpacity>
      </View>

      {/* GiftedChat component */}

      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: loggedInUser.uid,
        }}
        scrollToBottom
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "green",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 5,
    gap: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#2E2E2D",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 5,
  },
});

export default Example;

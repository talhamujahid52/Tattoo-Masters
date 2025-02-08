import React, { useState, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import Text from "@/components/Text";
import useChats from "@/hooks/useChat";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { router, useLocalSearchParams } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import useGetArtist from "@/hooks/useGetArtist";

const IndividualChat: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [chatID, setChatID] = useState<any>();
  const [messageRecieverName, setMessageRecieverName] = useState("");
  const [recieverProfilePicture, setRecieverProfilePicture] = useState("");

  const loggedInUser = useSelector((state: any) => state?.user?.user);
  const { checkIfChatExists, fetchChatMessages, createChat, addMessageToChat } =
    useChats(loggedInUser.uid);

  const {
    selectedArtistId,
    existingChatId,
    otherUserName,
    otherUserProfilePicture,
  } = useLocalSearchParams<any>();
  const selectedArtist = useGetArtist(selectedArtistId);

  useEffect(() => {
    if (selectedArtistId) {
      // If Click on Artist.
      const fetchMessagesIfChatExists = async () => {
        try {
          const artistChat = await checkIfChatExists(selectedArtistId);
          setMessageRecieverName(artistChat?.data()?.[selectedArtistId]?.name);
          setRecieverProfilePicture(
            artistChat?.data()?.[selectedArtistId]?.profilePicture
          );
          if (artistChat?.exists) {
            setChatID(artistChat.id);
            const chatMessages = await fetchChatMessages(artistChat.id);
            setMessages(chatMessages);
          }
        } catch (error) {
          console.error("Error checking if chat exists: ", error);
        }
      };

      fetchMessagesIfChatExists();
    } else if (existingChatId) {
      // If Click on Already Existing Chat.
      setChatID(existingChatId);
      fetchChatMessages(existingChatId).then(setMessages);
      setMessageRecieverName(otherUserName);
      setRecieverProfilePicture(otherUserProfilePicture);
    }
  }, [selectedArtistId, existingChatId]);

  const onSend = useCallback(
    async (newMessages: IMessage[]) => {
      let currentChatID = chatID;
      if (!currentChatID) {
        console.log("NEw Chat ...");
        try {
          const newChat = await createChat(selectedArtist, loggedInUser);
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
              recieverProfilePicture
                ? { uri: recieverProfilePicture }
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

export default IndividualChat;

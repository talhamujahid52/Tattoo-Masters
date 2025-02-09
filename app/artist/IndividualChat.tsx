import React, { useState, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import Text from "@/components/Text";
import useChats from "@/hooks/useChat";
import {
  GiftedChat,
  IMessage,
  Bubble,
  InputToolbar,
  Composer,
  Send,
} from "react-native-gifted-chat";
import { router, useLocalSearchParams } from "expo-router";
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

  const formatMessages = (msgs: any[]) => {
    return msgs.map((msg) => ({
      ...msg,
      createdAt: new Date(msg.createdAt).getTime(),
    }));
  };

  useEffect(() => {
    if (selectedArtistId) {
      const fetchMessagesIfChatExists = async () => {
        try {
          const artistChat = await checkIfChatExists(selectedArtistId);
          if (artistChat?.exists) {
            setChatID(artistChat.id);
            setMessageRecieverName(
              artistChat?.data()?.[selectedArtistId]?.name
            );
            setRecieverProfilePicture(
              artistChat?.data()?.[selectedArtistId]?.profilePicture
            );
            const chatMessages = await fetchChatMessages(artistChat.id);
            setMessages(formatMessages(chatMessages));
          } else {
            setMessageRecieverName(selectedArtist?.data?.name);
            setRecieverProfilePicture(selectedArtist?.data?.profilePicture);
          }
        } catch (error) {
          console.error("Error checking if chat exists: ", error);
        }
      };

      fetchMessagesIfChatExists();
    } else if (existingChatId) {
      setChatID(existingChatId);
      fetchChatMessages(existingChatId).then((msgs) => {
        setMessages(formatMessages(msgs));
      });
      setMessageRecieverName(otherUserName);
      setRecieverProfilePicture(otherUserProfilePicture);
    }
  }, [selectedArtistId, existingChatId]);

  const onSend = useCallback(
    async (newMessages: IMessage[]) => {
      let currentChatID = chatID;
      if (!currentChatID) {
        try {
          const newChat = await createChat(selectedArtist, loggedInUser);
          currentChatID = newChat.id;
          setChatID(currentChatID);
        } catch (error) {
          console.error("Failed to create chat:", error);
          return;
        }
      }
      await addMessageToChat(newMessages, currentChatID);
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );
    },
    [chatID]
  );

  // Custom rendering functions
  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#514D33", // WhatsApp green for sent messages
            padding: 5,
            marginVertical: 3,
          },
          left: {
            backgroundColor: "#292929", // White for received messages
            padding: 5,
            marginVertical: 3,
          },
        }}
        textStyle={{
          right: {
            color: "#FBF6FA", // Black text for sent messages
          },
          left: {
            color: "#FBF6FA", // Black text for received messages
          },
        }}
      />
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: "#080808",
        }}
      />
    );
  };

  const renderComposer = (props: any) => {
    return (
      <Composer
        {...props}
        textInputStyle={{
          backgroundColor: "#303030",
          color: "white",
          borderRadius: 25,
          overflow: "hidden",
          marginLeft: 16,
          minHeight: 44, // Increased minimum height
          maxHeight: 100, // Maximum height before scrolling
          paddingVertical: 10,
          paddingHorizontal: 20,
        }}
        textInputProps={{
          cursorColor: "green",
        }}
        placeholderTextColor="#C1C1C1"
        placeholder="Send Message"
        multiline={true} // Explicitly enable multiline
      />
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send
        {...props}
        containerStyle={{
          width: 44,
          height: 44,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
          }}
        >
          <Image
            style={{ height: "100%", width: "100%" }}
            source={require("../../assets/images/sendMessage.png")}
          />
        </View>
      </Send>
    );
  };

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

      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: loggedInUser.uid,
        }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderComposer={renderComposer}
        renderSend={renderSend}
        scrollToBottom
        timeFormat="HH:mm"
        dateFormat="MMM DD, YYYY"
        messagesContainerStyle={{ paddingVertical: 20 }}
        alwaysShowSend={true}
        // timeTextStyle={}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

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
import uuid from "react-native-uuid";
import firestore from "@react-native-firebase/firestore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const IndividualChat: React.FC = () => {
  const [composerHeight, setComposerHeight] = useState(44);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatID, setChatID] = useState<any>();
  const [messageRecieverName, setMessageRecieverName] = useState("");
  const [recieverProfilePicture, setRecieverProfilePicture] = useState("");
  const loggedInUser = useSelector((state: any) => state?.user?.user);
  const {
    checkIfChatExists,
    fetchChatMessages,
    createChat,
    addMessageToChat,
    listenToMessages,
  } = useChats(loggedInUser.uid);
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);

  const {
    selectedArtistId,
    existingChatId,
    otherUserName,
    otherUserProfilePicture,
    otherUser,
  } = useLocalSearchParams<any>();
  const selectedArtist = useGetArtist(selectedArtistId);

  const formatMessages = (msgs: any[]) => {
    return msgs.map((msg) => {
      let createdAt = msg.createdAt;

      // If createdAt is a Firestore timestamp, convert it to milliseconds
      if (createdAt && typeof createdAt.toMillis === "function") {
        createdAt = createdAt.toMillis();
      }

      // Handle string dates
      if (typeof createdAt === "string") {
        createdAt = new Date(createdAt).getTime();
      }

      // If no valid date, use current time
      if (!createdAt || isNaN(createdAt)) {
        createdAt = Date.now();
      }

      return {
        ...msg,
        createdAt,
      };
    });
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
              artistChat?.data()?.[selectedArtistId]?.profilePictureSmall ??
                artistChat?.data()?.[selectedArtistId]?.profilePicture
            );
          } else {
            setMessageRecieverName(selectedArtist?.data?.name);
            setRecieverProfilePicture(
              selectedArtist?.data?.profilePictureSmall ??
                selectedArtist?.data?.profilePicture
            );
          }
        } catch (error) {
          console.error("Error checking if chat exists: ", error);
        }
      };

      fetchMessagesIfChatExists();
    } else if (existingChatId) {
      setChatID(existingChatId);
      setMessageRecieverName(otherUserName);
      setRecieverProfilePicture(otherUserProfilePicture);
    }
  }, [selectedArtistId, existingChatId]);

  useEffect(() => {
    if (!chatID) return;
    const unsubscribe = listenToMessages(chatID, (msgs) => {
      setMessages(formatMessages(msgs));
    });
    return () => unsubscribe();
  }, [chatID]);

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
    },
    [chatID]
  );

  // Custom rendering functions
  const renderBubble = (props: any) => {
    const isSent = props.position === "right";

    const getTime = (createdAt: any) => {
      if (!createdAt) return "";

      const messageDate =
        typeof createdAt === "number"
          ? new Date(createdAt)
          : createdAt instanceof Date
          ? createdAt
          : new Date(createdAt);

      if (isNaN(messageDate.getTime())) return "";

      return messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#514D33",
            marginVertical: 3,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 4,
          },
          left: {
            backgroundColor: "#292929",
            marginVertical: 3,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
            borderBottomLeftRadius: 4,
          },
        }}
        bottomContainerStyle={{
          right: {
            paddingHorizontal: 8,
            paddingBottom: 8,
          },
          left: {
            paddingHorizontal: 8,
            paddingBottom: 8,
          },
        }}
        textStyle={{
          right: {
            color: "#FBF6FA",
            textAlign: "right",
          },
          left: {
            color: "#FBF6FA",
          },
        }}
        renderTime={() => {
          const time = getTime(props.currentMessage.createdAt);
          return time ? (
            <Text
              style={{
                color: "#C1C1C1",
                fontSize: 10,
                textAlign: isSent ? "right" : "left",
              }}
            >
              {time}
            </Text>
          ) : null;
        }}
      />
    );
  };
  const renderInputToolbar = (props: any) => {
    const height = Math.min(Math.max(composerHeight + 8, 44), 100);
    const isMultiline = height >= 52;

    return (
      <View
        style={{
          backgroundColor: "#303030",
          borderRadius: isMultiline ? 20 : 100,
          flexDirection: "row",
          alignItems: "flex-end",
          height,
          marginHorizontal: 8,
        }}
      >
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Composer
            {...props}
            placeholder="Send message"
            placeholderTextColor="#C1C1C1"
            textInputStyle={{
              color: "white",
              fontSize: 16,
              backgroundColor: "transparent",
              paddingLeft: 8,
            }}
            multiline
            scrollEnabled={composerHeight >= 100}
            textInputProps={{
              selectionColor: "white",
              showsVerticalScrollIndicator: false,
            }}
            onInputSizeChanged={(e) => {
              setComposerHeight(e.height);
            }}
          />
        </View>

        <Send
          {...props}
          containerStyle={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            alignSelf: isMultiline ? "flex-end" : "center",
          }}
        >
          <View style={{ width: 32, height: 32 }}>
            <Image
              style={{ height: "100%", width: "100%" }}
              source={require("../../assets/images/sendMessage.png")}
            />
          </View>
        </Send>
      </View>
    );
  };

  useEffect(() => {
    const receiverId = selectedArtistId || otherUser; // adjust if you have direct receiver UID

    const unsubscribe = firestore()
      .collection("Users")
      .doc(receiverId)
      .onSnapshot((doc) => {
        const data = doc.data();
        if (data) {
          setIsOnline(data.isOnline || false);
          setLastSeen(data.lastSeen?.toDate?.() || null);
        }
      });

    return () => unsubscribe();
  }, [selectedArtistId, existingChatId]);

  const getTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - timestamp.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hour${
        Math.floor(diffInSeconds / 3600) === 1 ? "" : "s"
      } ago`;
    return `${Math.floor(diffInSeconds / 86400)} day${
      Math.floor(diffInSeconds / 86400) === 1 ? "" : "s"
    } ago`;
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          // style={{ height: 15, width: 16 }}
        >
          {Platform.OS === "android" && (
            <Image
              source={require("../../assets/images/android_back_arrow.png")}
              style={{ height: 15, width: 16, resizeMode: "contain" }}
            />
          )}
          {Platform.OS === "ios" && (
            <Image
              style={{ height: 24, width: 24, resizeMode: "contain" }}
              source={require("../../assets/images/iosBackIcon.png")}
            />
          )}
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
              {messageRecieverName ? messageRecieverName : ""}
            </Text>
            <Text size="medium" weight="normal" color="#A7A7A7">
              {isOnline
                ? "Online"
                : lastSeen
                ? `Last seen ${getTimeAgo(lastSeen)}`
                : ""}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={{ height: 18, width: 18 }}>
          <Image
            source={require("../../assets/images/call.png")}
            style={{ height: "100%", width: "100%", resizeMode: "contain" }}
          />
        </TouchableOpacity>
      </View>

      <GiftedChat
        messageIdGenerator={() => uuid.v4() as string}
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: loggedInUser.uid,
        }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        dateFormat="MMM DD, YYYY"
        renderAvatar={null}
        alwaysShowSend={true}
        inverted={true}
      />
    </View>
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
    borderBottomWidth: 0.33,
    borderBottomColor: "#2D2D2D",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 5,
  },
});

export default IndividualChat;

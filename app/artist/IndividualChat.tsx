import React, { useState, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
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
  const insets = useSafeAreaInsets();
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
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const [localTime, setLocalTime] = useState<String>();
  console.log("Local Time: ", localTime);
  const { selectedArtistId, existingChatId, otherUserName, otherUserId } =
    useLocalSearchParams<any>();
  const selectedArtist = useGetArtist(selectedArtistId);
  const [otherUserDetails, setOtherUserDetails] = useState<any>();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDocRef = firestore().collection("Users").doc(otherUserId);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          setOtherUserDetails(userData);
          // Do whatever you need with userData
          // console.log("Fetched user data:", userData);
        } else {
          console.warn("User not found with ID:", otherUserId);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if (otherUserId) {
      fetchUser();
    }
  }, [otherUserId]);

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
            setMessageRecieverName(selectedArtist?.data?.name);
            setRecieverProfilePicture(
              selectedArtist?.data?.profilePictureSmall
                ? selectedArtist?.data?.profilePictureSmall
                : selectedArtist?.data?.profilePicture
            );
            const localTime = await getLocalTimeFromCoordinates(
              selectedArtist?.data?.location
            );
            setLocalTime(localTime);
          } else {
            setMessageRecieverName(selectedArtist?.data?.name);
            setRecieverProfilePicture(
              selectedArtist?.data?.profilePictureSmall
                ? selectedArtist?.data?.profilePictureSmall
                : selectedArtist?.data?.profilePicture
            );
            const localTime = await getLocalTimeFromCoordinates(
              selectedArtist?.data?.location
            );
            setLocalTime(localTime);
          }
        } catch (error) {
          console.error("Error checking if chat exists: ", error);
        }
      };

      fetchMessagesIfChatExists();
    } else if (existingChatId) {
      const chatExistsAlready = async () => {
        setChatID(existingChatId);
        setMessageRecieverName(otherUserName);
        setRecieverProfilePicture(
          otherUserDetails?.profilePictureSmall
            ? otherUserDetails?.profilePictureSmall
            : otherUserDetails?.profilePicture
        );
        const localTime = await getLocalTimeFromCoordinates(
          otherUserDetails?.location
        );
        setLocalTime(localTime);
      };
      chatExistsAlready();
    }
  }, [selectedArtistId, existingChatId, otherUserDetails]);

  useEffect(() => {
    if (!chatID) return;
    const unsubscribe = listenToMessages(chatID, (msgs) => {
      setMessages(formatMessages(msgs));
    });
    return () => unsubscribe();
  }, [chatID]);

  const GOOGLE_API_KEY = "AIzaSyCYsCsuGy8EFd8S8SG4xyU4oPi-0P_yu9k";

  const getLocalTimeFromCoordinates = async ([lat, lng]) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${GOOGLE_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        const date = new Date(timestamp * 1000);
        const timeOnly = date.toLocaleTimeString("en-US", {
          timeZone: data.timeZoneId,
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        console.log("Time: ", timeOnly);
        return timeOnly; // e.g., "03:15 AM"
      } else {
        console.error("Time Zone API Error:", data.errorMessage || data.status);
        return null;
      }
    } catch (error) {
      console.error("Fetch error:", error);
      return null;
    }
  };

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
  const phoneNumber = "1234567890";

  const openDialer = () => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Error", "Unable to open dialer");
        }
      })
      .catch((err) => {
        console.error("An error occurred", err);
        Alert.alert("Error", "Something went wrong");
      });
  };

  useEffect(() => {
    const receiverId = selectedArtistId || otherUserId; // adjust if you have direct receiver UID

    const unsubscribe = firestore()
      .collection("Users")
      .doc(receiverId)
      .onSnapshot((doc) => {
        const data = doc.data();
        if (data) {
          setIsOnline(data?.isOnline || false);
          setLastSeen(data?.lastSeen?.toDate?.() || null);
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
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
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
                : require("../../assets/images/placeholder.png")
            }
            style={styles.avatar}
          />
          <View>
            <Text size="p" weight="normal" color="#FBF6FA">
              {messageRecieverName ? messageRecieverName : ""}
            </Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                columnGap: 4,
                marginTop: 2,
              }}
            >
              <Text size="medium" weight="normal" color="#A7A7A7">
                {isOnline
                  ? "Online"
                  : lastSeen
                  ? `Last seen ${getTimeAgo(lastSeen)}`
                  : ""}
              </Text>
              {localTime && (
                <>
                  <View
                    style={{
                      height: 3,
                      width: 3,
                      backgroundColor: "#B1AFA4",
                      borderRadius: 100,
                    }}
                  ></View>
                  <Text size="medium" weight="normal" color="#A7A7A7">
                    {`Local time ${localTime}`}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={openDialer}
          style={{ height: 24, width: 24 }}
        >
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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

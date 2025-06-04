import * as React from "react";
import { Image, StyleSheet, View, TouchableOpacity } from "react-native";
import Text from "./Text";
import { router } from "expo-router";
import { useSelector } from "react-redux";
interface ChatListCellProps {
  chat: any;
}

const ChatListCell = ({ chat }: ChatListCellProps) => {
  const loggedInUser = useSelector((state: any) => state?.user?.user);
  const participants = chat?.item?.participants;

  const otherUser = participants?.find(
    (item: any) => item !== loggedInUser?.uid
  );

  const otherUserName = chat?.item?.[otherUser]?.name;
  const otherUserProfilePicture = chat?.item?.[otherUser]?.profilePicture;
  const lastMessage = chat?.item?.lastMessage;
  const lastMessageTime = chat?.item?.lastMessageTime;
  const date = new Date(
    lastMessageTime.seconds * 1000 + lastMessageTime.nanoseconds / 1000000
  );

  function formatMessageDate(dateString: string): string {
    const messageDate = new Date(dateString);
    const today = new Date();

    // Zero out time parts
    messageDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const msInDay = 1000 * 60 * 60 * 24;
    const dayDiff = Math.round(
      (today.getTime() - messageDate.getTime()) / msInDay
    );

    if (dayDiff === 0) return "Today";
    if (dayDiff === 1) return "Yesterday";
    if (dayDiff < 7) {
      return messageDate.toLocaleDateString("en-US", { weekday: "long" }); // e.g. "Monday"
    }

    return messageDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    }); // e.g. "June 3"
  }

  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/artist/IndividualChat",
          params: {
            existingChatId: chat.item.id,
            otherUserName: otherUserName,
            otherUserProfilePicture: otherUserProfilePicture,
          },
        });
      }}
      style={styles.chatListCellFlexBox}
    >
      <View style={styles.profileImage}>
        <Image
          source={
            otherUserProfilePicture
              ? { uri: otherUserProfilePicture }
              : require("../assets/images/Artist.png")
          }
          style={{
            height: "100%",
            width: "100%",
            borderRadius: 50,
            borderWidth: 1,
            borderColor: "#333333",
            backgroundColor: "#202020",
          }}
          resizeMode="cover"
        />
      </View>
      <View style={styles.messageContainer}>
        <View style={styles.row1}>
          <Text size="p" weight="semibold" color="#ffffff">
            {otherUserName ? otherUserName : ""}
          </Text>
          <Text size="p" weight="normal" color="#B2B2B2">
            {date ? formatMessageDate(date) : ""}
          </Text>
        </View>
        <Text size="p" weight="normal" color="#B2B2B2">
          {lastMessage ? lastMessage : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatListCellFlexBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileImage: {
    marginVertical: 16,
    width: 54,
    height: 54,
  },
  messageContainer: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
    alignSelf: "stretch",
    borderBottomColor: "#525252",
    borderBottomWidth: 0.5,
  },
  row1: {
    justifyContent: "space-between",
    flexDirection: "row",
  },
  divider: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    height: 0.5,
  },
});

export default ChatListCell;

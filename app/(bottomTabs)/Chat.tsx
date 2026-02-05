import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  Dimensions,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "@/components/Input";
import Text from "@/components/Text";
import ChatListCell from "@/components/ChatListCell";
import useChats from "@/hooks/useChat";
import useLastSeen from "@/hooks/useLastSeen";
import { router } from "expo-router";

const Chat = () => {
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");
  const adjustedWidth = width - 80;

  const loggedInUser = useSelector((state: any) => state?.user?.user); // get Loggedin User
  const artists = useSelector((state: any) => state?.artist?.allArtists); // get Artists
  const chats = useSelector((state: any) => state?.chats?.allChats); // get Chats
  useLastSeen();
  const { fetchChats } = useChats(loggedInUser?.uid);

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    // Get the unsubscribe function
    const unsubscribe = fetchChats();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const filteredChats = useMemo(() => {
    if (!searchText.trim()) {
      return chats;
    }

    const searchLower = searchText.toLowerCase().trim();

    return chats?.filter((chat: any) => {
      const otherUserId = chat?.participants?.find(
        (userId: string) => userId !== loggedInUser?.uid
      );
      const otherUserName = chat?.[otherUserId]?.name?.toLowerCase() || "";
      const lastMessage = chat?.lastMessage?.toLowerCase() || "";

      return (
        otherUserName.includes(searchLower) || lastMessage.includes(searchLower)
      );
    });
  }, [chats, searchText, loggedInUser?.uid]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          paddingTop: insets.top,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ height: 58 }}>
          <Input
            value={searchText}
            inputMode="text"
            placeholder="Search for artists"
            leftIcon={"search"}
            onChangeText={(text) => setSearchText(text)}
            rightIcon={searchText !== "" && "cancel"}
            rightIconOnPress={() => setSearchText("")}
          />
        </View>
        <Text
          size="h4"
          weight="semibold"
          color="#a7a7a7"
          style={{ marginVertical: 16 }}
        >
          Conversations
        </Text>
        {filteredChats && filteredChats.length > 0 ? (
          <View style={{ height: "auto" }}>
            <FlatList
              data={filteredChats}
              renderItem={({ item }) => <ChatListCell chat={item} />}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 250 }}
              keyboardShouldPersistTaps="handled" // ✅ ensure taps dismiss keyboard
            />
          </View>
        ) : (
          <View style={styles.emptyContainer} pointerEvents="box-none">
            <Text size="h4" weight="medium" color="#A7A7A7">
              {searchText ? "No chats found" : "You have no chats yet"}
            </Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Chat;

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
});

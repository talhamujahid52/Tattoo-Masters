import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  FlatList,
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
import {
  selectBlockedUserIds,
  selectSafetyHydrated,
} from "@/redux/slices/safetySlice";
import { filterHiddenChats } from "@/utils/safetyFilters";

const Chat = () => {
  const insets = useSafeAreaInsets();

  const loggedInUser = useSelector((state: any) => state?.user?.user); // get Loggedin User
  const chats: any[] = useSelector((state: any) => state?.chats?.allChats); // get Chats
  const blockedUserIds = useSelector(selectBlockedUserIds);
  const safetyHydrated = useSelector(selectSafetyHydrated);
  useLastSeen();
  const { fetchChats } = useChats(loggedInUser?.uid);

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    // Get the unsubscribe function
    const unsubscribe = fetchChats();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [fetchChats]);

  const filteredChats = useMemo(() => {
    if (loggedInUser?.uid && !safetyHydrated) return [];
    const visibleChats = loggedInUser?.uid
      ? filterHiddenChats(chats ?? [], loggedInUser.uid, blockedUserIds)
      : [];

    if (!searchText.trim()) return visibleChats;

    const searchLower = searchText.toLowerCase().trim();

    return visibleChats?.filter((chat: any) => {
      const otherUserId = chat?.participants?.find(
        (userId: string) => userId !== loggedInUser?.uid
      );
      const otherUserName = chat?.[otherUserId]?.name?.toLowerCase() || "";
      const lastMessage = chat?.lastMessage?.toLowerCase() || "";

      return (
        otherUserName.includes(searchLower) || lastMessage.includes(searchLower)
      );
    });
  }, [
    blockedUserIds,
    chats,
    loggedInUser?.uid,
    safetyHydrated,
    searchText,
  ]);

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

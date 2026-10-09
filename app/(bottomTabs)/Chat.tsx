import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  RefreshControl,
} from "react-native";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "@/components/Input";
import Text from "@/components/Text";
import Animated, { FadeIn } from "react-native-reanimated";
import ChatListCell, {
  ChatListSkeleton,
  ensureUserDetails,
  getCachedUserName,
  refreshUserDetails,
} from "@/components/ChatListCell";
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
  const [chatsLoaded, setChatsLoaded] = useState(false);
  // Chats saved from an earlier visit show at once; otherwise placeholders
  // stand in until the list is known, rather than a false "no chats yet".
  const loadingChats =
    !!loggedInUser?.uid &&
    (!safetyHydrated || (!chatsLoaded && !chats?.length));

  useEffect(() => {
    setChatsLoaded(false);
    // Get the unsubscribe function
    const unsubscribe = fetchChats(() => setChatsLoaded(true));

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [fetchChats]);

  const [refreshing, setRefreshing] = useState(false);
  const [profilesVersion, setProfilesVersion] = useState(0);

  // Load the names of everyone in the list, so search can match on the name
  // the cell shows rather than the copy saved on the chat when it was created.
  useEffect(() => {
    if (!loggedInUser?.uid || !chats?.length) return;
    let isActive = true;
    ensureUserDetails(
      chats.flatMap((chat: any) =>
        (chat?.participants ?? []).filter(
          (userId: string) => userId !== loggedInUser.uid,
        ),
      ),
    ).then(() => {
      if (isActive) setProfilesVersion((version) => version + 1);
    });
    return () => {
      isActive = false;
    };
  }, [chats, loggedInUser?.uid]);

  const filteredChats = useMemo(() => {
    if (loggedInUser?.uid && !safetyHydrated) return [];
    const visibleChats = loggedInUser?.uid
      ? filterHiddenChats(chats ?? [], loggedInUser.uid, blockedUserIds)
      : [];

    if (!searchText.trim()) return visibleChats;

    const searchLower = searchText.toLowerCase().trim();

    return visibleChats?.filter((chat: any) => {
      const otherUserId = chat?.participants?.find(
        (userId: string) => userId !== loggedInUser?.uid,
      );
      const otherUserName = (
        getCachedUserName(otherUserId) ||
        chat?.[otherUserId]?.name ||
        ""
      ).toLowerCase();
      const lastMessage = chat?.lastMessage?.toLowerCase() || "";

      return (
        otherUserName.includes(searchLower) || lastMessage.includes(searchLower)
      );
    });
    // profilesVersion re-runs this once the names have been fetched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    blockedUserIds,
    chats,
    loggedInUser?.uid,
    profilesVersion,
    safetyHydrated,
    searchText,
  ]);

  // Pull-to-refresh handler. The chats themselves are live, so this only
  // reloads the names and pictures of the people in them.
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserDetails(
      (chats ?? []).flatMap((chat: any) =>
        (chat?.participants ?? []).filter(
          (userId: string) => userId !== loggedInUser?.uid,
        ),
      ),
    );
    setProfilesVersion((version) => version + 1);
    setRefreshing(false);
  };

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
        {loadingChats ? (
          <ChatListSkeleton />
        ) : filteredChats && filteredChats.length > 0 ? (
          <Animated.View entering={FadeIn.duration(200)} style={{ flex: 1 }}>
            <FlatList
              showsVerticalScrollIndicator={Platform.OS !== "ios"}
              data={filteredChats} // duplicate the data to make it scrollable
              renderItem={({ item }) => (
                <ChatListCell chat={item} profilesVersion={profilesVersion} />
              )}
              extraData={profilesVersion}
              keyExtractor={(item) => item.id.toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#fff"
                  colors={["#fff"]}
                  progressBackgroundColor="#1C1C1C"
                />
              }
              contentContainerStyle={{ paddingBottom: 30 }}
              keyboardShouldPersistTaps="handled" // ✅ ensure taps dismiss keyboard
            />
          </Animated.View>
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

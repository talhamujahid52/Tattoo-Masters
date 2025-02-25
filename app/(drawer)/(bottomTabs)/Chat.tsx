import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "@/components/Input";
import Text from "@/components/Text";
import ChatListCell from "@/components/ChatListCell";
import useChats from "@/hooks/useChat";
import { router } from "expo-router";

const Chat = () => {
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");
  const adjustedWidth = width - 80;

  const loggedInUser = useSelector((state: any) => state?.user?.user); // get Loggedin User
  const artists = useSelector((state: any) => state?.artist?.allArtists); // get Artists
  const chats = useSelector((state: any) => state?.chats?.allChats); // get Chats

  const { fetchChats } = useChats(loggedInUser?.uid);

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    // Get the unsubscribe function
    const unsubscribe = fetchChats();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const onOnlineArtistClick = async (selectedArtistId: any) => {
    router.push({
      pathname: "/artist/IndividualChat",
      params: { selectedArtistId },
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
        paddingTop: insets.top,
        paddingHorizontal: 16,
      }}
    >
      <Input
        value={searchText}
        inputMode="text"
        placeholder="Search for artists and studios"
        leftIcon={"search"}
        onChangeText={(text) => setSearchText(text)}
        rightIcon={searchText !== "" && "cancel"}
        rightIconOnPress={() => setSearchText("")}
      />
      <Text
        size="h4"
        weight="semibold"
        color="#a7a7a7"
        style={{ marginVertical: 16 }}
      >
        Online Artists
      </Text>
      <View>
        <FlatList
          data={artists}
          renderItem={({ item, index }) => (
            <Pressable onPress={() => onOnlineArtistClick(item.id)}>
              <View
                style={{
                  height: adjustedWidth / 4,
                  width: adjustedWidth / 4,
                  borderRadius: 50,
                  overflow: "hidden",
                }}
              >
                <Image
                  style={{ width: "100%", height: "100%" }}
                  source={{
                    uri:
                      item?.data?.profilePictureSmall ??
                      item?.data?.profilePicture,
                  }}
                />
              </View>
              <Text
                size="medium"
                weight="normal"
                color="#ffffff"
                style={{
                  width: adjustedWidth / 4,
                  textAlign: "center",
                  marginTop: 5,
                }}
              >
                {item?.data?.name ? item?.data?.name : "Jasper Frost"}
              </Text>
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          contentContainerStyle={{ gap: 16 }}
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
      <View style={{ height: "auto" }}>
        <FlatList
          data={chats}
          renderItem={(item) => <ChatListCell chat={item} />}
          // keyExtractor={(item, idx) => item.lastSeen}
          contentContainerStyle={{ paddingBottom: 250 }}
        />
      </View>
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({});

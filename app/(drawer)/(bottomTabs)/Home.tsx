import {
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  ScrollView,
} from "react-native";
import Input from "@/components/Input";
import Text from "@/components/Text";
import React, { useState, useEffect } from "react";
import ArtistProfileCard from "@/components/ArtistProfileCard";
import ImageGallery from "@/components/ImageGallery";
import { getUsers } from "@/utils/firebase/userFunctions";
import { useDispatch, useSelector } from "react-redux";
import { updateAllArtists, resetAllArtists } from "@/redux/slices/artistSlice";
import { useRouter } from "expo-router";

const Home = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");

  const artists = useSelector((state: any) => state.artist.allArtists);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersList = await getUsers(); // Call your getUsers function here
        // console.log("Users: ", JSON.stringify(usersList));
        dispatch(resetAllArtists());
        dispatch(updateAllArtists(usersList));
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers(); // Fetch users when the component mounts
  }, []);

  useEffect(() => {
    // console.log("Artists From Redux : ", artists);
  }, [artists]);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 30 }}
      style={styles.container}
    >
      <Input
        value={searchText}
        inputMode="text"
        placeholder="Search for ideas"
        leftIcon={"search"}
        onChangeText={(text) => setSearchText(text)}
        rightIcon={searchText !== "" && "cancel"}
        rightIconOnPress={() => setSearchText("")}
      ></Input>
      <View style={styles.flatlistHeadingContainer}>
        <Text size="h4" weight="semibold" color="#FBF6FA">
          Popular artists near you
        </Text>
        <TouchableOpacity
          onPress={() => {
            router.push("/(bottomTabs)/Search");
          }}
        >
          <Text size="h4" weight="normal" color="#DAB769">
            See more
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={artists}
        renderItem={({ item }) => <ArtistProfileCard artist={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 16,
          height: 215,
        }}
      />
      <Text
        size="h4"
        weight="semibold"
        color="#FBF6FA"
        style={{ marginTop: 24, marginBottom: 8 }}
      >
        Find Your Inspiration
      </Text>
      <ImageGallery></ImageGallery>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingTop: 15,
  },
  flatlistHeadingContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 24,
  },
});

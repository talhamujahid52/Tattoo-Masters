import {
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  ScrollView,
  RefreshControl,
} from "react-native";
import Input from "@/components/Input";
import Text from "@/components/Text";
import React, { useState, useEffect } from "react";
import ArtistProfileCard from "@/components/ArtistProfileCard";
import ImageGallery from "@/components/ImageGallery";
// import { getUsers } from "@/utils/firebase/userFunctions";
import { useDispatch, useSelector } from "react-redux";
import { updateAllArtists, resetAllArtists } from "@/redux/slices/artistSlice";
import { useRouter } from "expo-router";
import useTypesense from "@/hooks/useTypesense";
import { UserFirestore } from "@/types/user";

const Home = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const artistsTs = useTypesense();
  const publicationsTs = useTypesense();

  const artists = useSelector((state: any) => state.artist.allArtists);

  // Function to fetch users and update Redux state
  const fetchUsers = async () => {
    try {
      const hits = await artistsTs.search({
        collection: "Users",
        query: "*",
        queryBy: "name", // You can use any searchable field
        filterBy: "isArtist:=true",
      });
      // Map the search hits to get the actual documents.
      const fetchedArtists = hits.map((hit) => hit.document) as UserFirestore[];

      dispatch(resetAllArtists());
      dispatch(
        updateAllArtists(
          fetchedArtists.map(({ id, ...data }) => ({
            data,
            id,
          })),
        ),
      );
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Initial fetch when the component mounts
  useEffect(() => {
    publicationsTs.search({ collection: "publications" });
  }, [publicationsTs.search]);

  useEffect(() => {
    fetchUsers();
    // Use "*" as query to match all, then filter by isArtist:true.
  }, [artistsTs.search]);
  // Handler for pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    publicationsTs.search({ collection: "publications" });
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 30 }}
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
          colors={["#fff"]}
        />
      }
    >
      <Input
        value={searchText}
        inputMode="text"
        placeholder="Search for ideas"
        leftIcon={"search"}
        onChangeText={(text) => setSearchText(text)}
        rightIcon={searchText !== "" && "cancel"}
        rightIconOnPress={() => setSearchText("")}
        backgroundColour="#151515"
      />
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
      <ImageGallery images={publicationsTs.results} />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 24,
  },
});

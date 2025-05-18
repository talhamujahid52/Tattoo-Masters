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
import { useDispatch, useSelector } from "react-redux";
import { updateAllArtists, resetAllArtists } from "@/redux/slices/artistSlice";
import { useRouter } from "expo-router";
import useTypesense from "@/hooks/useTypesense";
import { UserFirestore } from "@/types/user";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { addSearch } from "@/redux/slices/recentSearchesSlice";

const Home = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const artistsTs = useTypesense();
  const publicationsTs = useTypesense();

  const artists = useSelector((state: any) => state.artist.allArtists);
  // Shared values for the animation of the popular artists section
  const artistsOpacity = useSharedValue(1);
  const artistsTranslateY = useSharedValue(0);
  const artistsHeight = useSharedValue(280); // initial height for the FlatList container

  const animatedArtistsStyle = useAnimatedStyle(() => {
    return {
      opacity: artistsOpacity.value,
      transform: [{ translateY: artistsTranslateY.value }],
      height: artistsHeight.value,
    };
  });

  // Fetch artists and update Redux state
  const fetchUsers = async () => {
    try {
      const hits = await artistsTs.search({
        collection: "Users",
        query: "*",
        queryBy: "name",
        filterBy: "isArtist:=true",
      });
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

  // Handler for when the user submits the search
  const handleSearchSubmit = async () => {
    router.push({
      pathname: "/(bottomTabs)/Home/SearchAll",
      params: { query: searchText, type: "tattoos" },
    });

    dispatch(addSearch({ text: searchText, type: "tattoos" }));
    setSearchText("");
  };

  // Initial publications search on mount
  useEffect(() => {
    publicationsTs.search({ collection: "publications" });
  }, [publicationsTs.search]);

  // Fetch artists on mount or when typesense dependency changes
  useEffect(() => {
    fetchUsers();
  }, [artistsTs.search]);

  // Pull-to-refresh handler
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
        onSubmitEditing={handleSearchSubmit}
        rightIcon={searchText !== "" && "cancel"}
        rightIconOnPress={() => setSearchText("")}
        backgroundColour="#151515"
      />

      {/* Animated container for the popular artists section */}
      <Animated.View style={[animatedArtistsStyle, { overflow: "hidden" }]}>
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
          // Remove fixed height so the container's animated height controls the space
          contentContainerStyle={{ gap: 16 }}
        />
      </Animated.View>

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

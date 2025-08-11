import {
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  ScrollView,
  RefreshControl,
  Image,
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
import useBackgroundUpload from "@/hooks/useBackgroundUpload";

const Home = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastCompletedCount, setLastCompletedCount] = useState(0);
  const artistsTs = useTypesense();
  const publicationsTs = useTypesense();
  const { queue: uploadQueue, completedUploads } = useBackgroundUpload();

  const artists = useSelector((state: any) => state.artist.allArtists);

  // Upload tracking for auto-refresh
  const { queue, completedCount, failedCount, pendingCount, uploadingCount } =
    useBackgroundUpload();

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
          }))
        )
      );
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Handler for when the user submits the search
  const handleSearchSubmit = async () => {
    router.push({
      pathname: "/(bottomTabs)/Home/SearchAllHome",
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
      <View style={{ paddingHorizontal: 16 }}>
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
      </View>

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
        <View>
          <FlatList
            data={artists}
            renderItem={({ item }) => <ArtistProfileCard artist={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16 }}
            ListFooterComponent={
              <TouchableOpacity
                onPress={() => {
                  router.push("/(bottomTabs)/Search");
                }}
                style={{
                  width: 170,
                  height: 170,
                  borderRadius: 16,
                  overflow: "hidden", // Ensure content like rounded corners are respected
                  position: "relative",
                }}
              >
                <Image
                  source={require("../../../../assets/images/searchMoreArtists.png")}
                  style={{
                    width: "100%",
                    height: "100%",
                    resizeMode: "cover",
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: 40,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    // justifyContent: "center",
                    paddingHorizontal: 16,
                  }}
                >
                  <Text
                    size="h4"
                    weight="semibold"
                    color="#FBF6FA"
                    style={{ textAlign: "center" }}
                  >
                    Wanna find more artists?
                  </Text>
                </View>
              </TouchableOpacity>
            }
          />
        </View>
      </Animated.View>

      <Text
        size="h4"
        weight="semibold"
        color="#FBF6FA"
        style={{ marginTop: 24, marginBottom: 8, paddingLeft: 16 }}
      >
        Find your inspiration
      </Text>
      <ImageGallery images={publicationsTs.results} />
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    // paddingHorizontal: 16,
    paddingTop: 15,
  },
  flatlistHeadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 24,
    paddingHorizontal: 16,
  },
});

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Input from "@/components/Input";
import Text from "@/components/Text";
import ArtistSearchCard from "@/components/ArtistSearchCard";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";
import useTypesense from "@/hooks/useTypesense";
import { updateAllArtists, resetAllArtists } from "@/redux/slices/artistSlice";

interface Artist {
  id: string;
  name: string;
  isActive: boolean;
}

const Search: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const dispatch = useDispatch();
  const artistsTs = useTypesense();

  const { width } = Dimensions.get("window");
  const adjustedWidth = width - 42;

  const artists = useSelector((state: any) => state.artist.allArtists);

  // Function to fetch artists from Typesense based on the search text.
  const fetchUsers = async () => {
    try {
      // Use "*" to fetch all artists when the search box is empty.
      const query = searchText.trim() === "" ? "*" : searchText;
      const hits = await artistsTs.search({
        collection: "Users",
        query,
        queryBy: "name,studio,studioName",
        filterBy: "isArtist:=true",
      });
      // Map the search hits to actual documents.
      const fetchedArtists = hits.map((hit) => hit.document);
      dispatch(resetAllArtists());
      dispatch(
        updateAllArtists(
          fetchedArtists.map(({ id, ...data }: any) => ({
            id,
            data,
          })),
        ),
      );
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Debounced effect: wait for 300ms after the user stops typing before fetching users.
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  return (
    <View style={styles.container}>
      <View style={styles.inputHeaderContainer}>
        <TouchableOpacity
          onPress={() => {
            router.push("/artist/SearchArtistProfiles");
          }}
        >
          <Input
            value={searchText}
            inputMode="text"
            placeholder="Search for artists and studios"
            leftIcon={"search"}
            onChangeText={(text) => setSearchText(text)}
            rightIcon={searchText !== "" ? "cancel" : undefined}
            rightIconOnPress={() => setSearchText("")}
            onPress={() => {
              router.push("/artist/SearchArtistProfiles");
            }}
            editable={false}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.searchView}>
        <Text
          size="h4"
          weight="semibold"
          color="#A7A7A7"
          style={styles.Heading}
        >
          {searchText
            ? `Showing ${artists?.length} result${artists?.length !== 1 ? "s" : ""} for "${searchText}"`
            : "Artists near you"}
        </Text>
        <FlatList
          data={artists}
          renderItem={({ item, index }) => (
            <View
              style={{
                width: adjustedWidth / 3,
                marginRight: index % 3 === 0 ? 5 : 0,
                marginLeft: index % 3 === 2 ? 5 : 0,
              }}
            >
              <ArtistSearchCard artist={item} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150, gap: 16 }}
        />
      </View>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  inputHeaderContainer: {
    paddingHorizontal: 16,
    borderBottomWidth: 0.33,
    paddingBottom: 11,
    borderColor: "#FFFFFF56",
  },
  searchView: {
    paddingHorizontal: 16,
  },
  Heading: {
    marginVertical: 16,
  },
});

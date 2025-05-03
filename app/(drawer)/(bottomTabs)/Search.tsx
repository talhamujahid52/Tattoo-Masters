import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Keyboard,
  Animated,
} from "react-native";
import Input from "@/components/Input";
import Text from "@/components/Text";
import ArtistSearchCard from "@/components/ArtistSearchCard";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";
import useTypesense from "@/hooks/useTypesense";
import { updateAllArtists, resetAllArtists } from "@/redux/slices/artistSlice";

const Search: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const dispatch = useDispatch();
  const artistsTs = useTypesense();
  const { width } = Dimensions.get("window");
  const adjustedWidth = width - 42;
  const artists = useSelector((state: any) => state.artist.allArtists);

  // fetchUsers debounced as before…
  const fetchUsers = async () => {
    // … your existing fetch logic …
  };
  useEffect(() => {
    const handle = setTimeout(fetchUsers, 500);
    return () => clearTimeout(handle);
  }, [searchText]);

  // Animate fade in/out when isFocused changes
  useEffect(() => {
    if (isFocused) {
      // start showing overlay
      setShowOverlay(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // fade out, then unmount
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowOverlay(false));
    }
  }, [isFocused, fadeAnim]);

  // Hide overlay if keyboard is dismissed externally
  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidHide", () =>
      setIsFocused(false),
    );
    return () => sub.remove();
  }, []);

  const recentSearches = ["Picasso", "Van Gogh", "Da Vinci", "Banksy"];
  const onRecentPress = (term: string) => {
    setSearchText(term);
    fetchUsers();
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Search bar */}
        <View style={styles.inputHeaderContainer}>
          <Input
            value={searchText}
            inputMode="text"
            placeholder="Search for artists and studios"
            leftIcon="search"
            rightIcon={searchText ? "cancel" : undefined}
            rightIconOnPress={() => setSearchText("")}
            onChangeText={setSearchText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 50)}
          />
        </View>

        {/* Overlay of recents with fade */}
        {showOverlay && (
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            <FlatList
              data={recentSearches}
              keyExtractor={(item, i) => `${item}-${i}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recentItem}
                  onPress={() => onRecentPress(item)}
                >
                  <Text style={{ color: "white" }} size="p">
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
            />
          </Animated.View>
        )}

        {/* Normal results */}
        {!isFocused && (
          <View style={styles.searchView}>
            <Text
              size="h4"
              weight="semibold"
              color="#A7A7A7"
              style={styles.heading}
            >
              {searchText
                ? `Showing ${artists.length} result${artists.length !== 1 ? "s" : ""} for “${searchText}”`
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
              keyExtractor={(item: any) => item.id}
              numColumns={3}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 150, gap: 16 }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  inner: { flex: 1 },
  inputHeaderContainer: {
    paddingHorizontal: 16,
    paddingBottom: 11,
    borderBottomWidth: 0.33,
    borderColor: "#FFFFFF56",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    top: 56, // adjust to sit below your header (e.g. 56px)
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 10,
  },
  recentItem: {
    paddingVertical: 12,
  },
  sep: {
    height: 1,
    backgroundColor: "#444",
  },
  searchView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  heading: {
    marginVertical: 16,
  },
});

// app/Search.tsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Keyboard,
  Image,
  TextInput,
  Platform,
} from "react-native";
import Input from "@/components/Input";
import Text from "@/components/Text";
import ArtistSearchCard from "@/components/ArtistSearchCard";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";
import useTypesense from "@/hooks/useTypesense";
import { updateAllArtists, resetAllArtists } from "@/redux/slices/artistSlice";
import { addSearch, clearSearches } from "@/redux/slices/recentSearchesSlice";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";

const Search: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);

  const dispatch = useDispatch();
  const artistsTs = useTypesense();
  const { width } = Dimensions.get("window");
  const adjustedWidth = width - 42;
  const artists = useSelector((state: any) => state.artist.allArtists);

  const fetchUsers = async () => {
    try {
      const hits = await artistsTs.search({
        collection: "Users",
        query: "",
        queryBy: "name,studio,studioName",
        filterBy: "isArtist:=true",
      });
      const docs = hits.map((h: any) => h.document);
      dispatch(resetAllArtists());
      dispatch(
        updateAllArtists(docs.map(({ id, ...data }: any) => ({ id, data }))),
      );
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // overlay fade (if you re-enable it)
  useEffect(() => {
    if (isFocused) {
      setShowOverlay(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowOverlay(false));
    }
  }, [isFocused, fadeAnim]);

  const recentSearches = useSelector(
    (state: any) => state.recentSearches.items,
  );

  const onRecentPress = (term: { type: string; text: string }) => {
    Keyboard.dismiss();
    router.push({
      pathname: "/(bottomTabs)/Search/SearchAll",
      params: { query: term.text, type: term.type },
    });

    dispatch(addSearch({ text: term.text, type: term.type as any }));
  };
  const renderArtistItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <View
        style={{
          width: adjustedWidth / 3,
          marginRight: index % 3 === 0 ? 5 : 0,
          marginLeft: index % 3 === 2 ? 5 : 0,
        }}
      >
        <ArtistSearchCard artist={item} />
      </View>
    ),
    [adjustedWidth],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.inputHeaderContainer}>
          <TouchableOpacity
            onPress={() => {
              if (isFocused) {
                setIsFocused(false);
                if (searchInputRef.current) {
                  searchInputRef.current.blur();
                }
              } else {
                router.back();
              }
            }}
          >
            {Platform.OS === "android" && (
              <Ionicons name="arrow-back" size={24} color="#fff" />
            )}
            {Platform.OS === "ios" && (
              <Image
                style={{ width: 24, height: 24, resizeMode: "contain" }}
                source={require("../../../assets/images/iosBackIcon.png")}
              />
            )}
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Input
              value={searchText}
              returnKeyLabel="Search"
              returnKeyType="search"
              onSubmitEditing={() => {
                router.push({
                  pathname: "/(bottomTabs)/Search/SearchAll",
                  params: { query: searchText, type: "artists" },
                });

                dispatch(addSearch({ text: searchText, type: "artists" }));
                setSearchText("");
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              inputMode="text"
              placeholder="Search for tattoos, artists and studios"
              leftIcon="search"
              rightIcon={searchText ? "cancel" : undefined}
              rightIconOnPress={() => setSearchText("")}
              onChangeText={setSearchText}
              ref={searchInputRef}
            />
          </View>
        </View>

        {showOverlay && (
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 16,
              }}
            >
              <Text size="p" weight="semibold" color="#B1AFA4">
                Recent searches
              </Text>
              <TouchableOpacity
                onPress={() => {
                  dispatch(clearSearches());
                }}
              >
                <Text size="p" weight="normal" color="#DAB769">
                  Clear all
                </Text>
              </TouchableOpacity>
            </View>
            <KeyboardAwareFlatList
              data={recentSearches}
              keyExtractor={(item, i) => `${item}-${i}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recentItem}
                  onPress={() => onRecentPress(item)}
                >
                  <Image
                    style={{
                      width: 16,
                      height: 16,
                      resizeMode: "contain",
                      marginRight: 10,
                    }}
                    source={require("../../../assets/images/historyIcon.png")}
                  />
                  <Text style={{ color: "#fff" }} size="p">
                    {item.text}
                  </Text>
                </TouchableOpacity>
              )}
              // ItemSeparatorComponent={() => <View style={styles.sep} />}
              keyboardShouldPersistTaps="handled"
            />
          </Animated.View>
        )}

        {/* ─── Main Results ──────────────────────────────── */}
        {!isFocused && (
          <View style={styles.searchView}>
            <Text
              size="h4"
              weight="semibold"
              color="#A7A7A7"
              style={styles.heading}
            >
              Artists near you
            </Text>
            <KeyboardAwareFlatList
              style={{ backgroundColor: "#000" }}
              data={artists}
              renderItem={renderArtistItem}
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
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  inner: {
    flex: 1,
    position: "relative", // allow absolute overlays if needed
  },
  inputHeaderContainer: {
    height: 48 + 10,
    position: "relative", // stack above results
    zIndex: 2,
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingBottom: 11,
    borderBottomWidth: 0.33,
    borderBottomColor: "#2E2E2E",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  overlay: {
    position: "absolute",
    top: 56, // same as header height
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    zIndex: 1,
  },
  recentItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  sep: {
    height: 1,
    backgroundColor: "#444",
  },
  searchView: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
    zIndex: 0,
  },
  heading: {
    marginVertical: 16,
  },
});

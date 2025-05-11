// app/artist/SearchAll.tsx
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import useTypesense from "@/hooks/useTypesense";
import {
  updateSearchResults,
  resetSearchResults,
} from "@/redux/slices/artistSlice";

import Input from "@/components/Input";
import Text from "@/components/Text";
import ArtistSearchCard from "@/components/ArtistSearchCard";

import FilterBottomSheet from "@/components/BottomSheets/FilterBottomSheet";
import useBottomSheet from "@/hooks/useBottomSheet";
import { SearchType, addSearch } from "@/redux/slices/recentSearchesSlice";
import ImageGallery from "@/components/ImageGallery";

interface FilterOption {
  title: string;
  type: SearchType;
}

export const filters: FilterOption[] = [
  { title: "Tattoos", type: "tattoos" },
  { title: "Artists", type: "artists" },
  { title: "Studios", type: "studios" },
];
export default function SearchAll() {
  const { query: initialQuery } = useLocalSearchParams<{ query?: string }>();
  const router = useRouter();
  const dispatch = useDispatch();
  const searchAll = useTypesense();
  const results = useSelector((s: any) => s.artist.searchResults);
  console.log("results", results);
  const [searchText, setSearchText] = useState(initialQuery || "");
  const [searchedText, setSearchedText] = useState(initialQuery || "");
  const { width } = Dimensions.get("window");
  const adjustedWidth = width - 42;

  const [loading, setLoading] = useState(false);
  const { BottomSheet, show, hide } = useBottomSheet();

  // Perform a Typesense search and dispatch results
  const doSearch = async (q: string) => {
    try {
      setLoading(true);

      const query = q.trim() === "" ? "*" : q;
      let hits = null;
      if (selectedFilter === "tattoos") {
        hits = await searchAll.search({
          collection: "publications",
          query,
          queryBy: "styles,caption", // adjust to match your publications schema
        });
      } else if (selectedFilter === "studios") {
        hits = await searchAll.search({
          collection: "Users",
          query,
          queryBy: "studio,studioName",
          filterBy: "isArtist:=true",
        });
      } else if (selectedFilter === "artists") {
        hits = await searchAll.search({
          collection: "Users",
          query,
          queryBy: "name",
          filterBy: "isArtist:=true",
        });
      } else {
        console.warn("no filter specified using publications");
        hits = await searchAll.search({
          collection: "publications",
          query,
          queryBy: "styles,caption", // adjust to match your publications schema
        });
      }

      dispatch(addSearch({ text: query, type: "tattoos" }));
      const docs = hits.map((h: any) => h.document);

      dispatch(
        updateSearchResults(docs.map(({ id, ...data }: any) => ({ id, data }))),
      );
      setSearchedText(searchText);
    } catch (err) {
      console.error("Search error:", err);
      dispatch(resetSearchResults());
    } finally {
      setLoading(false);
    }
  };
  const [selectedFilter, setSelectedFilter] = useState<SearchType | null>();
  const toggleFilter = (value: SearchType) => {
    if (selectedFilter === value) {
      setSelectedFilter(null);
    } else {
      setSelectedFilter(value);
    }
  };

  useEffect(() => {
    doSearch(searchedText);
  }, [selectedFilter, searchedText]);

  return (
    <SafeAreaView style={styles.container}>
      <BottomSheet InsideComponent={<FilterBottomSheet />} />
      <View style={styles.inputHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Input
            value={searchText}
            style={{ flex: 1, borderWidth: 1, borderColor: "red" }}
            onChangeText={setSearchText}
            placeholder="Search for artists and studios"
            leftIcon="search"
            rightIcon={searchText ? "cancel" : undefined}
            rightIconOnPress={() => {
              setSearchText("");
              setSearchedText("");
            }}
            returnKeyType="search"
            onSubmitEditing={() => {
              Keyboard.dismiss();
              setSearchedText(searchText);
            }}
            autoFocus
          />
        </View>
        <TouchableOpacity onPress={show} style={styles.filterButton}>
          <Image
            source={require("../../../../assets/images/filter.png")}
            resizeMode="contain"
            style={styles.filterIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchView}>
        <View style={styles.filtersButtonRow}>
          {filters.map((item, idx) => {
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={1}
                style={{
                  padding: 6,
                  borderRadius: 6,
                  backgroundColor:
                    selectedFilter === item.type ? "#DAB769" : "#262526",
                }}
                onPress={() => toggleFilter(item.type)}
              >
                <Text
                  size="p"
                  weight="normal"
                  color={selectedFilter === item.type ? "#22221F" : "#A7A7A7"}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {searchedText && (
          <Text
            size="h4"
            // weight="semibold"
            color="#A7A7A7"
            style={styles.heading}
          >
            {searchedText &&
              `${results?.length} result${results?.length !== 1 ? "s" : ""} for "${searchedText}"`}
          </Text>
        )}
        {loading ? (
          <View style={[StyleSheet.absoluteFill, { top: "45%" }]}>
            <ActivityIndicator size={"large"} />
          </View>
        ) : (
          <>
            {selectedFilter === "tattoos" || selectedFilter === null ? (
              <ImageGallery images={results} />
            ) : (
              <FlatList
                data={results}
                numColumns={3}
                keyExtractor={(item: any) => item.id}
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
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 150, gap: 16 }}
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 11,
    borderBottomWidth: 0.33,
    borderColor: "#FFFFFF56",
  },

  filterIcon: {
    height: 26,
    width: 26,
  },
  filterButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    width: 48,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#FFFFFF56",
  },

  filtersButtonRow: {
    marginBottom: 16,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  searchView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  heading: { marginBottom: 16 },
});

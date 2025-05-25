// app/artist/SearchAll.tsx
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  SafeAreaView,
  View,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Image,
  ActivityIndicator,
} from "react-native";

import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import useTypesense from "@/hooks/useTypesense";

import {
  selectFilter,
  setRadiusEnabled,
  setRadiusValue,
  setRatings as setRatingsAction,
  setStudio as setStudioAction,
  setStyles as setStylesAction,
  setCurrentLocation,
} from "@/redux/slices/filterSlices";
import {
  updateSearchResults,
  resetSearchResults,
} from "@/redux/slices/artistSlice";

import {
  setTattooLoading,
  setTattooSearchResults,
  TattooSearchResult,
} from "@/redux/slices/tattooSlice";

import Input from "@/components/Input";
import Text from "@/components/Text";
import ArtistSearchCard from "@/components/ArtistSearchCard";

import FilterBottomSheet from "@/components/BottomSheets/FilterBottomSheet";
import useBottomSheet from "@/hooks/useBottomSheet";
import { SearchType, addSearch } from "@/redux/slices/recentSearchesSlice";
import ImageGallery from "@/components/ImageGallery";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";

interface FilterOption {
  title: string;
  type: SearchType;
}

export const filters: FilterOption[] = [
  { title: "Tattoos", type: "tattoos" },
  { title: "Artists", type: "artists" },
  { title: "Studios", type: "studios" },
];
interface FilterOptions {
  radiusEnabled: boolean;
  radiusValue: number;
  rating: number | null;
  studioTypes: string[]; // e.g. ["Studio","Freelancer"]
  styles: string[]; // e.g. ["Tribal","Geometric"]
}
export default function SearchAll() {
  const { query: initialQuery, type: searchTypeInitial } =
    useLocalSearchParams<{ query?: string; type?: SearchType }>();
  const router = useRouter();
  const dispatch = useDispatch();
  const searchAll = useTypesense();
  const resultsArtists = useSelector((s: any) => s.artist.searchResults);
  const resultsTattooss = useSelector((s: any) => s.tattoos.searchResults);
  const [searchText, setSearchText] = useState(initialQuery || "");
  const [searchedText, setSearchedText] = useState(initialQuery || "");
  const { width } = Dimensions.get("window");

  const {
    isEnabledRadius: persistedRadiusEnabled,
    radiusValue: persistedRadiusValue,
    ratings: persistedRatings,
    studio: persistedStudio,
    styles: persistedStyles,
    currentLocation,
  } = useSelector(selectFilter);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const adjustedWidth = width - 42;

  const [loading, setLoading] = useState(false);
  const { BottomSheet, show, hide } = useBottomSheet();

  const [selectedFilter, setSelectedFilter] = useState<SearchType | null>(
    () => searchTypeInitial || null,
  );
  // HELPER: build filterBy string for Typesense
  const buildFacetFilters = (type: "tattoos" | "artists"): string[] => {
    const facets: string[] = [];

    if (type === "artists") {
      const selectedRatings = persistedRatings
        .filter((r) => r.selected)
        .map((r) => r.value);
      if (selectedRatings.length > 0) {
        if (selectedRatings.length === 1) {
          facets.push(
            `rating:>=${selectedRatings[0] - 0.1} && rating:<=${selectedRatings[0] + 0.1}`,
          );
        }
      }

      const studioFilter = persistedStudio.filter((s) => s.selected);
      if (studioFilter.length) {
        facets.push(
          `studio: [${studioFilter.map((s) => `${s.name}`).join(",")}]`,
        );
      }
    }
    if (type === "tattoos") {
      const stylesFiltered = persistedStyles.filter((s) => s.selected);
      if (stylesFiltered.length)
        facets.push(
          `styles: [${stylesFiltered.map((s) => `${s.title}`).join(",")}]`,
        );
    }
    return facets;
  };

  // HELPER: perform studios search
  const searchStudios = async (query: string) => {
    const geoFilter =
      persistedRadiusEnabled && currentLocation
        ? `location:(${currentLocation.latitude}, ${currentLocation.longitude}, ${persistedRadiusValue} km)`
        : null;
    const filterBy = [
      `isArtist:=${true}`,
      geoFilter,
      ...buildFacetFilters("artists").filter(Boolean).join(" && "),
    ]
      .filter(Boolean)
      .join(" && ");

    const hits = await searchAll.search({
      collection: "Users",
      query,
      queryBy: "studio,studioName",
      filterBy,
    });
    dispatch(
      updateSearchResults(
        hits.map((h: any) => ({ id: h.document.id, data: h.document })),
      ),
    );
    dispatch(addSearch({ text: query, type: "studios" }));
  };

  // HELPER: perform artists search
  const searchArtists = async (query: string) => {
    const geoFilter =
      persistedRadiusEnabled && currentLocation
        ? `location:(${currentLocation.latitude}, ${currentLocation.longitude}, ${persistedRadiusValue} km)`
        : null;
    const filterBy = [
      `isArtist:=${true}`,
      geoFilter,
      ...buildFacetFilters("artists"),
    ]
      .filter(Boolean)
      .join(" && ");
    const hits = await searchAll.search({
      collection: "Users",
      query,
      queryBy: "name",
      filterBy: filterBy,
    });
    dispatch(
      updateSearchResults(
        hits.map((h: any) => ({ id: h.document.id, data: h.document })),
      ),
    );
    dispatch(addSearch({ text: query, type: "artists" }));
  };

  // HELPER: perform tattoos search
  const searchTattoos = async (query: string) => {
    dispatch(setTattooLoading(true));
    const filterBy = buildFacetFilters("tattoos").filter(Boolean).join(" && ");

    const hits = await searchAll.search({
      collection: "publications",
      query,
      queryBy: "styles,caption",
      filterBy,
    });
    dispatch(setTattooSearchResults(hits as TattooSearchResult[]));
    dispatch(addSearch({ text: query, type: "tattoos" }));
  };
  // MAIN DO SEARCH
  const doSearch = async (text: string) => {
    // if (!text.trim() && text !== "*") {
    //   dispatch(resetSearchResults());
    //   return;
    // }
    const query = text.trim() === "" ? "*" : text;
    setLoading(true);
    try {
      if (selectedFilter === "studios") {
        await searchStudios(query);
      } else if (selectedFilter === "artists") {
        await searchArtists(query);
      } else {
        await searchTattoos(query);
      }
    } catch (err) {
      console.error("Search error:", err);
      dispatch(resetSearchResults());
    } finally {
      setLoading(false);
      dispatch(setTattooLoading(false));
    }
  };
  const toggleFilter = (value: SearchType) => {
    if (selectedFilter === value) {
      setSelectedFilter(null);
    } else {
      setSelectedFilter(value);
    }
  };
  // 2) inside the component body
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Ask for foreground permission
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (cancelled) return;

        if (status !== "granted") {
          // dispatch(setPermissionDenied(true));
          return;
        }

        // dispatch(setPermissionDenied(false));

        // Get the device’s current position
        const {
          coords: { latitude, longitude },
        } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (!cancelled) {
          dispatch(setCurrentLocation({ latitude, longitude }));
        }
      } catch (err) {
        console.warn("Location error:", err);
        // if (!cancelled) dispatch(setPermissionDenied(true));
      }
    })();

    // cleanup to avoid state updates if component unmounts mid-request
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  // MAIN SEARCH
  useEffect(() => {
    doSearch(searchedText);
  }, [
    selectedFilter,
    searchedText,
    persistedRadiusEnabled,
    persistedRadiusValue,
    persistedRatings,
    persistedStudio,
    persistedStyles,
  ]);

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
          <Text size="h4" color="#A7A7A7" style={styles.heading}>
            {searchedText &&
              (selectedFilter === "tattoos" || selectedFilter === null
                ? `${resultsTattooss?.length} result${resultsTattooss?.length !== 1 ? "s" : ""} for "${searchedText}"`
                : `${resultsArtists?.length} result${resultsArtists?.length !== 1 ? "s" : ""} for "${searchedText}"`)}
          </Text>
        )}
        {loading ? (
          <View style={[StyleSheet.absoluteFill, { top: "45%" }]}>
            <ActivityIndicator size={"large"} />
          </View>
        ) : (
          <>
            {selectedFilter === "tattoos" || selectedFilter === null ? (
              <ImageGallery images={resultsTattooss} />
            ) : (
              <KeyboardAwareFlatList
                data={resultsArtists}
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

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  Text,
  Keyboard,
} from "react-native";
import * as Location from "expo-location";
import { requestForegroundLocationPermission } from "@/utils/locationPermission";
import { MaterialIcons } from "@expo/vector-icons";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import Input from "@/components/Input";
import {
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useBottomSheet from "@/hooks/useBottomSheet";
import useFilterBottomSheet from "@/hooks/useFilterBottomSheet";
import FilterBottomSheet from "@/components/BottomSheets/FilterBottomSheet";
import ArtistProfileBottomSheet from "@/components/BottomSheets/ArtistProfileBottomSheet";
import ArtistMapMarker from "@/components/ArtistMapMarker";
import { GOOGLE_MAPS_API_KEY } from "../../constants/Config";

import {
  selectFilter,
  // setRadiusEnabled,
  // setRadiusValue,
  setRatings as setRatingsAction,
  setStudio as setStudioAction,
  setStyles as setStylesAction,
  setCurrentLocation,
  setCurrentlyViewingArtist,
} from "@/redux/slices/filterSlices";
import { useDispatch, useSelector } from "react-redux";
import { addSearch } from "@/redux/slices/recentSearchesSlice";
import { setTattooLoading } from "@/redux/slices/tattooSlice";
import useTypesense from "@/hooks/useTypesense";
import { useFocusEffect } from "@react-navigation/native";
import type { RootState } from "@/redux/store";
import {
  selectBlockedUserIds,
  selectSafetyHydrated,
} from "@/redux/slices/safetySlice";
import { filterBlockedArtists } from "@/utils/safetyFilters";

// Passed through to the results FlatList. Spread from a variable because the
// component's types don't list FlatList props.
const RESULTS_LIST_PROPS = {
  showsVerticalScrollIndicator: Platform.OS !== "ios",
};

// How far past the visible map artists are fetched, as a share of its size,
// so short pans and zooming in don't need a new search
const VIEWPORT_OFFSET = 0.5;
// Wait for the map to settle before searching
const VIEWPORT_SEARCH_DELAY_MS = 300;
// Typesense's largest page; a crowded view is read over several of them
const ARTISTS_PER_PAGE = 250;
const MAX_ARTIST_PAGES = 4;
const KM_PER_DEGREE = 111.32;
const EARTH_RADIUS_KM = 6371;
// A circle this wide already covers the globe
const WHOLE_EARTH_RADIUS_KM = 20000;

type SearchArea = { latitude: number; longitude: number; radiusKm: number };

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

// The smallest circle that contains the visible map
const toSearchArea = (region: Region): SearchArea => {
  const halfHeightKm = (Math.abs(region.latitudeDelta) / 2) * KM_PER_DEGREE;
  const halfWidthKm =
    (Math.min(Math.abs(region.longitudeDelta), 360) / 2) *
    KM_PER_DEGREE *
    Math.cos(toRadians(region.latitude));
  return {
    latitude: region.latitude,
    longitude: region.longitude,
    radiusKm: Math.hypot(halfHeightKm, halfWidthKm),
  };
};

const distanceKm = (a: SearchArea, b: SearchArea) => {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) *
      Math.cos(toRadians(b.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
};

const FullScreenMapWithSearch: React.FC = () => {
  const { BottomSheet, show, hide } = useFilterBottomSheet();
  const {
    BottomSheet: MapProfileBottomSheet,
    show: showMapProfileBottomSheet,
    hide: hideMapProfileBottomSheet,
  } = useBottomSheet();
  // const artists = useSelector((state: any) => state.artist.allArtists);

  const searchAll = useTypesense();
  // const [selectedArtistId, setSelectedArtistId] = useState("");

  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapTypeState, setMapTypeState] = useState<
    "standard" | "satellite" | "hybrid" | "terrain" | "none"
  >(Platform.OS === "android" ? "none" : "standard");

  const [searchText, setSearchText] = useState("");
  // Artists found in and around the visible map
  const [artists, setArtists] = useState<any[]>([]);
  // What the map currently shows
  const viewportRef = useRef<SearchArea | null>(null);
  // The area the loaded pins fully cover; null when unknown or incomplete
  const fetchedAreaRef = useRef<SearchArea | null>(null);
  const searchIdRef = useRef(0);
  const viewportTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const currentUserId = useSelector((state: RootState) => state.user.user?.uid);
  const blockedUserIds = useSelector(selectBlockedUserIds);
  const safetyHydrated = useSelector(selectSafetyHydrated);
  // Only original artists get a pin on the map
  const visibleArtists = useMemo(
    () =>
      currentUserId && !safetyHydrated
        ? []
        : filterBlockedArtists(artists, blockedUserIds).filter(
            (artist: any) => artist?.data?.originalArtistNumber
          ),
    [artists, blockedUserIds, currentUserId, safetyHydrated]
  );
  const dispatch = useDispatch();
  const mapRef = useRef<MapView>(null);
  const placesRef = useRef<GooglePlacesAutocompleteRef>(null);
  const handleMarkerPress = useCallback(
    (artist: any) => {
      dispatch(setCurrentlyViewingArtist(artist?.data));
      showMapProfileBottomSheet();
    },
    [dispatch, showMapProfileBottomSheet]
  );
  const insets = useSafeAreaInsets();
  const [searchedText, setSearchedText] = useState("");
  const dismissSearch = () => {
    placesRef.current?.blur();
    Keyboard.dismiss();
  };
  const openFilters = () => {
    // The filter sheet has no text input, so drop the search keyboard first.
    dismissSearch();
    show();
  };
  // Zoom from wherever the map currently is, leaving its center alone
  const zoomBy = async (levels: number) => {
    try {
      const camera = await mapRef.current?.getCamera();
      if (camera?.zoom == null) return;
      mapRef.current?.animateCamera({ zoom: camera.zoom + levels });
    } catch {}
  };

  // One zoom level halves the visible span; zooming out widens it 1.5x
  const zoomIn = () => zoomBy(1);
  const zoomOut = () => zoomBy(-Math.log2(1.5));

  const {
    isEnabledRadius: persistedRadiusEnabled,
    radiusValue: persistedRadiusValue,
    ratings: persistedRatings,
    studio: persistedStudio,
    styles: persistedStyles,
    currentLocation,
  } = useSelector(selectFilter);

  // The native "my location" button cannot be repositioned (Android pins it to
  // the top-right), so we hide it on both platforms and render our own below
  // the zoom controls for a consistent look.
  const animateToCoords = (latitude: number, longitude: number) => {
    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    mapRef.current?.animateToRegion(newRegion, 800);
  };

  const goToMyLocation = async () => {
    // Recenter right away on whatever we already know, then refine.
    // getCurrentPositionAsync can take a long time (or never resolve) on
    // Android, so never make the UI wait on it.
    let centered = false;
    if (currentLocation) {
      animateToCoords(currentLocation.latitude, currentLocation.longitude);
      centered = true;
    }
    try {
      const { status } = await requestForegroundLocationPermission();
      if (status !== "granted") return;

      if (!centered) {
        const last = await Location.getLastKnownPositionAsync();
        if (last) {
          animateToCoords(last.coords.latitude, last.coords.longitude);
          centered = true;
        }
      }

      const fresh = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
      ]);
      if (fresh) {
        const { latitude, longitude } = fresh.coords;
        dispatch(setCurrentLocation({ latitude, longitude }));
        animateToCoords(latitude, longitude);
      }
    } catch (err) {
      console.warn("Location error:", err);
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    // 1. Radius toggle
    if (persistedRadiusEnabled) {
      count++;
    }

    // 2. Rating chips
    count += persistedRatings.filter((r) => r.selected).length;

    // 3. Studio chips
    count += persistedStudio.filter((s) => s.selected).length;

    // 4. Style chips
    count += persistedStyles.filter((s) => s.selected).length;

    return count;
  }, [
    persistedRadiusEnabled,
    persistedRatings,
    persistedStudio,
    persistedStyles,
  ]);
  // Removed auto-zoom to artists; we only zoom to user's location.

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await requestForegroundLocationPermission();

        if (cancelled) return;

        if (status !== "granted") {
          return;
        }

        const {
          coords: { latitude, longitude },
        } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (!cancelled) {
          const newRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          dispatch(setCurrentLocation({ latitude, longitude }));
          mapRef.current?.animateToRegion(newRegion, 1000); // optional
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

  // Also refocus to user's current location whenever the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const { status } = await requestForegroundLocationPermission();
          if (cancelled) return;
          if (status !== "granted") return;
          const {
            coords: { latitude, longitude },
          } = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          if (!cancelled) {
            const newRegion = {
              latitude,
              longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            };
            dispatch(setCurrentLocation({ latitude, longitude }));
            mapRef.current?.animateToRegion(newRegion, 800);
          }
        } catch {}
      })();

      return () => {
        cancelled = true;
      };
    }, [dispatch])
  );
  const buildFacetFilters = (type: "tattoos" | "artists"): string[] => {
    const facets: string[] = [];

    if (type === "artists") {
      const selectedRatings = persistedRatings
        .filter((r) => r.selected)
        .map((r) => r.value);
      if (selectedRatings.length > 0) {
        if (selectedRatings.length === 1) {
          facets.push(
            `rating:>=${selectedRatings[0] - 0.1} && rating:<=${
              selectedRatings[0] + 0.1
            }`
          );
        }
      }

      const studioFilter = persistedStudio.filter((s) => s.selected);

      if (studioFilter.length) {
        let studioFilterArr = [];
        for (const s of studioFilter) {
          if (s.name === "homeArtist") {
            studioFilterArr.push(`studio:homeArtist`);
          } else if (s.name === "freelancer") {
            studioFilterArr.push(`studio:freelancer`);
          } else if (s.name === "studio") {
            studioFilterArr.push(`studio:studio`);
          }
        }
        facets.push(`(${studioFilterArr.join(" || ")})`);
      }

      const stylesFiltered = persistedStyles.filter((s) => s.selected);
      if (stylesFiltered.length) {
        const stylesFilterArr = stylesFiltered.map(
          (s) => `tattooStyles:${s.title}`
        );
        facets.push(`(${stylesFilterArr.join(" || ")})`);
      }
    }
    return facets;
  };
  const searchArtists = async (query: string) => {
    const viewport = viewportRef.current;
    // Nothing to search until the map reports what it shows
    if (!viewport) return;
    const area: SearchArea = {
      ...viewport,
      radiusKm: Math.min(
        viewport.radiusKm * (1 + VIEWPORT_OFFSET),
        WHOLE_EARTH_RADIUS_KM
      ),
    };
    const viewportFilter =
      area.radiusKm < WHOLE_EARTH_RADIUS_KM
        ? `location:(${area.latitude}, ${area.longitude}, ${area.radiusKm.toFixed(2)} km)`
        : null;
    const searchId = ++searchIdRef.current;
    const geoFilter =
      persistedRadiusEnabled && currentLocation
        ? `location:(${currentLocation.latitude}, ${currentLocation.longitude}, ${persistedRadiusValue} km)`
        : null;
    const filterBy = [
      `isArtist:=${true}`,
      viewportFilter,
      geoFilter,
      ...buildFacetFilters("artists"),
    ]
      .filter(Boolean)
      .join(" && ");
    const found: any[] = [];
    let complete = false;
    for (let page = 1; page <= MAX_ARTIST_PAGES && !complete; page++) {
      const hits = await searchAll.search({
        collection: "Users",
        query,
        queryBy: "address,city,studioName",
        filterBy: filterBy,
        page,
        per_page: ARTISTS_PER_PAGE,
      });
      // The map moved on, or the filters changed, while this was loading
      if (searchId !== searchIdRef.current) return;
      found.push(
        ...hits.map((h: any) => ({ id: h.document.id, data: h.document }))
      );
      complete = hits.length < ARTISTS_PER_PAGE;
    }
    setArtists(found);
    fetchedAreaRef.current = complete ? area : null;
    dispatch(addSearch({ text: query, type: "artists" }));
  };

  const doSearch = async (text: string) => {
    const query = text.trim() === "" ? "*" : text;
    setLoading(true);
    try {
      await searchArtists(query);
    } catch (err) {
      console.error("Search error:", err);
      // Keep the pins already on the map, but search again on the next move
      fetchedAreaRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  // The location often arrives after the radius filter is switched on, so the
  // search has to re-run with it. Rounded (~100m) so GPS jitter doesn't
  // trigger new searches.
  const geoKey =
    persistedRadiusEnabled && currentLocation
      ? `${currentLocation.latitude.toFixed(3)},${currentLocation.longitude.toFixed(3)}`
      : "";

  useEffect(() => {
    doSearch(searchedText);
  }, [
    searchedText,
    persistedRadiusEnabled,
    persistedRadiusValue,
    geoKey,
    persistedRatings,
    persistedStudio,
    persistedStyles,
  ]);

  // Always the search for the latest text and filters
  const searchViewportRef = useRef(() => {});
  searchViewportRef.current = () => doSearch(searchedText);

  const handleRegionChange = (region: Region) => {
    const viewport = toSearchArea(region);
    viewportRef.current = viewport;
    // Debounced: every move cancels the search queued by the one before it
    clearTimeout(viewportTimerRef.current);
    const fetched = fetchedAreaRef.current;
    // The pins for this view are already loaded
    if (
      fetched &&
      distanceKm(fetched, viewport) + viewport.radiusKm <= fetched.radiusKm
    ) {
      return;
    }
    viewportTimerRef.current = setTimeout(
      () => searchViewportRef.current(),
      VIEWPORT_SEARCH_DELAY_MS
    );
  };

  useEffect(() => () => clearTimeout(viewportTimerRef.current), []);

  // The map doesn't always report its first region, so ask for it once loaded
  const readInitialViewport = async () => {
    if (viewportRef.current) return;
    try {
      const bounds = await mapRef.current?.getMapBoundaries();
      if (!bounds || viewportRef.current) return;
      const { northEast, southWest } = bounds;
      // The span is negative when the view crosses the antimeridian
      const longitudeDelta =
        (northEast.longitude - southWest.longitude + 360) % 360;
      handleRegionChange({
        latitude: (northEast.latitude + southWest.latitude) / 2,
        longitude: southWest.longitude + longitudeDelta / 2,
        latitudeDelta: northEast.latitude - southWest.latitude,
        longitudeDelta,
      });
    } catch {}
  };

  return (
    <View style={styles.container}>
      <BottomSheet
        InsideComponent={<FilterBottomSheet searchActiveFor="artists" />}
      />
      <MapProfileBottomSheet
        InsideComponent={
          // <FilterBottomSheet />
          <ArtistProfileBottomSheet
            hideMapProfileBottomSheet={hideMapProfileBottomSheet}
          />
        }
      />

      {/* Search & Filter */}
      <View style={[styles.searchContainer, { top: insets.top + 10 }]}>
        <View style={{ width: "85%" }}>
          <GooglePlacesAutocomplete
            {...RESULTS_LIST_PROPS}
            placeholder="Search by location"
            fetchDetails
            ref={placesRef}
            keyboardShouldPersistTaps="always"
            enablePoweredByContainer={false}
            onPress={(
              data: GooglePlaceData,
              details: GooglePlaceDetail | null
            ) => {
              if (details && details.geometry) {
                const { lat, lng } = details.geometry.location;
                const newRegion = {
                  latitude: lat,
                  longitude: lng,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                };

                // Only navigate to the selected location without triggering search
                mapRef.current?.animateToRegion(newRegion, 1000);

                // Update the search text for display purposes only
                setSearchText(data.description);
              }
            }}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: "en",
            }}
            styles={{
              textInputContainer: {
                backgroundColor: "#242424",
                borderRadius: 50,
                paddingHorizontal: 12,
                height: 48,
              },
              textInput: {
                flex: 1,
                height: 48,
                fontSize: 16,
                color: "#fff",
                backgroundColor: "transparent",
              },
              listView: {
                borderRadius: 20,
                marginTop: 4,
                backgroundColor: "#242424",
              },
              row: {
                backgroundColor: "#242424",
                paddingVertical: 12,
                paddingHorizontal: 16,
              },
              description: {
                color: "#FBF6FA",
                fontSize: 14,
              },
              predefinedPlacesDescription: {
                color: "#aaa",
              },
            }}
            textInputProps={{
              placeholderTextColor: "#FBF6FA",
              selectionColor: "#fff",
              // value: searchText,
              onChangeText: (text: string) => {
                setSearchText(text);
              },
              returnKeyType: "search",
              onSubmitEditing: () => {
                Keyboard.dismiss();
                setSearchedText(searchText);
              },
              clearButtonMode: "never", // Disable native clear button for iOS
            }}
            renderLeftButton={() => (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: 48,
                }}
              >
                <Image
                  source={require("../../assets/images/search.png")}
                  style={{ width: 24, height: 24, tintColor: "#fff" }}
                  resizeMode="contain"
                />
              </View>
            )}
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openFilters}
          style={styles.filterButton}
        >
          {activeFiltersCount > 0 && (
            <Text
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                backgroundColor: "white",
                height: 20,
                width: 20,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                display: "flex",
                textAlign: "center",
                fontSize: 13,
                lineHeight: 20,
                borderRadius: 10,
              }}
            >
              {activeFiltersCount}
            </Text>
          )}
          <Image
            source={require("../../assets/images/filter.png")}
            resizeMode="contain"
            style={styles.filterIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={[styles.map, !mapReady && { opacity: 0.01 }]}
        customMapStyle={googleDarkModeStyle}
        mapType={mapTypeState}
        showsMyLocationButton={false}
        mapPadding={{ top: insets.top + 60, right: 10, bottom: 0, left: 0 }}
        showsUserLocation
        zoomEnabled
        ref={mapRef}
        onPress={dismissSearch}
        onPanDrag={dismissSearch}
        loadingEnabled
        loadingBackgroundColor="#000"
        loadingIndicatorColor="#fff"
        onRegionChangeComplete={handleRegionChange}
        onMapLoaded={() => {
          setMapReady(true);
          if (mapTypeState !== "standard") setMapTypeState("standard");
          readInitialViewport();
        }}
      >
        {visibleArtists.map((artist: any, index: number) => (
          <ArtistMapMarker
            key={artist?.id ?? index}
            artist={artist}
            onPress={handleMarkerPress}
          />
        ))}
      </MapView>
      {/* Black overlay placeholder to avoid any white flash before map is ready */}
      {!mapReady && <View pointerEvents="none" style={styles.mapOverlay} />}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
          <MaterialIcons name="remove" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={goToMyLocation}>
          <MaterialIcons name="my-location" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#000",
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 30,
    width: "100%",
    paddingHorizontal: 20,
    zIndex: 1,
  },
  filterButton: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    width: 48,
    borderRadius: 50,
    backgroundColor: "#242424",
  },
  filterIcon: {
    height: 26,
    width: 26,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  zoomControls: {
    position: "absolute",
    right: 18,
    bottom: 80,
    flexDirection: "column",
    gap: 10,
  },
  zoomButton: {
    backgroundColor: "#242424",
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});

export default FullScreenMapWithSearch;

const googleDarkModeStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64779e" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f9ba5" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3C7680" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4e6d70" }],
  },
];

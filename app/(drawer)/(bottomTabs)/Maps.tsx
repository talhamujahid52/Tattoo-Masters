import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  Text,
  Pressable,
  Keyboard,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import Input from "@/components/Input";
import {
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
} from "react-native-google-places-autocomplete";
import useBottomSheet from "@/hooks/useBottomSheet";
import FilterBottomSheet from "@/components/BottomSheets/FilterBottomSheet";
import ArtistProfileBottomSheet from "@/components/BottomSheets/ArtistProfileBottomSheet";

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
import {
  resetSearchResults,
  updateSearchResults,
} from "@/redux/slices/artistSlice";
import { addSearch } from "@/redux/slices/recentSearchesSlice";
import { setTattooLoading } from "@/redux/slices/tattooSlice";
import useTypesense from "@/hooks/useTypesense";

type LatLngArray = [number, number];
const FullScreenMapWithSearch: React.FC = () => {
  const { BottomSheet, show, hide } = useBottomSheet();
  const {
    BottomSheet: MapProfileBottomSheet,
    show: showMapProfileBottomSheet,
    hide: hideMapProfileBottomSheet,
  } = useBottomSheet();
  // const artists = useSelector((state: any) => state.artist.allArtists);

  const searchAll = useTypesense();
  // console.log("Artists: ", artists);
  // const [selectedArtistId, setSelectedArtistId] = useState("");

  const [region, setRegion] = useState<Region>({
    latitude: 33.664286,
    longitude: 73.004291,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const artists = useSelector((s: any) => s.artist.searchResults);
  const dispatch = useDispatch();
  const mapRef = useRef<MapView>(null);
  const [searchedText, setSearchedText] = useState("");
  const zoomIn = () => {
    mapRef.current?.animateToRegion({
      ...region,
      latitudeDelta: region.latitudeDelta / 2,
      longitudeDelta: region.longitudeDelta / 2,
    });
    setRegion((prev) => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta / 2,
      longitudeDelta: prev.longitudeDelta / 2,
    }));
  };

  const zoomOut = () => {
    mapRef.current?.animateToRegion({
      ...region,
      latitudeDelta: region.latitudeDelta * 1.5,
      longitudeDelta: region.longitudeDelta * 1.5,
    });
    setRegion((prev) => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta * 1.5,
      longitudeDelta: prev.longitudeDelta * 1.5,
    }));
  };

  const {
    isEnabledRadius: persistedRadiusEnabled,
    radiusValue: persistedRadiusValue,
    ratings: persistedRatings,
    studio: persistedStudio,
    // styles: persistedStyles,
    currentLocation,
  } = useSelector(selectFilter);

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

    return count;
  }, [persistedRadiusEnabled, persistedRatings, persistedStudio]);
  useEffect(() => {
    if (!mapRef.current || artists.length === 0) return;

    // build an array of LatLng objects for each artist
    const coords: { latitude: number; longitude: number }[] = artists
      .map((artist: any) => artist.data.location as LatLngArray | undefined)
      // this type-guard makes sure TS knows loc is [number,number]
      .filter(
        (loc: unknown): loc is LatLngArray =>
          Array.isArray(loc) &&
          loc.length === 2 &&
          typeof loc[0] === "number" &&
          typeof loc[1] === "number"
      )
      // here TS knows latitude and longitude are numbers
      .map(([latitude, longitude]: LatLngArray) => ({
        latitude,
        longitude,
      }));

    if (coords.length === 1) {
      // if there's just one result, zoom in tightly around it
      mapRef.current.animateToRegion({
        ...coords[0],
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } else if (coords.length > 1) {
      // fit all markers in view with some padding
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true,
      });
    }
  }, [artists]);

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
        facets.push(`${studioFilterArr.join(" || ")}`);
      }
    }
    return facets;
  };
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
      queryBy: "address,city,studioName",
      filterBy: filterBy,
    });
    dispatch(
      updateSearchResults(
        hits.map((h: any) => ({ id: h.document.id, data: h.document }))
      )
    );
    dispatch(addSearch({ text: query, type: "artists" }));
  };

  const doSearch = async (text: string) => {
    const query = text.trim() === "" ? "*" : text;
    setLoading(true);
    try {
      await searchArtists(query);
    } catch (err) {
      console.error("Search error:", err);
      dispatch(resetSearchResults());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    doSearch(searchedText);
  }, [
    searchedText,
    persistedRadiusEnabled,
    persistedRadiusValue,
    persistedRatings,
    persistedStudio,
  ]);

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
      <View style={styles.searchContainer}>
        <View style={{ width: "85%" }}>
          <GooglePlacesAutocomplete
            placeholder="Search by location"
            fetchDetails
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
                setRegion(newRegion);

                // Update the search text for display purposes only
                setSearchText(data.description);
              }
            }}
            query={{
              key: "AIzaSyCYsCsuGy8EFd8S8SG4xyU4oPi-0P_yu9k",
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
              value: searchText,
              onChangeText: setSearchText,
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
                  source={require("../../../assets/images/search.png")}
                  style={{ width: 24, height: 24, tintColor: "#fff" }}
                  resizeMode="contain"
                />
              </View>
            )}
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={show}
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
            source={require("../../../assets/images/filter.png")}
            resizeMode="contain"
            style={styles.filterIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={googleDarkModeStyle}
        region={region}
        mapType="standard"
        showsMyLocationButton
        showsUserLocation
        zoomEnabled
        ref={mapRef}
      >
        {artists.map((artist: any, index: number) => {
          const location = artist?.data?.location;
          const profilePic =
            artist?.data?.profilePictureSmall ?? artist?.data?.profilePicture;

          if (!location[0] || !location[1]) return null;

          return (
            <Marker
              key={index}
              coordinate={{
                latitude: location[0],
                longitude: location[1],
              }}
              title={artist?.data?.name || "Artist"}
              onPress={() => {
                dispatch(setCurrentlyViewingArtist(artist?.data));
                showMapProfileBottomSheet();
              }}
            >
              <Pressable style={{ alignItems: "center" }}>
                <Image
                  source={{
                    uri: profilePic
                      ? profilePic
                      : "https://lh3.googleusercontent.com/a/ACg8ocLJTuqJGXUSEPryOs9uSZWlMHe5YwjDWb_vRiYSJKm46KmQM-Sj=s96-c",
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 40,
                    borderWidth: 1,
                    borderColor: "#fff",
                    backgroundColor: "#202020",
                  }}
                />
              </Pressable>
            </Marker>
          );
        })}
      </MapView>
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
          <Text style={styles.zoomText}>−</Text>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  zoomText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
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

import React, { useState, useRef, useEffect } from "react";
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
          typeof loc[1] === "number",
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
    // if (type === "tattoos") {
    //   const stylesFiltered = persistedStyles.filter((s) => s.selected);
    //   if (stylesFiltered.length)
    //     facets.push(
    //       `styles: [${stylesFiltered.map((s) => `${s.title}`).join(",")}]`,
    //     );
    // }
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
        hits.map((h: any) => ({ id: h.document.id, data: h.document })),
      ),
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
          <ArtistProfileBottomSheet />
        }
      />

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <View style={{ width: "85%" }}>
          <Input
            inputMode="text"
            placeholder="Search by location"
            value={searchText}
            onChangeText={setSearchText}
            rightIcon={searchText ? "cancel" : undefined}
            rightIconOnPress={() => {
              setSearchText("");
              setSearchedText("");
            }}
            onSubmitEditing={() => {
              Keyboard.dismiss();
              setSearchedText(searchText);
            }}
            // leftIcon="search"
            returnKeyType="search"
            // rightIcon="cancel"
            leftIcon="search"
            backgroundColour="#242424"
          />
        </View>
        <TouchableOpacity onPress={show} style={styles.filterButton}>
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
                // setSelectedArtistId(artist?.data?.id);
                showMapProfileBottomSheet();
              }}
            >
              <Pressable
                onPress={() => {
                  console.log("artist pressed: ", artist);
                }}
                style={{ alignItems: "center" }}
              >
                <Image
                  source={{
                    uri: profilePic
                      ? profilePic
                      : "https://lh3.googleusercontent.com/a/ACg8ocLJTuqJGXUSEPryOs9uSZWlMHe5YwjDWb_vRiYSJKm46KmQM-Sj=s96-c",
                  }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 40,
                    borderWidth: 2,
                    borderColor: "#fff",
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
    alignItems: "center",
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 30,
    width: "100%",
    paddingHorizontal: 20,
    zIndex: 1,
  },
  filterButton: {
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
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }], // Dark blue-gray background
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#a5b1c2" }], // Light gray text
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d3d8e0" }], // Lighter for location names
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#6b7b8e" }], // Medium light gray roads
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#5c6a7d" }], // Stroke for roads
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }], // White text for road names
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#8696ac" }], // Lighter for highways
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#788ca1" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#717e90" }], // Medium for arterial roads
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#5d6b7e" }], // Darker for local roads
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d5d5d5" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1c3a28" }], // Dark green for parks
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8ab77a" }], // Light green for park labels
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }], // Darker blue for water
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#79a6cf" }], // Blue for water labels
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#283242" }], // POIs slightly lighter than background
  },
  {
    featureType: "poi.business",
    stylers: [{ visibility: "on" }], // Make businesses visible
  },
  {
    featureType: "poi.attraction",
    stylers: [{ visibility: "on" }], // Make attractions visible
  },
  {
    featureType: "transit.station",
    elementType: "labels.icon",
    stylers: [{ visibility: "on" }], // Show transit icons
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "on" }], // Show other icons
  },
];

import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  useMemo,
} from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import MapView, {
  Marker,
  Region,
  Details,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import {
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
} from "react-native-google-places-autocomplete";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Location from "expo-location";
import { requestForegroundLocationPermission } from "@/utils/locationPermission";
import { useSelector } from "react-redux";
import Text from "@/components/Text";
import { FormContext } from "@/context/FormContext";
import { GOOGLE_MAPS_API_KEY } from "@/constants/Config";
import { GOOGLE_DARK_MAP_STYLE } from "@/constants/mapStyles";
import { FINLAND_REGION, isUnsetLocation } from "@/utils/locationHelpers";
import { LocationData } from "@/types/user";
import type { RootState } from "@/redux/store";
import {
  selectBlockedUserIds,
  selectSafetyHydrated,
} from "@/redux/slices/safetySlice";
import { filterBlockedArtists } from "@/utils/safetyFilters";

const DELTA = 0.02;
const FRESH_FIX_TIMEOUT_MS = 6000;
const PLACES_QUERY = { key: GOOGLE_MAPS_API_KEY, language: "en" };

const toRegion = ({ latitude, longitude }: LocationData): Region => ({
  latitude,
  longitude,
  latitudeDelta: DELTA,
  longitudeDelta: DELTA,
});

/**
 * Screen for pinning a location. It is opened from two places:
 *  - registration (Step1): reads/writes the shared FormContext
 *  - EditProfile: receives `latitude`, `longitude`, `city` as params and
 *    returns the chosen values as params (EditProfile keeps its own state)
 * In both cases the saved location is shown if present and valid, otherwise
 * the user's current location, or Finland if they do not share it.
 */
const SearchLocation: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    source?: "edit";
    latitude?: string;
    longitude?: string;
    city?: string;
  }>();
  const { formData, setFormData } = useContext(FormContext)!;
  const artists: any[] = useSelector((s: any) => s.artist.allArtists);
  const currentUserId = useSelector(
    (state: RootState) => state.user.user?.uid,
  );
  const blockedUserIds = useSelector(selectBlockedUserIds);
  const safetyHydrated = useSelector(selectSafetyHydrated);
  // Last position found by the Maps tab, if any
  const knownLocation = useSelector(
    (state: RootState) => state.filter.currentLocation,
  );
  const visibleArtists = useMemo(
    () =>
      currentUserId && !safetyHydrated
        ? []
        : filterBlockedArtists(artists, blockedUserIds),
    [artists, blockedUserIds, currentUserId, safetyHydrated],
  );
  const dismissSearch = () => {
    Keyboard.dismiss();
  };
  const mapRef = useRef<MapView>(null);

  const isEdit = params.source === "edit";
  const savedLocation: LocationData = isEdit
    ? {
        latitude: Number(params.latitude) || 0,
        longitude: Number(params.longitude) || 0,
      }
    : formData.location;

  const hasSavedLocation = !isUnsetLocation(savedLocation);

  // Stays null until we know where to open the map, which is not rendered
  // before that. Otherwise it would open in the middle of the ocean (0,0).
  const [initialRegion, setInitialRegion] = useState<Region | null>(
    hasSavedLocation ? toRegion(savedLocation) : null
  );
  const [region, setRegion] = useState<Region>(initialRegion ?? FINLAND_REGION);
  const [address, setAddress] = useState<string>(
    (isEdit ? params.city : formData.address) || ""
  );
  const userMovedMap = useRef(false);

  const moveTo = (location: LocationData) => {
    const newRegion = toRegion(location);
    setRegion(newRegion);
    setInitialRegion((prev) => prev ?? newRegion);
    mapRef.current?.animateToRegion(newRegion, 800);
  };

  // The fixed pin shifts when the keyboard resizes the screen, so hide it then
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // Centres on the best position we already know, then refines it.
  // getCurrentPositionAsync can take a long time (or never resolve) on
  // Android, so the map never waits on it.
  const goToMyLocation = async (isInitial = false) => {
    let centered = false;
    if (!isUnsetLocation(knownLocation)) {
      moveTo(knownLocation!);
      centered = true;
    }
    try {
      const { status } = await requestForegroundLocationPermission();
      if (status !== "granted") return;

      if (!centered) {
        const last = await Location.getLastKnownPositionAsync();
        if (last) {
          moveTo(last.coords);
          centered = true;
        }
      }

      const fresh = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), FRESH_FIX_TIMEOUT_MS)
        ),
      ]);
      // Don't pull the map away once the user has started picking a place
      if (fresh && !(isInitial && userMovedMap.current)) {
        moveTo(fresh.coords);
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error getting current location:", error);
      }
    } finally {
      // Permission denied or no position found: open on Finland
      setInitialRegion((prev) => prev ?? FINLAND_REGION);
    }
  };

  // No (valid) saved location: fall back to the user's current position
  useEffect(() => {
    if (!hasSavedLocation) goToMyLocation(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocationSelect = (
    _data: GooglePlaceData,
    details: GooglePlaceDetail | null
  ) => {
    if (!details?.geometry) return;

    const { lat, lng } = details.geometry.location;
    const newRegion = toRegion({ latitude: lat, longitude: lng });

    const getComponent = (
      type: GooglePlaceDetail["address_components"][number]["types"][number]
    ) =>
      details.address_components.find((c) => c.types.includes(type))
        ?.long_name || null;

    const city =
      getComponent("locality") ||
      getComponent("administrative_area_level_2") ||
      getComponent("administrative_area_level_1");
    const country = getComponent("country");

    userMovedMap.current = true;
    setAddress([city, country].filter(Boolean).join(", "));
    setRegion(newRegion);
    setInitialRegion((prev) => prev ?? newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const updateAddress = async ({ latitude, longitude }: LocationData) => {
    try {
      const [place] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (place) {
        const city = place.city || place.region || "";
        setAddress(`${city}, ${place.country}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error during reverse geocoding:", error);
      }
    }
  };

  const handleRegionChangeComplete = (newRegion: Region, details: Details) => {
    if (details?.isGesture) userMovedMap.current = true;
    setRegion(newRegion);
    updateAddress(newRegion);
  };

  const handleConfirm = () => {
    const location = { latitude: region.latitude, longitude: region.longitude };

    if (isEdit) {
      router.dismissTo({
        pathname: "/artist/EditProfile",
        params: { ...location, city: address },
      });
      return;
    }

    setFormData((prev) => ({ ...prev, location, city: address }));
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search location"
          fetchDetails
          onPress={handleLocationSelect}
          query={PLACES_QUERY}
          enablePoweredByContainer={false}
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
          }}
          renderLeftButton={() => (
            <View style={styles.searchIcon}>
              <Image
                source={require("../../assets/images/search.png")}
                style={{ width: 24, height: 24, tintColor: "#fff" }}
                resizeMode="contain"
              />
            </View>
          )}
        />
      </View>

      {initialRegion ? (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          customMapStyle={GOOGLE_DARK_MAP_STYLE}
          onPress={dismissSearch}
          onPanDrag={dismissSearch}
          initialRegion={initialRegion}
          // The map does not always report its first region, so make sure the
          // opening position gets an address too
          onMapReady={() => {
            if (!address && !isUnsetLocation(region)) updateAddress(region);
          }}
          onRegionChangeComplete={handleRegionChangeComplete}
          mapType="standard"
          zoomEnabled
        >
          {visibleArtists.map((artist: any, index: number) => {
            const location = artist?.data?.location;
            const profilePic =
              artist?.data?.profilePictureSmall ?? artist?.data?.profilePicture;

            if (!location?.[0] || !location?.[1]) return null;

            return (
              <Marker
                key={artist?.id ?? index}
                coordinate={{ latitude: location[0], longitude: location[1] }}
              >
                <Pressable style={{ alignItems: "center" }}>
                  <Image
                    source={
                      profilePic
                        ? { uri: profilePic }
                        : require("../../assets/images/placeholder.png")
                    }
                    style={styles.artistMarker}
                  />
                </Pressable>
              </Marker>
            );
          })}
        </MapView>
      ) : (
        <View style={styles.locating}>
          <ActivityIndicator color="#fff" />
        </View>
      )}

      {initialRegion && !keyboardVisible && (
        <View style={styles.markerFixed} pointerEvents="none">
          <MaterialIcons name="location-pin" size={42} color="red" />
        </View>
      )}

      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={() => goToMyLocation()}
      >
        <MaterialIcons name="my-location" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.confirmContainer}>
        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
          <Text size="h4" weight="semibold" color="#fff">
            Confirm location
          </Text>
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
    position: "absolute",
    top: 10,
    width: "100%",
    paddingHorizontal: 20,
    zIndex: 10,
    elevation: 10,
  },
  searchIcon: {
    justifyContent: "center",
    alignItems: "center",
    height: 48,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  locating: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  artistMarker: {
    width: 48,
    height: 48,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#202020",
  },
  markerFixed: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -30,
    zIndex: 1,
  },
  // Same look as the button on the Maps tab, sitting above "Confirm location"
  myLocationButton: {
    position: "absolute",
    right: 18,
    bottom: 104,
    backgroundColor: "#242424",
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  confirmContainer: {
    position: "absolute",
    bottom: 40,
    width: "80%",
  },
  button: {
    height: 48,
    width: "100%",
    borderRadius: 30,
    backgroundColor: "#20201E",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SearchLocation;

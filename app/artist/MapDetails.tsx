import React, { useRef, useEffect, useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Camera, PROVIDER_GOOGLE } from "react-native-maps";
import ArtistMapMarker from "@/components/ArtistMapMarker";
import { useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  selectBlockedUserIds,
  selectSafetyHydrated,
} from "@/redux/slices/safetySlice";
import { filterBlockedArtists } from "@/utils/safetyFilters";
import { FINLAND_REGION, toLocationData } from "@/utils/locationHelpers";

const SELECTED_LOCATION_ZOOM_DELTA = 0.003;
const SELECTED_LOCATION_CAMERA_ZOOM = 16.5;

// Null when the param is missing, malformed or not a usable position
const parseLocationParam = (param?: string) => {
  try {
    return toLocationData(JSON.parse(param ?? ""));
  } catch {
    return null;
  }
};

const MapDetails = () => {
  const mapRef = useRef<MapView>(null);
  const artists: any[] = useSelector((s: any) => s.artist.allArtists);
  const currentUserId = useSelector(
    (state: RootState) => state.user.user?.uid,
  );
  const blockedUserIds = useSelector(selectBlockedUserIds);
  const safetyHydrated = useSelector(selectSafetyHydrated);
  const { location, artistId, profilePicture } = useLocalSearchParams();
  const locationParam = Array.isArray(location) ? location[0] : location;
  const selectedArtistId = Array.isArray(artistId) ? artistId[0] : artistId;
  const selectedPicture = Array.isArray(profilePicture)
    ? profilePicture[0]
    : profilePicture;
  // Without a usable location the map opens on Finland instead of zooming in
  const selectedLocation = useMemo(
    () => parseLocationParam(locationParam),
    [locationParam],
  );

  // The artist this screen was opened for always gets a pin, original or not
  const selectedArtist = useMemo(
    () =>
      selectedLocation && {
        id: selectedArtistId,
        data: {
          location: [selectedLocation.latitude, selectedLocation.longitude],
          profilePictureSmall: selectedPicture || undefined,
        },
      },
    [selectedLocation, selectedArtistId, selectedPicture],
  );

  // Everyone else only gets a pin as an original artist
  const visibleArtists = useMemo(
    () =>
      currentUserId && !safetyHydrated
        ? []
        : filterBlockedArtists(artists, blockedUserIds).filter(
            (artist: any) =>
              artist?.data?.originalArtistNumber &&
              artist?.id !== selectedArtistId,
          ),
    [artists, blockedUserIds, currentUserId, safetyHydrated, selectedArtistId],
  );

  const [region, setRegion] = useState(
    selectedLocation
      ? {
          ...selectedLocation,
          latitudeDelta: SELECTED_LOCATION_ZOOM_DELTA,
          longitudeDelta: SELECTED_LOCATION_ZOOM_DELTA,
        }
      : FINLAND_REGION,
  );

  const selectedLocationCamera: Camera | undefined = selectedLocation
    ? {
        center: selectedLocation,
        heading: 0,
        pitch: 0,
        zoom: SELECTED_LOCATION_CAMERA_ZOOM,
      }
    : undefined;

  // const zoomIn = () => {
  //   mapRef.current?.animateToRegion({
  //     ...region,
  //     latitudeDelta: region.latitudeDelta / 2,
  //     longitudeDelta: region.longitudeDelta / 2,
  //   });
  //   setRegion((prev) => ({
  //     ...prev,
  //     latitudeDelta: prev.latitudeDelta / 2,
  //     longitudeDelta: prev.longitudeDelta / 2,
  //   }));
  // };

  // const zoomOut = () => {
  //   mapRef.current?.animateToRegion({
  //     ...region,
  //     latitudeDelta: region.latitudeDelta * 1.5,
  //     longitudeDelta: region.longitudeDelta * 1.5,
  //   });
  //   setRegion((prev) => ({
  //     ...prev,
  //     latitudeDelta: prev.latitudeDelta * 1.5,
  //     longitudeDelta: prev.longitudeDelta * 1.5,
  //   }));
  // };

  useEffect(() => {
    if (selectedLocation && selectedLocationCamera) {
      const newRegion = {
        ...selectedLocation,
        latitudeDelta: SELECTED_LOCATION_ZOOM_DELTA,
        longitudeDelta: SELECTED_LOCATION_ZOOM_DELTA,
      };

      setRegion(newRegion);
      mapRef.current?.animateCamera(selectedLocationCamera, { duration: 800 });
    }
  }, []);

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

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        // Dark from the first frame, instead of white until the tiles load
        loadingEnabled
        loadingBackgroundColor="#000"
        loadingIndicatorColor="#fff"
        style={styles.map}
        customMapStyle={googleDarkModeStyle}
        initialRegion={region}
        initialCamera={selectedLocationCamera}
        onMapReady={() => {
          if (!selectedLocationCamera) return;
          mapRef.current?.animateCamera(selectedLocationCamera, {
            duration: 300,
          });
        }}
        onRegionChangeComplete={() => {}} // prevent location from changing
      >
        {/* <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
        >
          <MaterialIcons name="location-pin" size={42} color="red" />
        </Marker> */}
        {visibleArtists.map((artist: any, index: number) => (
          <ArtistMapMarker key={artist?.id ?? index} artist={artist} />
        ))}
        {selectedArtist && <ArtistMapMarker artist={selectedArtist} />}
      </MapView>
      {/* <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
          <Text style={styles.zoomText}>−</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

export default MapDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // zoomControls: {
  //   position: "absolute",
  //   right: 18,
  //   bottom: 80,
  //   flexDirection: "column",
  //   gap: 10,
  // },
  // zoomButton: {
  //   backgroundColor: "#242424",
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   elevation: 4,
  // },
  // zoomText: {
  //   color: "#fff",
  //   fontSize: 22,
  //   fontWeight: "bold",
  // },
});

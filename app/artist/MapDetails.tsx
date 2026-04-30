import React, { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Text from "@/components/Text";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";

const MapDetails = () => {
  const mapRef = useRef<MapView>(null);
  const artists = useSelector((s: any) => s.artist.allArtists);

  const { location } = useLocalSearchParams();
  const parsedLocation = JSON.parse(location); // [lat, lng]

  const [region, setRegion] = useState({
    latitude: parsedLocation[0],
    longitude: parsedLocation[1],
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

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
    if (parsedLocation) {
      const newRegion = {
        latitude: parsedLocation[0],
        longitude: parsedLocation[1],
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 800);
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
        style={styles.map}
        customMapStyle={googleDarkModeStyle}
        initialRegion={region}
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
            >
              <Pressable style={{ alignItems: "center" }}>
                <Image
                  source={{
                    uri: profilePic
                      ? profilePic
                      : require("../../assets/images/placeholder.png"),
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

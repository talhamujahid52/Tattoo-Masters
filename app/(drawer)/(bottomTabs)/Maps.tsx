import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import Input from "@/components/Input";
import useBottomSheet from "@/hooks/useBottomSheet";
import FilterBottomSheet from "@/components/BottomSheets/FilterBottomSheet";
import Text from "@/components/Text";
import { ErrorBoundaryProps } from "expo-router";

const FullScreenMapWithSearch: React.FC = () => {
  const { BottomSheet, show, hide } = useBottomSheet();

  // State for the map region
  const [region, setRegion] = useState<Region>({
    latitude: 33.664286,
    longitude: 73.004291,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const googleDarkModeStyle = [
    {
      elementType: "geometry",
      stylers: [
        {
          color: "#212121",
        },
      ],
    },
    {
      elementType: "labels.icon",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#757575",
        },
      ],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#212121",
        },
      ],
    },
    {
      featureType: "administrative",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#757575",
        },
      ],
    },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#212121",
        },
      ],
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [
        {
          color: "#212121",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [
        {
          color: "#212121",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [
        {
          color: "#2c6e49",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [
        {
          color: "#3e3e3e",
        },
      ],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [
        {
          color: "#3e3e3e",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [
        {
          color: "#3e3e3e",
        },
      ],
    },
    {
      featureType: "road.local",
      elementType: "geometry",
      stylers: [
        {
          color: "#3e3e3e",
        },
      ],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [
        {
          color: "#2c2c2c",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [
        {
          color: "#000000",
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <BottomSheet InsideComponent={<FilterBottomSheet />} />

      {/* Input field */}
      <View style={styles.searchContainer}>
        <View style={{ width: "80%" }}>
          <Input
            inputMode="text"
            placeholder="Search by location"
            rightIcon={"cancel"}
            leftIcon={"search"}
            backgroundColour="#242424"
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            show();
          }}
          style={styles.filterButton}
        >
          <Image
            source={require("../../../assets/images/filter.png")}
            resizeMode="contain"
            style={styles.filterIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={googleDarkModeStyle}
        region={region} // Dynamically update region based on search
        mapType="terrain"
        showsMyLocationButton
        zoomEnabled
      >
        <Marker coordinate={region} title="Location" />
      </MapView>
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
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 30, // Adjust for iOS status bar
    width: "100%",
    paddingHorizontal: 20,
    zIndex: 1,
  },
  filterButton: {
    display: "flex",
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
    ...StyleSheet.absoluteFillObject, // Makes the map take up the entire screen
  },
});

export default FullScreenMapWithSearch;

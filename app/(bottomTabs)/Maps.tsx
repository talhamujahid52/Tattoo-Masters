import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import Input from "@/components/Input";
import useBottomSheet from "@/hooks/useBottomSheet";
import FilterBottomSheet from "@/components/BottomSheets/FilterBottomSheet";

const FullScreenMapWithSearch: React.FC = () => {
  const { BottomSheet, show, hide } = useBottomSheet();

  // State for the map region
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

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
            source={require("../../assets/images/filter.png")}
            resizeMode="contain"
            style={styles.filterIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region} // Dynamically update region based on search
        mapType="hybrid"
        // showsUserLocation
        showsMyLocationButton
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

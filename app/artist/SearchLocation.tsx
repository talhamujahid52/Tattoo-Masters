import React, { useState, useRef, useContext } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Region, PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useRouter } from "expo-router";
import Button from "@/components/Button";
import { FormContext } from "../../context/FormContext";

const SearchLocation: React.FC = () => {
  const { formData, setFormData } = useContext(FormContext)!;
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  // Set default location if formData.location is empty
  const defaultLocation = {
    latitude: 33.664286,
    longitude: 73.004291,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const [region, setRegion] = useState<Region>({
    latitude: formData.location?.latitude || defaultLocation.latitude,
    longitude: formData.location?.longitude || defaultLocation.longitude,
    latitudeDelta: defaultLocation.latitudeDelta,
    longitudeDelta: defaultLocation.longitudeDelta,
  });

  const [address, setAddress] = useState<string>(
    formData.location?.address || ""
  );

  const handleLocationSelect = (data: any, details: any) => {
    if (details && details.geometry) {
      const { lat, lng } = details.geometry.location;
      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      setRegion(newRegion);
      setAddress(data.description);

      // Update formData when a new location is selected
      setFormData({
        ...formData,
        location: {
          latitude: lat,
          longitude: lng,
          address: data.description,
        },
      });

      // Move the map to the selected location
      mapRef.current?.animateToRegion(newRegion, 1000);
    }
  };

  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    console.log("Updated Coordinates:", {
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
    });

    // Update formData when the map region changes
    setFormData({
      ...formData,
      location: {
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
        address: address, // Address will remain the same unless updated
      },
    });
  };

  const googleDarkModeStyle = [
    {
      elementType: "geometry",
      stylers: [{ color: "#212121" }],
    },
    {
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#212121" }],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Input field */}
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search"
          fetchDetails
          onPress={handleLocationSelect}
          query={{
            key: "AIzaSyCYsCsuGy8EFd8S8SG4xyU4oPi-0P_yu9k", // Add your Google Maps API key here
            language: "en",
          }}
          styles={{
            textInput: {
              fontWeight: "400",
              height: 48,
              borderRadius: 50,
              color: "bl",
              paddingHorizontal: 12,
              // backgroundColor: "#242424",
              fontSize: 16,
            },
          }}
        />
      </View>

      {/* Map View */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={googleDarkModeStyle}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete} // Trigger when map dragging ends
        mapType="standard"
        zoomEnabled
      />

      {/* Center Marker */}
      <View style={styles.markerFixed}>
        <View style={styles.customMarker} />
      </View>

      <View style={{ position: "absolute", bottom: 40, width: "80%" }}>
        <Button
          title="Confirm Location"
          onPress={() => {
            console.log("Selected Location:", {
              latitude: region.latitude,
              longitude: region.longitude,
            });

            // Update formData when the location is confirmed
            setFormData({
              ...formData,
              location: {
                latitude: region.latitude,
                longitude: region.longitude,
                address: address,
              },
            });
            router.back();
          }}
        />
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
    zIndex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerFixed: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -30,
    zIndex: 1,
  },
  customMarker: {
    width: 30,
    height: 30,
    backgroundColor: "blue",
    transform: [{ rotate: "45deg" }],
    borderWidth: 2,
    borderColor: "white",
  },
});

export default SearchLocation;

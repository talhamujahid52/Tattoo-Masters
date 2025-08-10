import React, { useState, useRef, useContext, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import MapView, { Region, PROVIDER_GOOGLE } from "react-native-maps";
import {
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
} from "react-native-google-places-autocomplete";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Button from "@/components/Button";
import { FormContext } from "../../context/FormContext";
import Text from "@/components/Text";
import * as Location from "expo-location";

const SearchLocation: React.FC = () => {
  const { formData, setFormData } = useContext(FormContext)!;
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region>({
    latitude: formData.location?.latitude || 0,
    longitude: formData.location?.longitude || 0,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  const [address, setAddress] = useState<string>(formData.address || "");

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Permission to access location was denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const currentRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };

        setRegion(currentRegion);
        mapRef.current?.animateToRegion(currentRegion, 1000);
      } catch (error) {
        console.error("Error getting current location:", error);
      }
    };

    if (formData.location.latitude === 0 && formData.location.longitude === 0) {
      console.log("Setting Region in Add Location : ", formData.location);
      getCurrentLocation();
    } else {
      const existingRegion = {
        latitude: formData.location.latitude,
        longitude: formData.location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setRegion(existingRegion);
    }
  }, []);

  const handleLocationSelect = (
    data: GooglePlaceData,
    details: GooglePlaceDetail
  ) => {
    if (details && details.geometry) {
      const { lat, lng } = details.geometry.location;
      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      // Helper to extract component by type
      const getComponent = (type: string) =>
        details.address_components.find((c) => c.types.includes(type))
          ?.long_name || null;

      // Extract city and country
      const city =
        getComponent("locality") || // most common
        getComponent("administrative_area_level_2") || // fallback
        getComponent("administrative_area_level_1"); // last resort

      const country = getComponent("country");

      // Set formatted address
      const formattedAddress = [city, country].filter(Boolean).join(", ");
      console.log("Formatted Address ", formattedAddress);
      setAddress(formattedAddress);

      // Update region and animate map
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    }
  };

  const handleRegionChangeComplete = async (newRegion: Region) => {
    setRegion(newRegion);

    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      });

      if (address) {
        console.log("Dragged Address ", address);

        const city = address.city || address.region || "";
        const fullAddress = `${city}, ${address.country}`;
        console.log("Dragged Address ", fullAddress);
        setAddress(fullAddress);
      }
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
    }
  };

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
      <View style={styles.searchContainer}>
        {/* <GooglePlacesAutocomplete
          placeholder="Search location"
          fetchDetails
          onPress={handleLocationSelect}
          query={{
            key: "AIzaSyCYsCsuGy8EFd8S8SG4xyU4oPi-0P_yu9k",
            language: "en",
          }}
          styles={{
            textInputContainer: {
              backgroundColor: "#242424",
              borderRadius: 50,
              paddingHorizontal: 12,
              height: 48, // Ensure height is set
            },
            textInput: {
              flex: 1,
              height: 48,
              fontSize: 16,
              color: "#fff",
              backgroundColor: "transparent",
            },
          }}
          textInputProps={{
            placeholderTextColor: "#FBF6FA",
            selectionColor: "#fff", // Ensures white cursor
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
                style={{ width: 24, height: 24, tintColor: "#ccc" }}
                resizeMode="contain"
              />
            </View>
          )}
        /> */}
        <GooglePlacesAutocomplete
          placeholder="Search location"
          fetchDetails
          onPress={handleLocationSelect}
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
            },
            row: {
              backgroundColor: "#242424",
              paddingVertical: 12,
              paddingHorizontal: 16,
            },
            description: {
              color: "#FBF6FA", // Light text
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

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={googleDarkModeStyle}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        mapType="standard"
        zoomEnabled
      />

      <View style={styles.markerFixed}>
        <MaterialIcons
          name={"location-pin"}
          size={42}
          color="red"
        ></MaterialIcons>
      </View>

      <View style={{ position: "absolute", bottom: 40, width: "80%" }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setFormData({
              ...formData,
              location: {
                latitude: region.latitude,
                longitude: region.longitude,
              },
              city: address,
              locationT: [region.latitude, region.longitude],
            });
            router.back();
          }}
        >
          <Text size="h4" weight="semibold" color="#fff">
            Confirm Location
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

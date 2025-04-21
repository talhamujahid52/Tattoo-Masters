import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  Text,
} from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import Input from "@/components/Input";
import useBottomSheet from "@/hooks/useBottomSheet";
import FilterBottomSheet from "@/components/BottomSheets/FilterBottomSheet";
import ArtistProfileBottomSheet from "@/components/BottomSheets/ArtistProfileBottomSheet";
import { useSelector } from "react-redux";

const FullScreenMapWithSearch: React.FC = () => {
  const { BottomSheet, show, hide } = useBottomSheet();
  const {
    BottomSheet: MapProfileBottomSheet,
    show: showMapProfileBottomSheet,
    hide: hideMapProfileBottomSheet,
  } = useBottomSheet();
  const artists = useSelector((state: any) => state.artist.allArtists);
  // console.log("Artists: ", artists);
  // const [selectedArtistId, setSelectedArtistId] = useState("");

  const [region, setRegion] = useState<Region>({
    latitude: 33.664286,
    longitude: 73.004291,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const mapRef = useRef<MapView>(null);
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
      latitudeDelta: region.latitudeDelta * 1.1,
      longitudeDelta: region.longitudeDelta * 1.1,
    });
    setRegion((prev) => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta * 1.1,
      longitudeDelta: prev.longitudeDelta * 1.1,
    }));
  };

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

  return (
    <View style={styles.container}>
      <BottomSheet InsideComponent={<FilterBottomSheet />} />
      <MapProfileBottomSheet
        InsideComponent={
          // <FilterBottomSheet />
          <ArtistProfileBottomSheet />
        }
      />

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <View style={{ width: "80%" }}>
          <Input
            inputMode="text"
            placeholder="Search by location"
            rightIcon="cancel"
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
          const profilePic = artist?.data?.profilePicture;

          // console.log("location: ", location);
          // console.log("profilePic: ", profilePic);

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
              <View style={{ alignItems: "center" }}>
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
              </View>
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
    right: 20,
    bottom: 40,
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

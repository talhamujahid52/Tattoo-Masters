import React, { useState, useContext, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
} from "react-native";
import Text from "@/components/Text";
import Input from "@/components/Input";
import RadioButton from "@/components/RadioButton";
import ConnectSocialMediaButton from "@/components/ConnectSocialMediaButton";
import MapView, { Region, PROVIDER_GOOGLE } from "react-native-maps";
import { Asset, launchImageLibrary } from "react-native-image-picker";
import { router } from "expo-router";
import { FormContext } from "../context/FormContext";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { UserFirestore } from "@/types/user";
import { useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import StylesBottomSheet from "./BottomSheets/StylesBottomSheet";
import useBottomSheet from "@/hooks/useBottomSheet";
import * as Location from "expo-location";

const Step1: React.FC = () => {
  const {
    BottomSheet: TattooStylesSheet,
    show: showTattooStylesSheet,
    hide: hideTattooStylesSheet,
  } = useBottomSheet();
  const { formData, setFormData } = useContext(FormContext)!;
  const [tattooStyles, setTattooStyles] = useState<
    { title: string; selected: boolean }[]
  >([]);
  const options = [
    { label: "Studio", value: "studio" },
    { label: "Freelancer", value: "freelancer" },
    { label: "Homeartist", value: "homeArtist" },
  ];

  const defaultLocation = {
    latitude: 33.664286,
    longitude: 73.004291,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user,
  );
  const loggedInUserFirestore: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore,
  );

  // Prepopulate the full name field if it is not already set.
  useEffect(() => {
    if (loggedInUserFirestore?.name && formData?.name == "") {
      setFormData((prev) => ({
        ...prev,
        name: loggedInUserFirestore.name,
      }));
    }
  }, [loggedInUserFirestore, loggedInUser, formData.name, setFormData]);

  useEffect(() => {
    const fetchTattooStyles = async () => {
      try {
        const doc = await firestore()
          .collection("Configurations")
          .doc("TattooStyles")
          .get();

        const data = doc.data();
        if (data?.styles && Array.isArray(data.styles)) {
          // Ensure "selected" is set to false
          const formattedStyles = data.styles.map((style: any) => ({
            title: style.title,
            selected: false,
          }));
          setTattooStyles(formattedStyles);
        }
      } catch (error) {
        console.error("Error fetching tattoo styles:", error);
      }
    };

    fetchTattooStyles();
  }, []);

  const localImage = useMemo(() => {
    return {
      uri:
        formData?.profilePicture ??
        loggedInUserFirestore?.profilePictureSmall ??
        loggedInUserFirestore?.profilePicture ??
        loggedInUser?.photoURL ??
        undefined,
    };
  }, [loggedInUser, loggedInUserFirestore, formData]);

  const [region, setRegion] = useState<Region>({
    latitude: formData.location?.latitude || defaultLocation.latitude,
    longitude: formData.location?.longitude || defaultLocation.longitude,
    latitudeDelta: defaultLocation.latitudeDelta,
    longitudeDelta: defaultLocation.longitudeDelta,
  });

  useEffect(() => {
    console.log("Use Effect called in Step 1 : ");
    const getCurrentLocation = async () => {
      console.log("Setting Region in step 1: ");
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Permission to access location was denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const currentRegion: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        console.log("Current Region in step 1: ", currentRegion);

        setRegion(currentRegion);
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    if (formData.location.latitude === 0 && formData.location.longitude === 0) {
      getCurrentLocation();
    }
  }, []);

  const handleProfilePictureSelection = async () => {
    const result = await launchImageLibrary({
      selectionLimit: 1,
      mediaType: "photo",
      includeBase64: true,
      quality: 0.4,
    });
    if (!result.didCancel && result.assets && result.assets[0].uri) {
      const selectedImageUri = result.assets[0].uri;
      setFormData((prev) => ({ ...prev, profilePicture: selectedImageUri }));
    }
  };

  const toggleSwitch = () => {
    setFormData((prev) => ({ ...prev, showCityOnly: !prev.showCityOnly }));
  };

  const toggleTattooStyles = (tattooStyle: {
    title: string;
    selected: boolean;
  }) => {
    const updatedTattooStyles = tattooStyles.map((item) =>
      item.title === tattooStyle.title
        ? { ...item, selected: !item.selected }
        : item,
    );
    setTattooStyles(updatedTattooStyles);
    const selectedTattooStyles = updatedTattooStyles.filter(
      (item) => item.selected,
    );
    setFormData((prev) => ({ ...prev, tattooStyles: selectedTattooStyles }));
  };

  const setSelectedTattooStyles = (
    updatedStyles: { title: string; selected: boolean }[],
  ) => {
    setTattooStyles(updatedStyles);
    const selected = updatedStyles.filter((item) => item.selected);
    setFormData((prev) => ({ ...prev, tattooStyles: selected }));
  };

  useEffect(() => {
    setRegion({
      latitude: formData.location?.latitude || defaultLocation.latitude,
      longitude: formData.location?.longitude || defaultLocation.longitude,
      latitudeDelta: defaultLocation.latitudeDelta,
      longitudeDelta: defaultLocation.longitudeDelta,
    });
  }, [formData.location]);

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
    <ScrollView style={styles.container}>
      <TattooStylesSheet
        InsideComponent={
          <StylesBottomSheet
            tattooStyles={tattooStyles}
            setSelectedTattooStyles={setSelectedTattooStyles}
            hideTattooStylesSheet={hideTattooStylesSheet}
          />
        }
      />
      <View style={styles.profilePictureRow}>
        <Image style={styles.profilePicture} source={localImage} />
        <TouchableOpacity onPress={handleProfilePictureSelection}>
          <Text size="h4" weight="semibold" color="#DAB769">
            Change photo
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginBottom: 16 }}>
        <Text
          size="h4"
          weight="semibold"
          color="#A7A7A7"
          style={{ marginBottom: 10 }}
        >
          Full Name
        </Text>
        <Input
          inputMode="text"
          placeholder="Full Name"
          value={formData.name}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, name: text }))
          }
        />
      </View>
      <RadioButton
        title="Studio"
        options={options}
        selectedValue={formData.studio}
        inputValue={formData.studioName}
        onSelect={(value) =>
          setFormData((prev) => ({ ...prev, studio: value }))
        }
        onStudioNameChange={(name) =>
          setFormData((prev) => ({ ...prev, studioName: name }))
        }
      />

      <View style={{ marginTop: 6 }}>
        <Text
          size="h4"
          weight="semibold"
          color="#A7A7A7"
          style={{ marginBottom: 10 }}
        >
          Address
        </Text>
        <Input
          inputMode="text"
          placeholder="Address"
          value={formData.address}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, address: text }))
          }
        />
      </View>
      <View style={{ marginTop: 16 }}>
        <Text
          size="h4"
          weight="semibold"
          color="#A7A7A7"
          style={{ marginBottom: 10 }}
        >
          Pin your location
        </Text>
        {!formData.showCityOnly && (
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/artist/SearchLocation",
              });
            }}
            style={{
              height: 130,
              borderRadius: 20,
              overflow: "hidden",
              marginTop: 8,
              marginBottom: 16,
            }}
          >
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              mapType="standard"
              customMapStyle={googleDarkModeStyle}
              region={region}
              scrollEnabled={false}
            >
              {/* <Marker coordinate={region} title="Location" />  */}
            </MapView>
          </TouchableOpacity>
        )}
        {/* <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <Text
            size="h4"
            weight="normal"
            color="#FBF6FA"
            style={{ marginBottom: 10 }}
          >
            Show city only
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#44e52c" }}
            thumbColor={formData.showCityOnly ? "#fff" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={formData.showCityOnly}
          />
        </View> */}
        <View>
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Styles{" "}
            {formData?.tattooStyles?.length > 0
              ? "(" + formData?.tattooStyles?.length + " selected)"
              : ""}
          </Text>
          <View style={styles.ratingButtonsRow}>
            {tattooStyles.slice(0, 6).map((item, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={1}
                style={{
                  padding: 6,
                  borderRadius: 6,
                  backgroundColor: item.selected ? "#DAB769" : "#262526",
                }}
                onPress={() => toggleTattooStyles(item)}
              >
                <Text
                  size="p"
                  weight="normal"
                  color={item.selected ? "#22221F" : "#A7A7A7"}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
            {tattooStyles.length > 6 && (
              <TouchableOpacity
                onPress={() => {
                  showTattooStylesSheet();
                }}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 6,
                }}
              >
                <Text size="p" weight="normal" color="#FBF6FA">
                  {"See More"}
                </Text>
                <View style={{ width: 24, height: 24 }}>
                  <Image
                    style={{ width: "100%", height: "100%" }}
                    source={require("../assets/images/arrow_down.png")}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={{ marginTop: 16, marginBottom: 16 }}>
          <Text
            size="h4"
            weight="semibold"
            color="#A7A7A7"
            style={{ marginBottom: 10 }}
          >
            About you
          </Text>
          <TextInput
            selectionColor="#A29F93"
            placeholderTextColor="#A29F93"
            placeholder="My Intro"
            multiline
            value={formData.aboutYou}
            style={styles.textArea}
            maxLength={500}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, aboutYou: text }))
            }
          />
          <Text
            size="medium"
            weight="normal"
            color="#A7A7A7"
            style={{ textAlign: "right", marginTop: 4 }}
          >
            {formData.aboutYou.length} / 500
          </Text>
        </View>
        <View style={{ marginBottom: 70 }}>
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Connect your social media accounts
          </Text>
          <View
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
              marginBottom: 24,
            }}
          >
            <Input
              inputMode="text"
              placeholder="Facebook profile"
              value={formData.facebookProfile}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, facebookProfile: text }))
              }
            />
            <Input
              inputMode="text"
              placeholder="Instagram profile"
              value={formData.instagramProfile}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, instagramProfile: text }))
              }
            />
            <Input
              inputMode="text"
              placeholder="Twitter profile"
              value={formData.twitterProfile}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, twitterProfile: text }))
              }
            />

            {/* <ConnectSocialMediaButton
              title="Facebook Connected"
              icon={require("../assets/images/facebook_2.png")}
              onConnect={() => {
                alert("This Functionality is not Available.");
              }}
              onDisconnect={() => {
                alert("This Functionality is not Available.");
              }}
              isConnected={true}
            /> */}
            {/* <ConnectSocialMediaButton
              title="Connect Instagram"
              icon={require("../assets/images/instagram.png")}
              onConnect={() => {
                alert("This Functionality is not Available.");
              }}
              onDisconnect={() => {
                alert("This Functionality is not Available.");
              }}
              isConnected={false}
            /> */}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#FFFFFF56",
    borderRadius: 20,
  },
  profilePictureRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  profilePicture: {
    borderRadius: 57,
    width: 114,
    height: 114,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#202020",
  },
  ratingButtonsRow: {
    marginTop: 16,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  textArea: {
    height: 100,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#FFFFFF1A",
    color: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Makes the map take up the entire screen
  },
});

export default Step1;

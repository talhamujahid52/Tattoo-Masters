import React, { useState, useContext, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import Text from "@/components/Text";
import Input from "@/components/Input";
import RadioButton from "@/components/RadioButton";
import MapView, { Region, PROVIDER_GOOGLE } from "react-native-maps";
import { launchImageLibrary } from "react-native-image-picker";
import { router } from "expo-router";
import { FormContext } from "../context/FormContext";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { UserFirestore } from "@/types/user";
import { useSelector } from "react-redux";
import StylesBottomSheet from "./BottomSheets/StylesBottomSheet";
import useBottomSheet from "@/hooks/useBottomSheet";
import * as Location from "expo-location";
import useTattooStyles from "@/hooks/useTattooStyles";
import { GOOGLE_DARK_MAP_STYLE } from "@/constants/mapStyles";
import { STUDIO_TYPE_OPTIONS } from "@/constants/studioOptions";
import { isUnsetLocation } from "@/utils/locationHelpers";

const DEFAULT_LOCATION = {
  latitude: 0,
  longitude: 0,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

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

  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user
  );
  const loggedInUserFirestore: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore
  );

  // Prepopulate name and profile picture from the logged-in user when empty.
  useEffect(() => {
    if (loggedInUserFirestore?.name && formData.name === "") {
      setFormData((prev) => ({
        ...prev,
        name: loggedInUserFirestore.name,
      }));
    }
    if (!formData.profilePicture) {
      const profilePictureUri =
        loggedInUserFirestore?.profilePictureSmall ??
        loggedInUserFirestore?.profilePicture ??
        loggedInUser?.photoURL;

      if (profilePictureUri) {
        setFormData((prev) => ({
          ...prev,
          profilePicture: profilePictureUri,
        }));
      }
    }
  }, [
    loggedInUserFirestore,
    loggedInUser,
    formData.name,
    formData.profilePicture,
    setFormData,
  ]);

  const { titles: fetchedStyleTitles } = useTattooStyles();
  useEffect(() => {
    if (fetchedStyleTitles.length === 0) return;

    const selectedTitles = new Set(
      formData.tattooStyles.map((style) => style.title)
    );
    setTattooStyles(
      fetchedStyleTitles.map((title) => ({
        title,
        selected: selectedTitles.has(title),
      }))
    );
  }, [fetchedStyleTitles, formData.tattooStyles]);

  const localImage = useMemo(() => {
    const remoteUri =
      formData.profilePicture ??
      loggedInUserFirestore?.profilePictureSmall ??
      loggedInUserFirestore?.profilePicture ??
      loggedInUser?.photoURL;

    if (remoteUri) {
      return { uri: remoteUri };
    }

    return require("../assets/images/placeholder.png");
  }, [formData.profilePicture, loggedInUser, loggedInUserFirestore]);

  const [region, setRegion] = useState<Region>({
    latitude: formData.location?.latitude || DEFAULT_LOCATION.latitude,
    longitude: formData.location?.longitude || DEFAULT_LOCATION.longitude,
    latitudeDelta: DEFAULT_LOCATION.latitudeDelta,
    longitudeDelta: DEFAULT_LOCATION.longitudeDelta,
  });

  useEffect(() => {
    if (!isUnsetLocation(formData.location)) return;

    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const currentRegion: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(currentRegion);
        setFormData((prev) => ({
          ...prev,
          location: { latitude, longitude },
        }));
      } catch (error) {
        if (__DEV__) {
          console.error("Error getting location:", error);
        }
      }
    };

    getCurrentLocation();
  }, [formData.location, setFormData]);

  const handleProfilePictureSelection = async () => {
    const result = await launchImageLibrary({
      selectionLimit: 1,
      mediaType: "photo",
      quality: 0.4,
    });
    if (!result.didCancel && result.assets && result.assets[0].uri) {
      const selectedImageUri = result.assets[0].uri;
      setFormData((prev) => ({ ...prev, profilePicture: selectedImageUri }));
    }
  };

  const toggleTattooStyles = (tattooStyle: {
    title: string;
    selected: boolean;
  }) => {
    const updatedTattooStyles = tattooStyles.map((item) =>
      item.title === tattooStyle.title
        ? { ...item, selected: !item.selected }
        : item
    );
    setTattooStyles(updatedTattooStyles);
    const selectedTattooStyles = updatedTattooStyles.filter(
      (item) => item.selected
    );
    setFormData((prev) => ({ ...prev, tattooStyles: selectedTattooStyles }));
  };

  const setSelectedTattooStyles = (
    updatedStyles: { title: string; selected: boolean }[]
  ) => {
    setTattooStyles(updatedStyles);
    const selected = updatedStyles.filter((item) => item.selected);
    setFormData((prev) => ({ ...prev, tattooStyles: selected }));
  };

  useEffect(() => {
    if (isUnsetLocation(formData.location)) return;

    setRegion({
      latitude: formData.location.latitude,
      longitude: formData.location.longitude,
      latitudeDelta: DEFAULT_LOCATION.latitudeDelta,
      longitudeDelta: DEFAULT_LOCATION.longitudeDelta,
    });
  }, [formData.location]);

  return (
    <ScrollView style={styles.container}>
      <TattooStylesSheet
        snapPoints={["90%"]}
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
        options={[...STUDIO_TYPE_OPTIONS]}
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
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/artist/SearchLocation",
            });
          }}
          style={styles.mapPreview}
        >
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            mapType="standard"
            customMapStyle={GOOGLE_DARK_MAP_STYLE}
            region={region}
            scrollEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            pointerEvents="none"
          />
        </TouchableOpacity>
        <View>
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Styles{" "}
            {formData.tattooStyles.length > 0
              ? `(${formData.tattooStyles.length} selected)`
              : ""}
          </Text>
          <View style={styles.ratingButtonsRow}>
            {tattooStyles.slice(0, 6).map((item) => (
              <TouchableOpacity
                key={item.title}
                activeOpacity={0.7}
                style={[
                  styles.styleChip,
                  {
                    backgroundColor: item.selected ? "#DAB769" : "#262526",
                  },
                ]}
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
                onPress={showTattooStylesSheet}
                style={styles.seeMoreButton}
              >
                <Text size="p" weight="normal" color="#FBF6FA">
                  See more
                </Text>
                <View style={styles.seeMoreIcon}>
                  <Image
                    style={styles.seeMoreIconImage}
                    source={require("../assets/images/arrow_down.png")}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.aboutSection}>
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
            placeholder="Enter text"
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
            style={styles.charCount}
          >
            {formData.aboutYou.length} / 500
          </Text>
        </View>
        <View style={styles.socialSection}>
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Connect your social media accounts
          </Text>
          <View style={styles.socialInputs}>
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
              placeholder="X profile"
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
  mapPreview: {
    height: 130,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 16,
  },
  ratingButtonsRow: {
    marginTop: 16,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  styleChip: {
    height: 33,
    paddingHorizontal: 6,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  seeMoreButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  seeMoreIcon: {
    width: 24,
    height: 24,
  },
  seeMoreIconImage: {
    width: "100%",
    height: "100%",
  },
  aboutSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#FFFFFF1A",
    color: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlignVertical: "top",
  },
  charCount: {
    textAlign: "right",
    marginTop: 4,
  },
  socialSection: {
    marginBottom: 70,
  },
  socialInputs: {
    display: "flex",
    gap: 10,
    marginTop: 10,
    marginBottom: 24,
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Makes the map take up the entire screen
  },
});

export default Step1;

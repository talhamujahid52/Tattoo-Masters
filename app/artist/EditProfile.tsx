import {
  Alert,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useMemo, useState, useEffect } from "react";
import Text from "@/components/Text";
import Input from "@/components/Input";
import LocationField, { ResolvedLocation } from "@/components/LocationField";
import RadioButton from "@/components/RadioButton";
import StyleChips from "@/components/StyleChips";
import ConnectSocialMediaButton from "@/components/ConnectSocialMediaButton";
import Button from "@/components/Button";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { requestForegroundLocationPermission } from "@/utils/locationPermission";
import { FINLAND_REGION, isUnsetLocation } from "@/utils/locationHelpers";
import { GOOGLE_DARK_MAP_STYLE } from "@/constants/mapStyles";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { Asset, launchImageLibrary } from "react-native-image-picker";
import { useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { LocationData, UserFirestore } from "@/types/user";
import { useDispatch } from "react-redux";
import { setUserFirestoreData } from "@/redux/slices/userSlice";
import { getUpdatedUser } from "@/utils/firebase/userFunctions";
import { changeProfilePicture } from "@/utils/firebase/changeProfilePicture";
import StylesBottomSheet from "../../components/BottomSheets/StylesBottomSheet";
import useBottomSheet from "@/hooks/useBottomSheet";
import KeyboardAwareScrollView from "@/components/KeyboardAwareScrollView";

type TattooStyle = {
  title: string;
  selected: boolean;
};

const PIN_DELTA = 0.02;

const toRegion = ({ latitude, longitude }: LocationData): Region => ({
  latitude,
  longitude,
  latitudeDelta: PIN_DELTA,
  longitudeDelta: PIN_DELTA,
});

const EditProfile = () => {
  const {
    BottomSheet: TattooStylesSheet,
    show: showTattooStylesSheet,
    hide: hideTattooStylesSheet,
  } = useBottomSheet();

  const loggedInUserAuth: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user
  );
  const dispatch = useDispatch();
  const loggedInUser: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore
  );
  const currentUserId = loggedInUserAuth?.uid;

  const [tattooStyles, setTattooStyles] = useState<TattooStyle[]>([]);
  const [formData, setFormData] = useState({
    profilePicture:
      loggedInUser?.profilePictureSmall ?? loggedInUser.profilePicture,
    name: loggedInUser?.name ? loggedInUser?.name : "",
    studio: loggedInUser?.studio ? loggedInUser?.studio : "",
    studioName: loggedInUser?.studio ? loggedInUser?.studioName : "",
    city: loggedInUser?.city ? loggedInUser?.city : "",
    location: {
      latitude: loggedInUser?.location?.latitude || 0,
      longitude: loggedInUser?.location?.longitude || 0,
    },
    showCityOnly: true,
    // Profiles saved before the address came from the pin may only have a
    // city, which then stands in for it
    address: loggedInUser?.address || loggedInUser?.city || "",
    tattooStyles: [] as TattooStyle[],
    aboutYou: loggedInUser?.aboutYou ? loggedInUser?.aboutYou : "",
    facebookProfile: loggedInUser?.facebookProfile
      ? loggedInUser?.facebookProfile
      : "",
    instagramProfile: loggedInUser?.instagramProfile
      ? loggedInUser?.instagramProfile
      : "",
    twitterProfile: loggedInUser?.twitterProfile
      ? loggedInUser?.twitterProfile
      : "",
  });

  const options = [
    { label: "Studio", value: "studio" },
    { label: "Freelancer", value: "freelancer" },
    { label: "Home artist", value: "homeArtist" },
  ];

  // Fetch tattoo styles from Firestore
  useEffect(() => {
    const fetchTattooStyles = async () => {
      try {
        const doc = await firestore()
          .collection("Configurations")
          .doc("TattooStyles")
          .get();

        const data = doc.data();
        if (data?.styles && Array.isArray(data.styles)) {
          // Format styles and mark selected ones based on user's existing selections
          const formattedStyles = data.styles.map((style: any) => ({
            title: style.title,
            selected: loggedInUser?.tattooStyles
              ? loggedInUser.tattooStyles.includes(style.title)
              : false,
          }));
          setTattooStyles(formattedStyles);

          // Update form data with selected styles
          const selectedStyles = formattedStyles.filter(
            (style: TattooStyle) => style.selected
          );
          setFormData((prev) => ({
            ...prev,
            tattooStyles: selectedStyles,
          }));
        }
      } catch (error) {
        console.error("Error fetching tattoo styles:", error);
      }
    };

    fetchTattooStyles();
  }, [loggedInUser?.tattooStyles]);

  const toggleTattooStyles = (tattooStyle: TattooStyle) => {
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

  const setSelectedTattooStyles = (updatedStyles: TattooStyle[]) => {
    setTattooStyles(updatedStyles);
    const selected = updatedStyles.filter((item) => item.selected);
    setFormData((prev) => ({ ...prev, tattooStyles: selected }));
  };

  const [newImage, setNewImage] = useState<Asset>();
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<Region>(
    isUnsetLocation(formData.location)
      ? FINLAND_REGION
      : toRegion(formData.location)
  );
  // Location chosen on the SearchLocation screen comes back as params
  const picked = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
    city?: string;
    address?: string;
    // Changes on every pick, so picking the same place again after clearing
    // the field still counts
    pickedAt?: string;
  }>();
  useEffect(() => {
    const latitude = Number(picked.latitude);
    const longitude = Number(picked.longitude);
    if (!latitude || !longitude) return;

    setFormData((prev) => ({
      ...prev,
      location: { latitude, longitude },
      city: picked.city ?? prev.city,
      address: picked.address || prev.address,
    }));
    setRegion(toRegion({ latitude, longitude }));
  }, [
    picked.latitude,
    picked.longitude,
    picked.city,
    picked.address,
    picked.pickedAt,
  ]);

  // The pin follows the location field
  const pinLocation = ({ location, city, address }: ResolvedLocation) => {
    setFormData((prev) => ({
      ...prev,
      location,
      city: city || prev.city,
      address: address || prev.address,
    }));
    setRegion(toRegion(location));
  };

  // The address, city and pin are one thing, so they are cleared together
  const clearLocation = () => {
    setFormData((prev) => ({
      ...prev,
      address: "",
      city: "",
      location: { latitude: 0, longitude: 0 },
    }));
    setRegion(FINLAND_REGION);
  };

  // No saved location: ask for the user's current position and centre the map
  // on it. Without permission the map stays on Finland.
  useEffect(() => {
    if (!isUnsetLocation(formData.location)) return;

    // Set once a location is picked, so a late fix does not move the map back
    let cancelled = false;

    const showCurrentLocation = async () => {
      try {
        const { status } = await requestForegroundLocationPermission();
        if (status !== "granted") return;

        // getCurrentPositionAsync can take a long time on Android, so show
        // the last known position while waiting for it
        const last = await Location.getLastKnownPositionAsync();
        if (last && !cancelled) setRegion(toRegion(last.coords));

        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) setRegion(toRegion(coords));
      } catch (error) {
        if (__DEV__) {
          console.error("Error getting location:", error);
        }
      }
    };

    showCurrentLocation();
    return () => {
      cancelled = true;
    };
  }, [formData.location]);
  const openLocationPicker = () => {
    router.push({
      pathname: "/artist/SearchLocation",
      params: {
        source: "edit",
        latitude: formData.location.latitude,
        longitude: formData.location.longitude,
        city: formData.city,
        address: formData.address,
      },
    });
  };
  const localImage = useMemo(() => {
    if (!newImage) {
      return {
        uri:
          loggedInUser?.profilePictureSmall ??
          loggedInUser?.profilePicture ??
          loggedInUserAuth?.photoURL ??
          undefined,
      };
    }
    return { uri: newImage.uri ?? undefined };
  }, [newImage, loggedInUserAuth, loggedInUser]);

  const handleProfilePictureChange = async (newImageUri: string) => {
    const TIMEOUT_MS = 120000; // 2 minutes

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Profile picture update timed out!")),
        TIMEOUT_MS
      )
    );

    try {
      const fileName = "profile.jpeg";

      // Race between changeProfilePicture and the timeout
      await Promise.race([
        changeProfilePicture(currentUserId, newImageUri, fileName),
        timeoutPromise,
      ]);
    } catch (error) {
      console.error("Failed to update profile picture:", error);
    }
  };
  const toggleSwitch = () => {
    setFormData((prev) => ({ ...prev, showCityOnly: !prev.showCityOnly }));
  };
  const updateProfile = async () => {
    // The typed location and its pin are both needed to save
    if (!formData.address.trim()) {
      Alert.alert(
        "Location Required",
        "Please enter your location to continue."
      );
      return;
    }
    if (isUnsetLocation(formData.location)) {
      Alert.alert(
        "Location Required",
        "Please pin your location on the map to continue."
      );
      return;
    }

    try {
      setLoading(true);
      // Transform the array to include only the titles for which selected is true:
      const firebaseTattooStyles = formData.tattooStyles.map(
        (style: TattooStyle) => style.title
      );

      await firestore()
        .collection("Users")
        .doc(currentUserId)
        .set(
          {
            ...formData,
            tattooStyles: firebaseTattooStyles,
          },
          { merge: true }
        );
      if (newImage?.uri) {
        await handleProfilePictureChange(newImage.uri);
      }
      // Fetch the updated user data and update Redux.
      const updatedUser = await getUpdatedUser(currentUserId);
      dispatch(setUserFirestoreData(updatedUser));
      router.back();
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const openImagePicker = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 1,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.error("ImagePicker Error: ", response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          if (asset.uri) {
            setNewImage(asset);
          }
        }
      }
    );
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
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
        <Image
          style={styles.profilePicture}
          source={localImage ?? require("../../assets/images/placeholder.png")}
        />
        <TouchableOpacity onPress={openImagePicker}>
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
          Location
        </Text>
        <LocationField
          placeholder="Location"
          value={formData.address}
          onChangeText={(address) =>
            setFormData((prev) => ({ ...prev, address }))
          }
          onResolve={pinLocation}
          onClear={clearLocation}
        />
      </View>
      <View style={{ marginTop: 16 }}>
        <Text
          size="h4"
          weight="semibold"
          color="#A7A7A7"
          style={{ marginBottom: 10 }}
        >
          Pin your exact location
        </Text>
        {formData.showCityOnly && (
          <TouchableOpacity
            onPress={openLocationPicker}
            style={{
              height: 130,
              borderRadius: 20,
              overflow: "hidden",
              marginTop: 8,
              marginBottom: 16,
            }}
          >
            {/* A still preview: the wrapper keeps every touch off the map, so
                a tap anywhere opens the picker */}
            <View style={styles.map} pointerEvents="none">
              <MapView
                provider={PROVIDER_GOOGLE}
                // Dark from the first frame, instead of white until the tiles load
                loadingBackgroundColor="#000"
                style={styles.map}
                customMapStyle={GOOGLE_DARK_MAP_STYLE}
                mapType="standard"
                region={region}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                toolbarEnabled={false}
              >
                {!isUnsetLocation(formData.location) && (
                  <Marker coordinate={formData.location} />
                )}
              </MapView>
            </View>
          </TouchableOpacity>
        )}
        {/* <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 16,
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
          <StyleChips
            styles={tattooStyles}
            onToggle={toggleTattooStyles}
            onSeeMore={showTattooStylesSheet}
          />
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
              placeholder="X profile"
              value={formData.twitterProfile}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, twitterProfile: text }))
              }
            />
            {/* <ConnectSocialMediaButton
              title="Facebook Connected"
              icon={require("../../assets/images/facebook_2.png")}
              onConnect={() => alert("This Functionality is not Available.")}
              onDisconnect={() => alert("This Functionality is not Available.")}
              isConnected={true}
            />
            <ConnectSocialMediaButton
              title="Connect Instagram"
              icon={require("../../assets/images/instagram.png")}
              onConnect={() => alert("This Functionality is not Available.")}
              onDisconnect={() => alert("This Functionality is not Available.")}
              isConnected={false}
            /> */}
          </View>
          <Button loading={loading} title="Save" onPress={updateProfile} />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: "#000",
    padding: 16,
    borderTopWidth: 0.33,
    borderColor: "#2D2D2D",
  },
  profilePictureRow: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  profilePicture: {
    width: 114,
    height: 114,
    resizeMode: "cover",
    overflow: "hidden",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#202020",
  },
  textArea: {
    height: 100,
    width: "100%",
    textAlignVertical: "top",
    borderRadius: 12,
    backgroundColor: "#FFFFFF1A",
    color: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

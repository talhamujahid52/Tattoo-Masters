import {
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
import RadioButton from "@/components/RadioButton";
import ConnectSocialMediaButton from "@/components/ConnectSocialMediaButton";
import Button from "@/components/Button";
import { router } from "expo-router";
import MapView, { Region, PROVIDER_GOOGLE } from "react-native-maps";
import { Asset, launchImageLibrary } from "react-native-image-picker";
import { useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { UserFirestore } from "@/types/user";
import { useDispatch } from "react-redux";
import { setUserFirestoreData } from "@/redux/slices/userSlice";
import { getUpdatedUser } from "@/utils/firebase/userFunctions";
import { changeProfilePicture } from "@/utils/firebase/changeProfilePicture";
import StylesBottomSheet from "../../components/BottomSheets/StylesBottomSheet";
import useBottomSheet from "@/hooks/useBottomSheet";

type TattooStyle = {
  title: string;
  selected: boolean;
};

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
    address: loggedInUser?.address ? loggedInUser?.address : "",
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
    { label: "Homeartist", value: "homeArtist" },
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
  const defaultLocation = {
    latitude: 33.664286,
    longitude: 73.004291,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: formData.location.latitude || defaultLocation.latitude,
    longitude: formData.location.longitude || defaultLocation.longitude,
    latitudeDelta: defaultLocation.latitudeDelta,
    longitudeDelta: defaultLocation.longitudeDelta,
  });
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
      const profilePictureUrls = await Promise.race([
        changeProfilePicture(currentUserId, newImageUri, fileName),
        timeoutPromise,
      ]);

      console.log("New resized profile picture URLs:", profilePictureUrls);
    } catch (error) {
      console.error("Failed to update profile picture:", error);
    }
  };
  const toggleSwitch = () => {
    setFormData((prev) => ({ ...prev, showCityOnly: !prev.showCityOnly }));
  };
  const updateProfile = async () => {
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
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.errorCode) {
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
        <Image
          style={styles.profilePicture}
          source={
            localImage ?? require("../../assets/images/profilePicture.png")
          }
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
        <Input
          inputMode="text"
          placeholder="Location"
          value={formData.city}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, city: text }))
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
          Pin your exact location
        </Text>
        {formData.showCityOnly && (
          <TouchableOpacity
            onPress={() => {
              router.push({ pathname: "/artist/SearchLocation" });
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
              customMapStyle={googleDarkModeStyle}
              mapType="standard"
              region={region}
            />
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
                    source={require("../../assets/images/arrow_down.png")}
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
    </ScrollView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  ratingButtonsRow: {
    marginTop: 16,
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
    ...StyleSheet.absoluteFillObject,
  },
});

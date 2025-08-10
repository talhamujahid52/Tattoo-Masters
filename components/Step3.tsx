import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import React, { useState, useContext, useMemo } from "react";
import Text from "@/components/Text";
import IconButton from "@/components/IconButton";
import ImageGallery from "@/components/ImageGallery";
import { useRouter } from "expo-router";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { FormContext } from "../context/FormContext";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { UserFirestore } from "@/types/user";
import { useSelector } from "react-redux";
import ReviewOnProfileBlur from "./ReviewOnProfileBlur";

interface StudioItem {
  title: string;
  selected: boolean;
}
const step3: React.FC = () => {
  const { formData } = useContext(FormContext)!;
  console.log("Form Data: ", formData);
  const tattooStyles = formData?.tattooStyles;
  const router = useRouter();

  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user
  );
  const loggedInUserFirestore: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore
  );
  const profileImage = useMemo(() => {
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
    latitude: formData.location?.latitude,
    longitude: formData.location?.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const renderItem = ({ item }: { item: StudioItem }) => (
    <View
      style={{
        padding: 6,
        borderRadius: 6,
        backgroundColor: "#262526",
      }}
    >
      <Text
        style={{
          color: "#A7A7A7",
        }}
      >
        {item.title}
      </Text>
    </View>
  );

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
      <View style={styles.pictureAndName}>
        <Image style={styles.profilePicture} source={profileImage} />
        <View>
          <Text size="h3" weight="semibold" color="white">
            {formData?.name}
          </Text>
          <Text size="p" weight="normal" color="#A7A7A7">
            {formData?.studio === "studio"
              ? formData?.studioName
              : formData?.studio === "freelancer"
              ? "Freelancer"
              : "HomeArtist"}
          </Text>
          <Text size="p" weight="normal" color="#A7A7A7">
            {formData?.city}
          </Text>
        </View>
      </View>
      <View style={styles.userSocialsRow}>
        {formData?.facebookProfile && (
          <Image
            style={styles.icon}
            source={require("../assets/images/facebook_2.png")}
          />
        )}
        {formData?.instagramProfile && (
          <Image
            style={styles.icon}
            source={require("../assets/images/instagram.png")}
          />
        )}
        {formData?.twitterProfile && (
          <Image
            style={styles.icon}
            source={require("../assets/images/twitter.png")}
          />
        )}
      </View>
      <View style={styles.artistFavoriteRow}>
        <Image
          style={styles.icon}
          source={require("../assets/images/favorite-white.png")}
        />
        <View
          style={{
            height: 11,
            width: 31,
            borderRadius: 6,
            backgroundColor: "#2D2D2D",
          }}
        ></View>
      </View>
      <Text size="p" weight="normal" color="#A7A7A7" style={{ marginTop: 16 }}>
        {formData?.aboutYou}
      </Text>
      <View style={styles.buttonRow}>
        <IconButton
          title="Favorite"
          icon={require("../assets/images/favorite-outline-white.png")}
          iconStyle={{
            height: 15,
            width: 17,
            resizeMode: "contain",
          }}
          variant="Primary"
          onPress={() => {
            router.push({
              pathname: "/artist/EditProfile",
            });
          }}
          disabled
        />
        <IconButton
          title="Message"
          icon={require("../assets/images/message.png")}
          variant="Primary"
          disabled
        />
      </View>
      <ReviewOnProfileBlur></ReviewOnProfileBlur>
      <View style={{ marginVertical: 24 }}>
        <Text size="profileName" weight="semibold" color="#FBF6FA">
          Location
        </Text>
        <Text
          size="medium"
          weight="normal"
          color="#A7A7A7"
          style={{ marginTop: 10 }}
        >
          {formData?.address}
        </Text>
        <View
          style={{
            height: 130,
            borderRadius: 20,
            overflow: "hidden",
            marginTop: 8,
          }}
        >
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            customMapStyle={googleDarkModeStyle}
            mapType="standard"
            region={region}
            scrollEnabled={false}
            zoomEnabled={false}
          ></MapView>
        </View>
      </View>
      <View>
        <Text size="profileName" weight="semibold" color="#FBF6FA">
          Portfolio
        </Text>
      </View>
      <View style={styles.stylesFilterRow}>
        <FlatList
          data={tattooStyles}
          renderItem={renderItem}
          keyExtractor={(item) => item.title}
          horizontal={true}
          contentContainerStyle={{ gap: 10 }}
        />
      </View>
      <ImageGallery imageUris={formData?.images}></ImageGallery>
    </ScrollView>
  );
};

export default step3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#FFFFFF56",
    borderRadius: 20,
  },
  userProfileRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pictureAndName: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    // backgroundColor:"green"
  },
  profilePicture: {
    height: 82,
    width: 82,
    resizeMode: "cover",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#202020",
  },
  icon: {
    height: 24,
    width: 24,
    resizeMode: "contain",
  },
  moreIconContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  userSocialsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 16,
  },
  artistFavoriteRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tattooStylesRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  buttonRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  stylesFilterRow: {
    marginVertical: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Makes the map take up the entire screen
  },
});

import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import React, { useState, useContext } from "react";
import Text from "@/components/Text";
import IconButton from "@/components/IconButton";
import ReviewOnProfile from "@/components/ReviewOnProfile";
import ImageGallery from "@/components/ImageGallery";
import { useRouter } from "expo-router";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { FormContext } from "../context/FormContext";

interface StudioItem {
  title: string;
  value: number;
  selected: boolean;
}
const step3: React.FC = () => {
  const { formData } = useContext(FormContext)!;

  const router = useRouter();
  const [tattooStyles, setTattooStyles] = useState([
    { title: "Tribal", value: 1, selected: false },
    { title: "Geometric", value: 2, selected: false },
    { title: "Black and White", value: 3, selected: false },
  ]);

  const toggleTattooStyles = (value: number) => {
    const updatedTattooStyles = tattooStyles.map((item) =>
      item.value === value ? { ...item, selected: !item.selected } : item
    );

    setTattooStyles(updatedTattooStyles);
  };

  const renderItem = ({ item }: { item: StudioItem }) => (
    <TouchableOpacity
      key={item.value}
      activeOpacity={1}
      style={{
        padding: 6,
        borderRadius: 6,
        backgroundColor: item.selected ? "#DAB769" : "#262526",
      }}
      onPress={() => toggleTattooStyles(item.value)} // Toggle selected state on press
    >
      <Text
        style={{
          color: item.selected ? "#22221F" : "#A7A7A7",
        }}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.pictureAndName}>
        <Image
          style={styles.profilePicture}
          source={require("../assets/images/Artist.png")}
        />
        <View>
          <Text size="h3" weight="semibold" color="white">
            {formData?.fullName}
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
        <TouchableOpacity>
          <Image
            style={styles.icon}
            source={require("../assets/images/facebook_2.png")}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            style={styles.icon}
            source={require("../assets/images/instagram.png")}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            style={styles.icon}
            source={require("../assets/images/twitter.png")}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.artistFavoriteRow}>
        <Image
          style={styles.icon}
          source={require("../assets/images/favorite-white.png")}
        />
        <Text size="p" weight="normal" color="#FBF6FA">
          412
        </Text>
      </View>
      <Text size="p" weight="normal" color="#A7A7A7" style={{ marginTop: 16 }}>
        {formData?.aboutYou}
        {/* Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. */}
      </Text>
      <View style={styles.buttonRow}>
        <IconButton
          title="Edit profile"
          icon={require("../assets/images/edit.png")}
          variant="Primary"
          onPress={() => {
            router.push({
              pathname: "/artist/EditProfile",
            });
          }}
        />
        <IconButton
          title="Add tattoo"
          icon={require("../assets/images/add_photo_alternate-2.png")}
          variant="Primary"
        />
      </View>
      <ReviewOnProfile></ReviewOnProfile>
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
          S#251, Street 24, Phuket, Thailand
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
            mapType="terrain"
          >
            {/* <Marker coordinate={region} title="Location" />  */}
          </MapView>
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
          keyExtractor={(item) => item.value.toString()}
          horizontal={true}
          contentContainerStyle={{ gap: 10 }}
        />
      </View>
      <ImageGallery></ImageGallery>
    </ScrollView>
  );
};

export default step3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
    borderTopWidth: 0.33,
    borderColor: "#FFFFFF56",
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
    resizeMode: "contain",
    borderRadius: 50,
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

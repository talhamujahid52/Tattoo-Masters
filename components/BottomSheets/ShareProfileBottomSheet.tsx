import {
  StyleSheet,
  View,
  TouchableOpacity,
  Switch,
  Image,
  Share,
} from "react-native";
import Slider from "@react-native-community/slider";
import Text from "../Text";
import React, { useState } from "react";
import Button from "../Button";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import dynamicLinks from "@react-native-firebase/dynamic-links";

interface bottomSheetProps {
  hide: () => void;
  myId: string;
}

const ShareProfileBottomSheet = ({ hide, myId }: bottomSheetProps) => {
  const router = useRouter();
  const shareArtistProfile = async (myId: any) => {
    try {
      // // This will use your "myapp" scheme
      // const baseUrl = Linking.createURL("artist/ArtistProfile");
      // const url = `${baseUrl}?artistId=${myId}`;
      // console.log("Generated URL:", url); // Important for testing!

      // const canOpen = await Linking.canOpenURL(url);
      // console.log("Can open URL:", canOpen);

      // // if (canOpen) {
      // //   await Linking.openURL(url);
      // //   console.log("✅ URL opened successfully!");
      // // } else {
      // //   // Alert.alert('Error', 'Cannot open this URL');
      // // }

      const fullLink = `https://tattoomasters.com/artist?artistId=${myId}`;
      const shortLink = await dynamicLinks().buildShortLink({
        link: fullLink,
        domainUriPrefix: "https://tattoomasters.page.link",
        android: {
          packageName: "com.ddjn.tattoomasters",
        },
        ios: {
          bundleId: "com.ddjn.tattoomasters",
        },
      });

      await Share.share({
        message:
          `Hey there! Check out my profile on the new Tattoo Masters app.\n\n` +
          `${shortLink}\n\n` +
          `It’s an all new app for all tattoo artists and tattoo enthusiasts.`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          hide();
          shareArtistProfile(myId);
        }}
        style={styles.drawerItem}
      >
        <Image
          style={styles.icon}
          source={require("../../assets/images/share.png")}
        />
        <Text size="h4" weight="normal" color="#FBF6FA">
          Share your profile
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          hide();
          router.push({
            pathname: "/artist/Feedback",
          });
        }}
        style={styles.drawerItem}
      >
        <Image
          style={styles.icon}
          source={require("../../assets/images/feedback.png")}
        />
        <Text size="h4" weight="normal" color="#FBF6FA">
          Feedback
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ShareProfileBottomSheet;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#080808",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  drawerItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  icon: {
    height: 24,
    width: 24,
    resizeMode: "contain",
  },
});

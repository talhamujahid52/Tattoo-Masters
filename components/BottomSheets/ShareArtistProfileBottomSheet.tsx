import React from "react";
import Text from "../Text";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import * as Linking from "expo-linking";
import dynamicLinks from "@react-native-firebase/dynamic-links";

interface bottomSheetProps {
  showLoginBottomSheet: () => void;
  hideShareSheet: () => void;
  showReportSheet: () => void;
  artistId: string;
}

const ShareArtistProfileBottomSheet = ({
  showLoginBottomSheet,
  hideShareSheet,
  showReportSheet,
  artistId,
}: bottomSheetProps) => {
  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user
  );

  const shareArtistProfile = async (artistId: string) => {
    try {
      const fullLink = `https://tattoomasters.com/artist?artistId=${artistId}`;

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
        message: `Check out this artist profile:\n${shortLink}`,
      });
    } catch (error) {
      console.error("Error sharing dynamic link:", error);
    }
  };

  console.log("LoggedIn USer, ", loggedInUser);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          shareArtistProfile(artistId);
        }}
        style={styles.drawerItem}
      >
        <Image
          style={styles.icon}
          source={require("../../assets/images/share_2.png")}
        />
        <Text size="h4" weight="normal" color="#FBF6FA">
          Share profile
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          if (loggedInUser) {
            hideShareSheet();
            router.push({ pathname: "/artist/Feedback" });
          } else {
            hideShareSheet();
            showLoginBottomSheet();
          }
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
      <TouchableOpacity
        onPress={() => {
          if (loggedInUser) {
            hideShareSheet();
            showReportSheet();
          } else {
            hideShareSheet();
            showLoginBottomSheet();
          }
        }}
        style={styles.drawerItem}
      >
        <Image
          style={styles.icon}
          source={require("../../assets/images/report-flag.png")}
        />
        <Text size="h4" weight="normal" color="#FBF6FA">
          Report user
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ShareArtistProfileBottomSheet;

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

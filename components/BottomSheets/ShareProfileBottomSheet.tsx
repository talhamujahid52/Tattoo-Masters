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

interface bottomSheetProps {
  hide: () => void;
  myId: string;
}

const ShareProfileBottomSheet = ({ hide, myId }: bottomSheetProps) => {
  const router = useRouter();
  const shareArtistProfile = async (myId: any) => {
    try {
      const link = `https://tattoomasters.app/artist/${myId}`;

      await Share.share({ message: link });
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

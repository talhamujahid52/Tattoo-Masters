import React from "react";
import Text from "../Text";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

interface bottomSheetProps {
  hideShareSheet: () => void;
  showReportSheet: () => void;
}

const ShareArtistProfileBottomSheet = ({
  hideShareSheet,
  showReportSheet,
}: bottomSheetProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => {}} style={styles.drawerItem}>
        <Image
          style={styles.icon}
          source={require("../../assets/images/share_2.png")}
        />
        <Text size="h4" weight="normal" color="#FBF6FA">
          Share Profile
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {}} style={styles.drawerItem}>
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
          hideShareSheet();
          showReportSheet();
        }}
        style={styles.drawerItem}
      >
        <Image
          style={styles.icon}
          source={require("../../assets/images/report-flag.png")}
        />
        <Text size="h4" weight="normal" color="#FBF6FA">
          Report User
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ShareArtistProfileBottomSheet;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
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

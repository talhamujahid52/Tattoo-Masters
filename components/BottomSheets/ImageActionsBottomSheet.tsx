import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import Text from "../Text";
import React from "react";
import { useRouter } from "expo-router";
import ReportBottomSheet from "./ReportBottomSheet";
import useBottomSheet from "@/hooks/useBottomSheet";

interface bottomSheetProps {
  hideImageActionsSheet: () => void;
  showReportSheet: () => void;
}

const ImageActionsBottomSheet = ({
  hideImageActionsSheet,
  showReportSheet,
}: bottomSheetProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          hideImageActionsSheet();
          showReportSheet();
        }}
        style={styles.drawerItem}
      >
        <Image
          style={styles.icon}
          source={require("../../assets/images/report-flag.png")}
        />
        <Text size="h4" weight="normal" color="#FBF6FA">
          Report
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
    </View>
  );
};

export default ImageActionsBottomSheet;

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

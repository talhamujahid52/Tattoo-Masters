import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import Text from "../Text";
import React from "react";
import { useRouter } from "expo-router";
import ReportBottomSheet from "./ReportBottomSheet";
import useBottomSheet from "@/hooks/useBottomSheet";

interface bottomSheetProps {
  hide1: () => void;
}

const ShareArtistProfileBottomSheet = ({ hide1 }: bottomSheetProps) => {
  const options = [
    { label: "Inappropriate account", value: "1" },
    { label: "Impersonation", value: "2" },
    { label: "Fake Account", value: "3" },
    { label: "Other", value: "4" },
  ];
  const { BottomSheet, show, hide } = useBottomSheet();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <BottomSheet
        InsideComponent={
          <ReportBottomSheet
            hide={hide}
            title="Report User"
            options={options}
          />
        }
      />
      <TouchableOpacity
        onPress={() => {
          hide();
          //   router.push({
          //     pathname: "/(auth)/ReviewPassword",
          //   });
        }}
        style={styles.drawerItem}
      >
        <Image
          style={styles.icon}
          source={require("../../assets/images/share_2.png")}
        />
        <Text size="h4" weight="normal" color="#FBF6FA">
          Share Profile
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          //   router.push({
          //     pathname: "/(auth)/ReviewPassword",
          //   });
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
          show();
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

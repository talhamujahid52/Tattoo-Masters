import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import Text from "../Text";
import React from "react";
import { useRouter } from "expo-router";
import ReportBottomSheet from "./ReportBottomSheet";
import useBottomSheet from "@/hooks/useBottomSheet";
import Input from "../Input";

interface bottomSheetProps {
  hide1: () => void;
}

const ShareReviewPasswordBottomSheet = ({ hide1 }: bottomSheetProps) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View
        style={{
          paddingBottom: 12,
          borderBottomColor: "#242424",
          borderBottomWidth: 1,
        }}
      >
        <Text
          size="h4"
          weight="medium"
          color="#FFF"
          style={{ textAlign: "center" }}
        >
          Review Password
        </Text>
      </View>
      <View style={{ paddingVertical: 16 }}>
        <Text
          color="#A7A7A7"
          style={{ textAlign: "center", paddingHorizontal: 30 }}
        >
          In order to get reviewed your clients must enter your review password.
        </Text>
        <Text color="#F2D189" style={{ textAlign: "center" }}>
          Share your review password with your clients.
        </Text>
      </View>
      <View>
        <Text size="h4" weight="semibold" color="#A7A7A7">
          Password
        </Text>
        <Input inputMode="text" placeholder="Review Password" />
      </View>
      <TouchableOpacity style={styles.drawerItem}>
        <Image
          style={styles.icon}
          source={require("../../assets/images/share_2.png")}
        />
        <Text size="h4" weight="normal" color="#FBF6FA">
          Share review Password
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/(auth)/ReviewPassword",
          });
        }}
        style={styles.drawerItem}
      >
        <Image
          style={styles.icon}
          source={require("../../assets/images/feedback.png")}
        />
        <Text size="h4" weight="normal" color="#FBF6FA">
          Change review Password
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ShareReviewPasswordBottomSheet;

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

import { StyleSheet, View, TouchableOpacity, Image, Share } from "react-native";
import Text from "../Text";
import React from "react";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { saveImageToLibrary } from "@/utils/saveImageToLibrary";

interface bottomSheetProps {
  hideImageActionsSheet: () => void;
  showReportSheet: () => void;
  showLoggingInBottomSheet: () => void;
  // When true, render owner actions instead of report/feedback
  isOwner?: boolean;
  onEditTattoo?: () => void;
  onDeleteTattoo?: () => void;
  publicationId?: string;
  // Full-resolution image URL, used by "Save image"
  imageUrl?: string;
}

const ImageActionsBottomSheet = ({
  hideImageActionsSheet,
  showReportSheet,
  showLoggingInBottomSheet,
  isOwner = false,
  onEditTattoo,
  onDeleteTattoo,
  publicationId,
  imageUrl,
}: bottomSheetProps) => {
  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user
  );

  const shareTattoo = async () => {
    if (!publicationId) return;
    try {
      const link = `https://www.tattoomasters.app/tattoo/${publicationId}`;
      const message = `Check out this cool tattoo on the new Tattoo Masters app.\n${link}\nIt's an all new app for all tattoo artists and tattoo enthusiasts.`;

      await Share.share({ message });
    } catch (error) {
      console.error("Error sharing tattoo:", error);
    }
  };

  const saveImageRow = imageUrl ? (
    <TouchableOpacity
      onPress={() => {
        hideImageActionsSheet();
        saveImageToLibrary(imageUrl);
      }}
      style={styles.drawerItem}
    >
      {/* Same 50% white as the PNG icons on the other rows */}
      <MaterialCommunityIcons
        name="tray-arrow-down"
        size={24}
        color="rgba(255, 255, 255, 0.5)"
      />
      <Text size={isOwner ? "p" : "h4"} weight="normal" color="#FBF6FA">
        Save image
      </Text>
    </TouchableOpacity>
  ) : null;

  return (
    <View style={styles.container}>
      {isOwner ? (
        <>
          <TouchableOpacity
            onPress={() => {
              hideImageActionsSheet();
              shareTattoo();
            }}
            style={styles.drawerItem}
          >
            <Image
              style={styles.icon}
              source={require("../../assets/images/share.png")}
            />
            <Text size="p" weight="normal" color="#FBF6FA">
              Share tattoo
            </Text>
          </TouchableOpacity>
          {saveImageRow}
          <TouchableOpacity
            onPress={() => {
              hideImageActionsSheet();
              onEditTattoo && onEditTattoo();
            }}
            style={styles.drawerItem}
          >
            <Image
              style={styles.icon}
              source={require("../../assets/images/editTattoo.png")}
            />
            <Text size="p" weight="normal" color="#FBF6FA">
              Edit tattoo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              hideImageActionsSheet();
              onDeleteTattoo && onDeleteTattoo();
            }}
            style={styles.drawerItem}
          >
            <Image
              style={styles.icon}
              source={require("../../assets/images/deleteTattoo.png")}
            />
            <Text size="p" weight="normal" color="#FBF6FA">
              Delete tattoo
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            onPress={() => {
              hideImageActionsSheet();
              shareTattoo();
            }}
            style={styles.drawerItem}
          >
            <Image
              style={styles.icon}
              source={require("../../assets/images/share.png")}
            />
            <Text size="h4" weight="normal" color="#FBF6FA">
              Share tattoo
            </Text>
          </TouchableOpacity>
          {saveImageRow}
          <TouchableOpacity
            onPress={() => {
              loggedInUser
                ? (hideImageActionsSheet(), showReportSheet())
                : (hideImageActionsSheet(), showLoggingInBottomSheet());
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
          <TouchableOpacity
            onPress={() => {
              loggedInUser
                ? (hideImageActionsSheet(), router.push("/artist/Feedback"))
                : (hideImageActionsSheet(), showLoggingInBottomSheet());
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
        </>
      )}
    </View>
  );
};

export default ImageActionsBottomSheet;

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

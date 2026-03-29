import { StyleSheet, View, TouchableOpacity, Image, Share } from "react-native";
import Text from "../Text";
import React from "react";
import { router, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

interface bottomSheetProps {
  hideImageActionsSheet: () => void;
  showReportSheet: () => void;
  showLoggingInBottomSheet: () => void;
  // When true, render owner actions instead of report/feedback
  isOwner?: boolean;
  onEditTattoo?: () => void;
  onDeleteTattoo?: () => void;
  publicationId?: string;
}

const ImageActionsBottomSheet = ({
  hideImageActionsSheet,
  showReportSheet,
  showLoggingInBottomSheet,
  isOwner = false,
  onEditTattoo,
  onDeleteTattoo,
  publicationId,
}: bottomSheetProps) => {
  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user
  );
  const currentUserId = loggedInUser?.uid;

  const shareTattoo = async () => {
    if (!publicationId) return;
    try {
      const link = `https://tattoomasters.app/tattoo/${publicationId}`;
      const message = `Check out this cool tattoo on the new Tattoo Masters app.\n${link}\nIt's an all new app for all tattoo artists and tattoo enthusiasts.`;

      await Share.share({ message });
    } catch (error) {
      console.error("Error sharing tattoo:", error);
    }
  };

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

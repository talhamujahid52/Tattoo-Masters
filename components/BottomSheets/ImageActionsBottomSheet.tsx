import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
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
}

const ImageActionsBottomSheet = ({
  hideImageActionsSheet,
  showReportSheet,
  showLoggingInBottomSheet,
  isOwner = false,
  onEditTattoo,
  onDeleteTattoo,
}: bottomSheetProps) => {
  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user
  );
  const currentUserId = loggedInUser?.uid;
  return (
    <View style={styles.container}>
      {isOwner ? (
        <>
          <TouchableOpacity
            onPress={() => {
              hideImageActionsSheet();
              onEditTattoo && onEditTattoo();
            }}
            style={styles.drawerItem}
          >
            <Image
              style={styles.icon}
              source={require("../../assets/images/edit.png")}
            />
            <Text size="h4" weight="normal" color="#FBF6FA">
              Edit Tattoo
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
              source={require("../../assets/images/close.png")}
            />
            <Text size="h4" weight="normal" color="#FBF6FA">
              Delete Tattoo
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

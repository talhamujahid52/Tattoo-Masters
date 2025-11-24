import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Platform,
  ToastAndroid,
  Alert,
  Share,
} from "react-native";
import Text from "../Text";
import React from "react";
import { useRouter } from "expo-router";
import Input from "../Input";
import Clipboard from "@react-native-clipboard/clipboard";
import { useSelector } from "react-redux";
import dynamicLinks from "@react-native-firebase/dynamic-links";

interface bottomSheetProps {
  hideShareReviewPasswordBottomSheet: () => void;
}

const ShareReviewPasswordBottomSheet = ({
  hideShareReviewPasswordBottomSheet,
}: bottomSheetProps) => {
  const loggedInUserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore
  );
  const router = useRouter();

  const handleCopyToClipboard = () => {
    Clipboard.setString(loggedInUserFirestore?.reviewPassword);
    if (Platform.OS === "android") {
      ToastAndroid.show("Password copied to clipboard!", ToastAndroid.SHORT);
    } else {
      Alert.alert("Copied", "Password copied to clipboard.");
    }
  };

  const onShare = async () => {
    try {
      const fullLink = `https://tattoomasters.com/artist?artistId=${loggedInUserFirestore?.uid}`;
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

      const result = await Share.share({
        message:
          `Hey! Here’s my review password for the new Tattoo Masters app.\n\n` +
          `Password: ${loggedInUserFirestore?.reviewPassword}\n\n` +
          `${shortLink}\n\n` +
          `I would appreciate a great review to help me grow my profile.`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Avtivity Type : ", result.activityType);
        } else {
          console.log("Shared : ");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share Sheet Dismissed : ");
      }
    } catch (error) {
      console.log("Error opening Share Sheet : ", error);
    }
  };

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
          Review password
        </Text>
      </View>

      <View style={{ paddingVertical: 16 }}>
        <Text
          color="#A7A7A7"
          style={{ textAlign: "center", paddingHorizontal: 50 }}
        >
          In order to get reviewed your clients must enter your review password.
        </Text>
        <Text color="#F2D189" style={{ textAlign: "center" }}>
          Share your review password with your clients.
        </Text>
      </View>

      <View>
        <Text
          size="h4"
          weight="semibold"
          color="#A7A7A7"
          style={{ marginBottom: 10 }}
        >
          Password
        </Text>
        <Input
          value={loggedInUserFirestore?.reviewPassword}
          inputMode="text"
          placeholder="Review Password"
          rightIcon={"content-copy"}
          editable={false}
          rightIconOnPress={handleCopyToClipboard}
        />
      </View>

      <View
        style={{ height: 1, backgroundColor: "#2D2D2D", marginVertical: 16 }}
      ></View>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => {
          onShare();
        }}
      >
        <Image
          style={styles.icon}
          source={require("../../assets/images/share.png")}
        />
        <Text size="h4" weight="normal" color="#FBF6FA">
          Share review password
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          hideShareReviewPasswordBottomSheet();
          router.push({
            pathname: "/(auth)/ReviewPassword",
          });
        }}
        style={styles.drawerItem}
      >
        <Image
          style={styles.icon}
          source={require("../../assets/images/changeReviewPassword.png")}
        />
        <Text size="h4" weight="normal" color="#FBF6FA">
          Change review password
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ShareReviewPasswordBottomSheet;

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

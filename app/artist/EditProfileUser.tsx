import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import Text from "@/components/Text";
import Input from "@/components/Input";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setUserFirestoreData } from "@/redux/slices/userSlice";
import { changeProfilePicture } from "@/utils/firebase/changeProfilePicture";
import { useSelector, useDispatch } from "react-redux";
import Button from "@/components/Button";
import { Asset, launchImageLibrary } from "react-native-image-picker";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { UserFirestore } from "@/types/user";
import { getUpdatedUser } from "@/utils/firebase/userFunctions";
import firestore from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";

const EditProfile = () => {
  // Get auth and firestore user data from redux
  const router = useRouter();
  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user
  );
  const loggedInUserFirestore: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore
  );
  const currentUserId = loggedInUser?.uid;
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  // Local state for loading, selected new image, full name, and phone number.
  const [loading, setLoading] = useState(false);
  const [newImage, setNewImage] = useState<Asset>();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // When Firestore user data changes, update the input states.
  useEffect(() => {
    if (loggedInUserFirestore) {
      setFullName(loggedInUserFirestore.name || "");
      // If phoneNumber doesn't exist, leave it empty.
      setPhoneNumber(loggedInUserFirestore.phoneNumber || "");
    }
  }, [loggedInUserFirestore]);

  // On mount, fetch updated user data from Firestore.
  useEffect(() => {
    if (currentUserId) {
      getUpdatedUser(currentUserId).then((updatedUser) => {
        dispatch(setUserFirestoreData(updatedUser));
      });
    }
  }, [currentUserId]);

  // Open the image picker to allow the user to choose a new photo.
  const openImagePicker = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 1,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.errorCode) {
          console.error("ImagePicker Error: ", response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          if (asset.uri) {
            setNewImage(asset);
          }
        }
      }
    );
  };

  const handleProfilePictureChange = async (newImageUri: string) => {
    const TIMEOUT_MS = 120000; // 2 minutes

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Profile picture update timed out!")),
        TIMEOUT_MS
      )
    );

    try {
      const fileName = "profile.jpeg";

      // Race between changeProfilePicture and the timeout
      const profilePictureUrls = await Promise.race([
        changeProfilePicture(currentUserId, newImageUri, fileName),
        timeoutPromise,
      ]);

      console.log("New resized profile picture URLs:", profilePictureUrls);
    } catch (error) {
      console.error("Failed to update profile picture:", error);
    }
  };

  // Determine which image to show.
  // Use the newly selected image if available, otherwise use Firestore profile picture,
  // and as a last resort, fallback to Google photo URL.
  const localImage = useMemo(() => {
    const remoteUri =
      newImage?.uri ??
      loggedInUserFirestore?.profilePictureSmall ??
      loggedInUserFirestore?.profilePicture ??
      loggedInUser?.photoURL;

    if (remoteUri) {
      return { uri: remoteUri };
    }

    // Fallback to local placeholder image if no image URI is found
    return require("../../assets/images/placeholder.png");
  }, [newImage, loggedInUser, loggedInUserFirestore]);

  // Update profile in Firestore with the new full name, phone number, and profile picture (if changed).
  const updateProfile = async () => {
    try {
      setLoading(true);
      // Update profile picture if a new image was selected.
      //
      // Update full name and phone number.
      await firestore().collection("Users").doc(currentUserId).set(
        {
          name: fullName,
          phoneNumber: phoneNumber,
        },
        { merge: true }
      );
      if (newImage?.uri) {
        await handleProfilePictureChange(newImage.uri);
      }
      // Fetch the updated user data and update Redux.
      const updatedUser = await getUpdatedUser(currentUserId);
      dispatch(setUserFirestoreData(updatedUser));
      router.back();
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        justifyContent: "space-between",
        paddingBottom: insets.bottom,
        flex: 1,
      }}
      style={styles.container}
    >
      <View>
        <View style={styles.profilePictureRow}>
          <Image style={styles.profilePicture} source={localImage} />
          <TouchableOpacity
            hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
            onPress={openImagePicker}
          >
            <Text size="h4" weight="semibold" color="#DAB769">
              Change photo
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text
            size="h4"
            weight="semibold"
            color="#A7A7A7"
            style={{ marginBottom: 10 }}
          >
            Full name
          </Text>
          <Input
            inputMode="text"
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text
            size="h4"
            weight="semibold"
            color="#A7A7A7"
            style={{ marginBottom: 10 }}
          >
            Phone number
          </Text>
          <Input
            inputMode="tel"
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>
      </View>
      <Button onPress={updateProfile} loading={loading} title="Save" />
    </ScrollView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
    borderTopWidth: 0.33,
    borderColor: "#2D2D2D",
  },
  profilePictureRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  profilePicture: {
    borderRadius: 60,
    width: 114,
    height: 114,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#202020",
  },
  ratingButtonsRow: {
    marginTop: 16,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  textArea: {
    height: 100,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#FFFFFF1A",
    color: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

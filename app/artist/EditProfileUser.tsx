import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  // Switch,
  // TextInput,
  Dimensions,
  ScrollView,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import Text from "@/components/Text";
import Input from "@/components/Input";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { setUserFirestoreData } from "@/redux/slices/userSlice";
// import ConnectSocialMediaButton from "@/components/ConnectSocialMediaButton";
// import Button from "@/components/Button";
import { changeProfilePicture } from "@/utils/firebase/changeProfilePicture";
import { useSelector } from "react-redux";
import Button from "@/components/Button";
import { Asset, launchImageLibrary } from "react-native-image-picker";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { UserFirestore } from "@/types/user";
import { getUpdatedUser } from "@/utils/firebase/userFunctions";
import { useDispatch } from "react-redux";

const EditProfile = () => {
  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user,
  );

  const loggedInUserFirestore: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore,
  );
  const currentUserId = loggedInUser?.uid;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [newImage, setNewImage] = useState<Asset>();
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUserId) {
      getUpdatedUser(currentUserId).then((updatedUser) => {
        dispatch(setUserFirestoreData(updatedUser));
      });
    }
  }, [currentUserId]);
  // Opens the image picker to allow the user to choose a photo.
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
            // Call the function to change the profile picture with the selected image URI.
            setNewImage(asset);
            // handleProfilePictureChange(asset.uri);
          }
        }
      },
    );
  };

  const handleProfilePictureChange = async (newImageUri: string) => {
    try {
      // Optionally, generate or extract a proper file name.
      const fileName = "profile.jpeg";
      const profilePictureUrls = await changeProfilePicture(
        currentUserId,
        newImageUri,
        fileName,
      );
      console.log("New resized profile picture URLs:", profilePictureUrls);
    } catch (error) {
      console.error("Failed to update profile picture:", error);
      // Handle errors as needed.
    }
  };
  const localImage = useMemo(() => {
    if (!newImage) {
      return {
        uri:
          loggedInUserFirestore.profilePictureSmall ?? //get from firestore
          loggedInUser.photoURL ?? //get from google if firestore not found
          undefined, //show nothing if both not found
      };
    }
    return { uri: newImage.uri ?? undefined };
  }, [newImage, loggedInUser, loggedInUserFirestore]);

  const updateProfile = async () => {
    try {
      setLoading(true);
      if (newImage?.uri) {
        await handleProfilePictureChange(newImage.uri);
      } else {
        console.log("nothing to update yet...");
      }
    } catch {
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
          <Image
            style={styles.profilePicture}
            source={
              localImage ?? require("../../assets/images/profilePicture.png")
            }
          />
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
            Full Name
          </Text>
          <Input inputMode="text" placeholder="Full Name"></Input>
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text
            size="h4"
            weight="semibold"
            color="#A7A7A7"
            style={{ marginBottom: 10 }}
          >
            Phone Number
          </Text>
          <Input inputMode="tel" placeholder="Phone Number"></Input>
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
    borderColor: "#FFFFFF56",
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
    // marginBottom: 100,
  },
});

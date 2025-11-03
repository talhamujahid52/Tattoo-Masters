import React, { useContext, useMemo } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Share } from "react-native";
import Text from "../Text";
import Button from "../Button";
import { router, useNavigation } from "expo-router";
import { FormContext } from "@/context/FormContext";
import { useSelector } from "react-redux";
import { UserFirestore } from "@/types/user";
import { DrawerActions } from "@react-navigation/native";

type Props = {
  onClose?: () => void;
};

const ShareReviewPasswordModal: React.FC<Props> = ({ onClose }) => {
  const navigation = useNavigation();
  const { formData, setFormData } = useContext(FormContext)!;
  const loggedInUser = useSelector((state: any) => state?.user?.user);
  const loggedInUserFirestore: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore
  );
  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `Here's my review password: ${formData?.reviewPassword}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Activity Type:", result.activityType);
        } else {
          console.log("Shared successfully.");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share Sheet dismissed.");
      }
    } catch (error) {
      console.log("Error opening Share Sheet:", error);
    }
  };

  const profileImage = useMemo(() => {
    return {
      uri:
        formData?.profilePicture ??
        loggedInUserFirestore?.profilePictureSmall ??
        loggedInUserFirestore?.profilePicture ??
        loggedInUser?.photoURL ??
        undefined,
    };
  }, [loggedInUser, loggedInUserFirestore, formData]);

  return (
    <View style={styles.modalContent}>
      <Image
        style={{ width: 20, height: 20, marginBottom: 8 }}
        source={require("../../assets/images/check.png")}
      ></Image>
      <Text size="p" weight="semibold" color="#FBF6FA">
        Profile created successfully!
      </Text>
      <View
        style={{
          width: 115,
          height: 109,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          marginVertical: 16,
        }}
      >
        <Image
          style={{
            height: 115,
            width: 109,
            resizeMode: "contain",
          }}
          source={require("../../assets/images/shareReviewPassword.png")}
        />
        <Image
          style={[
            styles.headerImage,
            {
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: [{ translateX: -34 }, { translateY: -34 }],
            },
          ]}
          source={profileImage}
        />
      </View>
      <Text
        size="profileName"
        weight="semibold"
        color="#FBF6FA"
        style={{ marginBottom: 8, textAlign: "center" }}
      >
        Let's{" "}
        <Text size="profileName" weight="semibold" color="#CEAC61">
          boost your profile{" "}
        </Text>
        even more!
      </Text>
      <Text
        size="p"
        weight="normal"
        color="#A7A7A7"
        style={{ marginBottom: 16, textAlign: "center" }}
      >
        Share your new review password {"\n"} to your old clients and ask them{" "}
        {"\n"}to grow your profile with great reviews.
      </Text>
      <Button
        title="Share review password"
        onPress={() => {
          onShare();
        }}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          router.dismissAll();
          navigation.dispatch(DrawerActions.toggleDrawer());
          // router.push({
          //   pathname: "/(bottomTabs)/Home",
          // });
        }}
      >
        <Text size="h4" weight="normal" color="#FBF6FA">
          Skip
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ShareReviewPasswordModal;

const styles = StyleSheet.create({
  modalContent: {
    width: "85%",
    backgroundColor: "#16140B",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  button: {
    height: 48,
    width: "100%",
    borderRadius: 30,
    backgroundColor: "#20201E",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  headerImage: {
    height: 68,
    width: 68,
    resizeMode: "cover",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
});

import React, { useContext } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Share } from "react-native";
import Text from "../Text";
import Button from "../Button";
import { router } from "expo-router";
import { FormContext } from "@/context/FormContext";
import dynamicLinks from "@react-native-firebase/dynamic-links";
import { UserFirestore } from "@/types/user";
import { useSelector } from "react-redux";
type Props = {
  onClose?: () => void;
};

const ShareProfileIntroModal: React.FC<Props> = ({ onClose }) => {
  const { formData, setFormData } = useContext(FormContext)!;
  const loggedInUserFirestore: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore
  );

  const myProfileId = loggedInUserFirestore?.uid;
  const shareProfile = async () => {
    try {
      const fullLink = `https://tattoomasters.com/artist?artistId=${myProfileId}`;

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

      await Share.share({
        message: `Check out this artist profile:\n${shortLink}`,
      });
    } catch (error) {
      console.error("Error sharing dynamic link:", error);
    }
  };

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
          width: 150,
          height: 110,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Image
          style={{
            height: 150,
            width: 110,
            resizeMode: "contain",
          }}
          source={require("../../assets/images/shareProfileModal.png")}
        />
        <Image
          style={[
            styles.headerImage,
            {
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: [{ translateX: -30 }, { translateY: -23 }],
            },
          ]}
          source={{ uri: formData?.profilePicture }}
        />
      </View>
      {/* <Image
        style={{ width: 120, height: 95, marginVertical: 12 }}
        source={require("../../assets/images/shareProfileModal.png")}
      ></Image> */}
      <Text
        size="profileName"
        weight="semibold"
        color="#FBF6FA"
        style={{ marginBottom: 8 }}
      >
        <Text size="profileName" weight="semibold" color="#CEAC61">
          Share{" "}
        </Text>
        your new profile!
      </Text>
      <Text
        size="p"
        weight="normal"
        color="#A7A7A7"
        style={{ marginBottom: 16 }}
      >
        Great! Now you can share your new profile on social media and have your
        old clients, friends and followers find you here as well.
      </Text>
      <Button
        title="Share Profile"
        onPress={() => {
          shareProfile();
        }}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          router.push({
            pathname: "/artist/ShareReviewPassword",
          });
        }}
      >
        <Text size="h4" weight="normal" color="#FBF6FA">
          Skip
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ShareProfileIntroModal;

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
    height: 60,
    width: 60,
    resizeMode: "cover",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
});

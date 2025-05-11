import React from "react";
import { View, Pressable, StyleSheet, Image } from "react-native";
import Text from "../Text";
import Button from "../Button";
type Props = {
  onClose: () => void;
};

const ShareReviewPasswordModal: React.FC<Props> = ({ onClose }) => {
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
          source={require("../../assets/images/profilePicture.png")}
        />
      </View>
      <Text
        size="profileName"
        weight="semibold"
        color="#FBF6FA"
        style={{ marginBottom: 8 }}
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
        title="Share Review Password"
        onPress={() => {
          onClose();
        }}
      />
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
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  headerImage: {
    height: 68,
    width: 68,
    resizeMode: "contain",
    borderRadius: 50,
  },
});

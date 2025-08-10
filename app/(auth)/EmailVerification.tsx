import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Linking,
} from "react-native";
import React from "react";
import OtpInput from "@/components/OtpInput";
import Text from "@/components/Text";
import { router } from "expo-router";
import { openInbox } from "react-native-email-link";

const EmailVerification = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require("../../assets/images/mail.png")}
      />
      <Text size="h3" weight="medium" color="#FBF6FA" style={styles.title}>
        Verify your email address
      </Text>
      <Text size="p" weight="normal" color="#A7A7A7" style={styles.description}>
        We have sent a verification link to your email. Please verify your email
        to continue.
      </Text>
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/Login");
        }}
        style={styles.verifyEmailButton}
      >
        <Text size="h4" weight="semibold" color="#FBF6FA">
          Login
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmailVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 24,
  },
  image: { height: 27, width: 34, resizeMode: "contain" },
  title: {
    marginBottom: 10,
    marginTop: 24,
  },
  description: {
    marginHorizontal: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  verifyEmailButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FBF6FA",
    borderRadius: 30,
    height: 48,
    width: "100%",
  },
});

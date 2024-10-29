import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import OtpInput from "@/components/OtpInput";
import Text from "@/components/Text";
import { router } from "expo-router";

const Verification = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require("../../assets/images/chat.png")}
      />
      <Text size="h3" weight="medium" color="#FBF6FA" style={styles.title}>
        Enter Verification Code
      </Text>
      <Text size="p" weight="normal" color="#A7A7A7" style={styles.description}>
        We have sent a 5 digit verification code to your phone number.
      </Text>

      <View style={styles.phoneNumberContainer}>
        <Text size="p" weight="normal" color="#FBF6FA">
          +92 349 5099 049
        </Text>
        <TouchableOpacity>
          <Text size="h4" weight="semibold" color="#DAB769">
            {" "}
            Change
          </Text>
        </TouchableOpacity>
      </View>

      <OtpInput />

      <View style={styles.resendContainer}>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/(auth)/SetPassword",
            });
          }}
        >
          <Text size="p" weight="normal" color="#FBF6FA">
            Resend
          </Text>
        </TouchableOpacity>
        <Text size="p" weight="normal" color="#A7A7A7">
          {" "}
          in 24 seconds
        </Text>
      </View>
    </View>
  );
};

export default Verification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 24,
  },
  image: { height: 34, width: 34, resizeMode: "contain" },
  title: {
    marginBottom: 10,
    marginTop: 24,
  },
  description: {
    marginHorizontal: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  phoneNumberContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  resendContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
});

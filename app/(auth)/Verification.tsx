import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import OtpInput from "@/components/OtpInput";
import { router } from "expo-router";

const Verification = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        padding: 24,
      }}
    >
      <Image
        style={styles.image}
        source={require("../../assets/images/chat.png")}
      />
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text
        style={[
          styles.description,
          { marginHorizontal: 24, textAlign: "center", marginBottom: 16 },
        ]}
      >
        We have sent a 5 digit verification code to your phone number.
      </Text>

      <View style={{ display: "flex", flexDirection: "row", marginBottom: 24 }}>
        <Text style={styles.phoneNumberStyle}>+92 349 5099 049</Text>
        <TouchableOpacity>
          <Text style={styles.changeButtonStyle}> Change</Text>
        </TouchableOpacity>
      </View>

      <OtpInput />

      <View style={{ display: "flex", flexDirection: "row", marginTop: 24 }}>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/(auth)/SetPassword",
            });
          }}
        >
          <Text style={styles.phoneNumberStyle}>Resend</Text>
        </TouchableOpacity>
        <Text style={styles.description}> in 24 seconds</Text>
      </View>
    </View>
  );
};

export default Verification;

const styles = StyleSheet.create({
  image: { height: 34, width: 34, resizeMode: "contain" },
  title: {
    fontWeight: "500",
    fontSize: 24,
    lineHeight: 28.64,
    color: "#FBF6FA",
    marginBottom: 10,
    marginTop: 24,
  },
  description: {
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 20.8,
    color: "#A7A7A7",
  },
  phoneNumberStyle: {
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 20.8,
    color: "#FBF6FA",
  },
  changeButtonStyle: {
    fontWeight: "600",
    fontSize: 17,
    lineHeight: 22.1,
    color: "#DAB769",
  },
  resendButtonStyle: {
    fontWeight: "400",
    fontSize: 17,
    lineHeight: 22.1,
    color: "#FBF6FA",
  },
});

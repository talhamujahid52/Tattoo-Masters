import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";

const SetPassword = () => {
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
        source={require("../../assets/images/lock.png")}
      />
      <Text style={styles.title}>Choose new Password</Text>
      <Text style={[styles.description, { textAlign: "center" }]}>
        Please enter a new password for your account.
      </Text>
      <Text
        style={[
          styles.description,
          { textAlign: "center", marginBottom: 24, marginHorizontal: 10 },
        ]}
      >
        This password is for your personal account and{" "}
        <Text style={{ color: "#F2D189" }}>not to be shared.</Text>
      </Text>
      <View style={{ rowGap: 16, marginBottom: 24 }}>
        <Input inputMode="password" placeholder="Choose new Password"></Input>
        <Input inputMode="password" placeholder="Confirm Password"></Input>
      </View>
      <Button title="Confirm"></Button>
    </View>
  );
};

export default SetPassword;

const styles = StyleSheet.create({
  image: { height: 29, width: 38, resizeMode: "contain" },
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
});

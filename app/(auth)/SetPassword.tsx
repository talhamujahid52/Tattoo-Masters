import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import Input from "@/components/Input";
import Text from "@/components/Text";
import Button from "@/components/Button";

const SetPassword = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require("../../assets/images/lock.png")}
      />
      <Text size="h3" weight="medium" color="#FBF6FA" style={styles.title}>
        Choose new Password
      </Text>
      <Text
        size="p"
        weight="normal"
        color="#A7A7A7"
        style={styles.description1}
      >
        Please enter a new password for your account.
      </Text>
      <Text
        size="p"
        weight="normal"
        color="#A7A7A7"
        style={styles.description2}
      >
        This password is for your personal account and{" "}
        <Text color="#F2D189">not to be shared.</Text>
      </Text>
      <View style={styles.passwordFieldsContainer}>
        <Input inputMode="password" placeholder="Choose new Password"></Input>
        <Input inputMode="password" placeholder="Confirm Password"></Input>
      </View>
      <Button title="Confirm"></Button>
    </View>
  );
};

export default SetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 24,
  },
  image: { height: 29, width: 38, resizeMode: "contain" },
  title: {
    marginBottom: 10,
    marginTop: 24,
  },
  description1: {
    textAlign: "center",
  },
  description2: {
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  passwordFieldsContainer: {
    rowGap: 16,
    marginBottom: 24,
  },
});

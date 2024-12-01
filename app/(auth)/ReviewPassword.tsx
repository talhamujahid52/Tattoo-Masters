import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import Input from "@/components/Input";
import Text from "@/components/Text";
import Button from "@/components/Button";

const ReviewPassword = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require("../../assets/images/lock_person-2.png")}
      />
      <Text size="h3" weight="medium" color="#FBF6FA" style={styles.title}>
        Choose new review Password
      </Text>
      <Text size="p" weight="normal" color="#A7A7A7" style={styles.description}>
        Please enter a new review password.
      </Text>
      <Text size="p" weight="normal" color="#F2D189" style={styles.description}>
        This password will be used by your customers.
      </Text>
      <Text
        size="p"
        weight="normal"
        color="#A7A7A7"
        style={styles.description1}
      >
        Please do not use any personal password for this purpose.
      </Text>
      <View style={styles.passwordFieldsContainer}>
        <Input
          inputMode="password"
          placeholder="Choose new review password"
        ></Input>
        <Input
          inputMode="password"
          placeholder="Confirm review Password"
        ></Input>
      </View>
      <Button title="Confirm"></Button>
    </View>
  );
};

export default ReviewPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 24,
  },
  image: { height: 35, width: 40, resizeMode: "contain" },
  title: {
    marginBottom: 10,
    marginTop: 24,
  },
  description: {
    textAlign: "center",
  },
  description1: {
    textAlign: "center",
    paddingHorizontal: 20,
  },
  passwordFieldsContainer: {
    rowGap: 16,
    marginVertical: 24,
  },
});

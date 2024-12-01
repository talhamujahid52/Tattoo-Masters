import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import Input from "@/components/Input";
import Text from "@/components/Text";
import Button from "@/components/Button";

const DeleteAccount = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require("../../assets/images/sentiment_sad.png")}
      />
      <Text size="h3" weight="medium" color="#FBF6FA" style={styles.title}>
        Are you sure you want to delete your account?
      </Text>
      <Text size="p" weight="normal" color="#A7A7A7" style={styles.description}>
        Sad to see you go.
      </Text>
      <Text size="p" weight="normal" color="#A7A7A7" style={styles.description}>
        Please enter your password to delete account.
      </Text>
      <Text size="p" weight="normal" color="#A7A7A7">
        We prefer you wouldn’t.
      </Text>
      <View style={styles.passwordFieldsContainer}>
        <Input inputMode="password" placeholder="Enter Password"></Input>
        <Input inputMode="password" placeholder="Confirm Password"></Input>
      </View>
      <Text size="small" weight="normal" color="#F2D189" style={styles.warning}>
        You won’t be able to recover your account once deleted.
      </Text>
      <TouchableOpacity
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 30,
          borderWidth: 1,
          borderColor: "#FBF6FA",
          height: 48,
          width: "100%",
        }}
      >
        <Text size="h4" weight="semibold" color="#E01D1D">
          I wanna miss out
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DeleteAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 16,
  },
  image: { height: 44, width: 44, resizeMode: "contain", marginBottom: 16 },
  title: {
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  description: {
    textAlign: "center",
  },
  warning: {
    textAlign: "center",
    marginBottom: 24,
  },
  passwordFieldsContainer: {
    rowGap: 16,
    marginVertical: 24,
  },
});

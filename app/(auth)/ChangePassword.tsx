import { StyleSheet, TouchableOpacity, View, Image, Alert } from "react-native";
import React, { useState } from "react";
import Input from "@/components/Input";
import Text from "@/components/Text";
import Button from "@/components/Button";
import auth from "@react-native-firebase/auth";
import { router } from "expo-router";

const ChangePassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      // Send password reset email
      await auth().sendPasswordResetEmail(email);
      Alert.alert(
        "Success",
        "A password reset link has been sent to your email address.",
        [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      // Handle errors here
      if (error.code === "auth/user-not-found") {
        Alert.alert("Error", "No user found with that email address.");
      } else {
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
      setEmail("");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require("../../assets/images/lock.png")}
      />
      <Text size="h3" weight="medium" color="#FBF6FA" style={styles.title}>
        Reset Password
      </Text>
      {/* <Text
        size="p"
        weight="normal"
        color="#A7A7A7"
        style={styles.description1}
      >
        Please enter your email.
      </Text> */}
      <Text
        size="p"
        weight="normal"
        color="#A7A7A7"
        style={styles.description2}
      >
        A password reset link will be sent to your email address if it exists.
        {/* <Text color="#F2D189">not to be shared.</Text> */}
      </Text>
      <View style={styles.passwordFieldsContainer}>
        <Input
          value={email}
          onChangeText={(text) => setEmail(text)}
          inputMode="email"
          placeholder="Email"
        ></Input>
        {/* <Input inputMode="password" placeholder="Confirm Password"></Input> */}
      </View>
      <Button title="Confirm" onPress={handlePasswordReset}></Button>
    </View>
  );
};

export default ChangePassword;

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

import { StyleSheet, View, Image, Alert } from "react-native";
import React, { useState } from "react";
import Input from "@/components/Input";
import Text from "@/components/Text";
import Button from "@/components/Button";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";

const ChangePassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user
  );

  const loggedInUserEmail = loggedInUser?.email;
  const isLoggedIn = !!loggedInUserEmail;

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    // Check if user is logged in and entered a different email
    if (isLoggedIn && email.toLowerCase() !== loggedInUserEmail?.toLowerCase()) {
      Alert.alert("Error", "Entered email does not match the logged-in user's email.");
      return;
    }

    setLoading(true);

    try {
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
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <Image
        style={styles.image}
        source={require("../../assets/images/lock.png")}
      />
      <Text size="h3" weight="medium" color="#FBF6FA" style={styles.title}>
        Reset Password
      </Text>
      <Text
        size="p"
        weight="normal"
        color="#A7A7A7"
        style={styles.description2}
      >
        A password reset link will be sent to your email address if it exists.
      </Text>
      <View style={styles.passwordFieldsContainer}>
        <Input
          value={email}
          onChangeText={(text) => setEmail(text)}
          inputMode="email"
          placeholder="Email"
        />
      </View>
      <Button
        title={"Confirm"}
        onPress={handlePasswordReset}
        disabled={loading}
      />
    </KeyboardAwareScrollView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 24,
  },
  image: {
    height: 35,
    width: 40,
    resizeMode: "contain",
  },
  title: {
    marginBottom: 10,
    marginTop: 24,
  },
  description2: {
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  passwordFieldsContainer: {
    width: "100%",
    rowGap: 16,
    marginBottom: 24,
  },
});

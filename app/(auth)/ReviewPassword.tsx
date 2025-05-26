import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert, // Added Alert for showing messages
} from "react-native";
import React, { useState } from "react";
import Input from "@/components/Input";
import Text from "@/components/Text";
import Button from "@/components/Button";
import { firebase } from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";

const ReviewPassword = () => {
  const [newReviewPassword, setNewReviewPassword] = useState("");
  const [confirmNewReviewPassword, setConfirmNewReviewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleConfirm = async () => {
    console.log("newReviewPassword: ", newReviewPassword);
    console.log("confirmNewReviewPassword: ", confirmNewReviewPassword);

    setIsLoading(true);

    // Check if passwords are not empty and meet the length requirement
    if (!newReviewPassword || !confirmNewReviewPassword) {
      Alert.alert("Error", "Password cannot be empty.");
      setIsLoading(false);
      return;
    }

    if (newReviewPassword !== confirmNewReviewPassword) {
      // Alert the user if passwords don't match
      Alert.alert("Error", "Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (newReviewPassword.length < 8 || confirmNewReviewPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const currentUserId = firebase?.auth()?.currentUser?.uid; // Or get user ID from your app's state

      if (!currentUserId) {
        Alert.alert("Error", "User not authenticated.");
        setIsLoading(false);
        return;
      }

      await firebase.firestore().collection("Users").doc(currentUserId).update({
        reviewPassword: newReviewPassword,
      });

      Alert.alert("Success", "Review password has been successfully updated.", [
        {
          text: "OK",
          onPress: () => router.back(), // Navigate back when OK is clicked
        },
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating review password:", error);
      Alert.alert("Error", "Failed to update the review password.");
      setIsLoading(false);
    }
  };

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
          value={newReviewPassword}
          onChangeText={setNewReviewPassword}
        />
        <Input
          inputMode="password"
          placeholder="Confirm review Password"
          value={confirmNewReviewPassword}
          onChangeText={setConfirmNewReviewPassword}
        />
      </View>

      <Button
        title="Confirm"
        onPress={handleConfirm}
        disabled={isLoading}
      ></Button>
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
    width: "100%",
    marginVertical: 24,
  },
});

import { StyleSheet, TouchableOpacity, View, Image, Alert } from "react-native";
import React, { useState } from "react";
import Input from "@/components/Input";
import Text from "@/components/Text";
import auth from "@react-native-firebase/auth";
import Button from "@/components/Button";

const DeleteAccount = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const providerId = auth().currentUser?.providerData;
  console.log("Provider: ", providerId);
  const handleDelete = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    const user = auth().currentUser;
    if (!user?.email) {
      Alert.alert("Error", "No user is currently signed in.");
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate
      const credential = auth.EmailAuthProvider.credential(
        user.email,
        password
      );
      await user.reauthenticateWithCredential(credential);

      // Delete user
      await user.delete();
      Alert.alert(
        "Account Deleted",
        "Your account has been permanently deleted."
      );
    } catch (error) {
      console.error("Account deletion failed:", error);
      if (error.code === "auth/wrong-password") {
        Alert.alert("Error", "Incorrect password.");
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
        <Input
          inputMode="password"
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassword}
        />
        <Input
          inputMode="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>
      <Text size="small" weight="normal" color="#F2D189" style={styles.warning}>
        You won’t be able to recover your account once deleted.
      </Text>
      <TouchableOpacity
        onPress={handleDelete}
        disabled={loading}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 30,
          borderWidth: 1,
          borderColor: "#FBF6FA",
          height: 48,
          width: "100%",
          opacity: loading ? 0.5 : 1,
        }}
      >
        <Text size="h4" weight="semibold" color="#E01D1D">
          {loading ? "Deleting..." : "I wanna miss out"}
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
    width: "100%",
  },
});

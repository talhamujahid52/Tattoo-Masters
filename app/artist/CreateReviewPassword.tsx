import React, { useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Text from "@/components/Text";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { router } from "expo-router";

const CreateReviewPassword = () => {
  const [reviewPassword, setReviewPassword] = useState<string>("");
  const [confirmReviewPassword, setConfirmReviewPassword] =
    useState<string>("");
  const [error, setError] = useState<string>("");

  const handleCreateAccount = () => {
    if (!reviewPassword || !confirmReviewPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (reviewPassword !== confirmReviewPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    // Proceed with account creation logic here
    console.log("Account created with password:", reviewPassword);
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <View
        style={{
          width: 115,
          height: 109,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Image
          style={{
            height: 115,
            width: 109,
            resizeMode: "contain",
          }}
          source={require("../../assets/images/reviewPasswordImage.png")}
        />
        <Image
          style={[
            styles.headerImage,
            {
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: [{ translateX: -34 }, { translateY: -34 }],
            },
          ]}
          source={require("../../assets/images/profilePicture.png")}
        />
      </View>

      <Text
        weight="medium"
        size="profileName"
        color="#FBF6FA"
        style={{ marginVertical: 16 }}
      >
        Last Step
      </Text>
      <Text color="#A7A7A7" style={styles.descriptionText}>
        In order to get reviewed on Tattoo Masters{"\n"} your clients must enter
        a review password.
      </Text>
      <Text color="#A7A7A7" style={styles.descriptionText}>
        Come up with a creative password{"\n"}which you can share with them!
      </Text>

      <View style={styles.infoBox}>
        <Image
          source={require("../../assets/images/error-2.png")}
          style={styles.warningIcon}
          resizeMode="contain"
        />
        <View>
          <Text size="medium" color="#A7A7A7">
            This password will be used by your customers.
          </Text>
          <Text size="medium" color="#A7A7A7">
            Please do not use any personal password{"\n"}for this purpose.
          </Text>
        </View>
      </View>

      <View style={styles.inputSection}>
        {error !== "" && (
          <Text color="red" style={styles.errorText}>
            {error}
          </Text>
        )}
        <Input
          inputMode="password"
          placeholder="Create Review Password"
          value={reviewPassword}
          onChangeText={setReviewPassword}
        />
        <Input
          inputMode="password"
          placeholder="Confirm Review Password"
          value={confirmReviewPassword}
          onChangeText={setConfirmReviewPassword}
        />
        <Button
          title="Create Account"
          onPress={() => {
            router.push("/artist/ShareProfile");
          }}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

export default CreateReviewPassword;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    flexGrow: 1,
    backgroundColor: "#000", // optional: assuming dark background
  },
  headerImage: {
    height: 68,
    width: 68,
    resizeMode: "contain",
    borderRadius: 50,
  },
  descriptionText: {
    marginBottom: 16,
    textAlign: "center",
  },
  infoBox: {
    borderWidth: 2,
    borderColor: "#20201E",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  warningIcon: {
    height: 20,
    width: 20,
    marginRight: 16,
  },
  inputSection: {
    width: "100%",
    rowGap: 10,
    marginTop: "auto",
    marginBottom: 40,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 8,
  },
});

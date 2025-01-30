import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import Input from "@/components/Input";
import Text from "@/components/Text";
import Button from "@/components/Button";
import { useRouter } from "expo-router";

const VerifyReviewPassword = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={{ height: 44, width: 44 }}>
        <Image
          style={styles.image}
          source={require("../../assets/images/edit_note.png")}
        />
      </View>
      <Text size="h3" weight="medium" color="#FBF6FA" style={styles.title}>
        Enter Password to review Martin
      </Text>
      <Text
        size="p"
        weight="normal"
        color="#A7A7A7"
        style={styles.description1}
      >
        Get the review password from Martin to leave a review. This is to ensure
        authenticity of reviews.
      </Text>
      <View style={styles.passwordFieldsContainer}>
        <Input inputMode="password" placeholder="Enter review password"></Input>
      </View>
      <Button
        title="Continue"
        onPress={() => {
          router.push("/artist/AddReview");
        }}
      ></Button>
    </View>
  );
};

export default VerifyReviewPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 24,
  },
  image: { height: "100%", width: "100%" },
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

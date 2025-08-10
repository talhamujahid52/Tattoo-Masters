import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import Text from "@/components/Text";
import React from "react";
import { router } from "expo-router";

const FeedbackSubmitted = () => {
  return (
    <View style={styles.container}>
      <Text>FeedbackSubmitted</Text>
      <Image
        style={styles.image}
        source={require("../../assets/images/check.png")}
      />
      <Text
        size="h3"
        weight="medium"
        color="#FBF6FA"
        style={{ marginTop: 20, marginBottom: 10 }}
      >
        Feedback submitted!
      </Text>
      <Text
        size="p"
        weight="normal"
        color="#B1AFA4"
        style={{ marginBottom: 24 }}
      >
        Thank you for your valuable feedback.
      </Text>
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
        style={styles.button}
      >
        <Text size="h4" weight="semibold" color="#FBF6FA">
          {"Continue"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FeedbackSubmitted;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  image: {
    height: 36,
    width: 36,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#FBF6FA",
    height: 48,
    width: "100%",
  },
});

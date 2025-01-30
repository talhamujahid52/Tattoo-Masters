import { StyleSheet, View, Image } from "react-native";
import Text from "@/components/Text";
import React from "react";
import Review from "@/components/Review";
import Button from "@/components/Button";

const PublishReview = () => {
  return (
    <View style={styles.container}>
      <View style={styles.artistProfileTile}>
        <Image
          style={styles.profilePicture}
          source={require("../../assets/images/Artist.png")}
        />
        <View>
          <Text size="h3" weight="semibold" color="white">
            Martin Luis
          </Text>
          <Text size="p" weight="normal" color="#A7A7A7">
            Luis Arts Studio
          </Text>
          <Text size="p" weight="normal" color="#A7A7A7">
            Phuket, Thailand
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text
          size="h4"
          weight="semibold"
          color="#A7A7A7"
          style={{ marginTop: 24, marginBottom: 16 }}
        >
          Review
        </Text>
        <Review />
      </View>

      <View style={styles.buttonContainer}>
        <Text
          size="medium"
          weight="normal"
          color="#A7A7A7"
          style={{ marginBottom: 16, textAlign: "center" }}
        >
          You are unable to edit or remove your review once published.
        </Text>
        <Button title="Publish Review" />
      </View>
    </View>
  );
};

export default PublishReview;

const styles = StyleSheet.create({
  container: {
    flex: 1, // Allow the container to take up full available space
    padding: 16,
    justifyContent: "space-between", // Distribute space and push the button to the bottom
  },
  artistProfileTile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#20201E",
  },
  profilePicture: {
    height: 82,
    width: 82,
    resizeMode: "contain",
    borderRadius: 50,
  },
  content: {
    flex: 1, // Allow the content to take up available space
  },
  buttonContainer: {
    marginBottom: 16, // Add some space between the button and the bottom
  },
});

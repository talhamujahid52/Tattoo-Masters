import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import Text from "./Text";

type NoReviewsProps = {
  ArtistId: string;
};

const NoReviews: React.FC<NoReviewsProps> = ({ ArtistId }) => {
  return (
    <View style={styles.container}>
      <Text size="profileName" weight="semibold" color="#FBF6FA">
        Reviews
      </Text>
      <Text size="p" weight="normal" color="#A7A7A7">
        The tattoo artist has no reviews yet. Want to leave a review?
      </Text>
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/artist/VerifyReviewPassword",
            params: { artistId: ArtistId },
          });
        }}
      >
        <Text size="p" weight="normal" color="#DAB769">
          Leave a review?
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default NoReviews;

const styles = StyleSheet.create({
  container: {
    height: 135,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#20201E",
    padding: 16,
    borderRadius: 12,
  },
});

import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import Text from "./Text";
import { useSelector } from "react-redux";

type NoReviewsProps = {
  ArtistId: string;
  showLoginBottomSheet: () => void;
};

const NoReviews: React.FC<NoReviewsProps> = ({
  ArtistId,
  showLoginBottomSheet,
}) => {
  const loggedInUser = useSelector((state: any) => state?.user?.user);

  return (
    <View style={styles.container}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text size="profileName" weight="semibold" color="#FBF6FA">
          Reviews
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (loggedInUser) {
              router.push({
                pathname: "/artist/VerifyReviewPassword",
                params: { artistId: ArtistId },
              });
            } else {
              showLoginBottomSheet();
            }
          }}
        >
          <Text size="p" weight="normal" color="#DAB769">
            Leave a review?
          </Text>
        </TouchableOpacity>
      </View>

      <Text size="p" weight="normal" color="#A7A7A7">
        The tattoo artist has no reviews yet.
      </Text>
    </View>
  );
};

export default NoReviews;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    rowGap: 8,
    backgroundColor: "#20201E",
    padding: 16,
    borderRadius: 12,
  },
});

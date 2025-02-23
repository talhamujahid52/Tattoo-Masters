import { StyleSheet, View, Image, ActivityIndicator } from "react-native";
import Text from "@/components/Text";
import React, { useState } from "react";
import Review from "@/components/Review";
import Button from "@/components/Button";
import { router, useLocalSearchParams } from "expo-router";
import useGetArtist from "@/hooks/useGetArtist";
import firestore from "@react-native-firebase/firestore";
import { firebase } from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";

const PublishReview = () => {
  const { artistId, rating, tattooFeedback, tattooImage } =
    useLocalSearchParams();
  const artist = useGetArtist(artistId);
  const currentUserId = firebase?.auth()?.currentUser?.uid;
  const [loading, setLoading] = useState(false); // Manage loading state
  const loggedInUser = useSelector((state: any) => state?.user?.user); // get Loggedin User

  const handlePublishReview = async () => {
    setLoading(true);

    try {
      await firestore().collection("reviews").add({
        artistId,
        date: new Date(),
        feedback: tattooFeedback,
        rating,
        user: currentUserId,
      });

      const userRef = firestore().collection("Users").doc(artistId.toString());
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData) {
          const { reviewsCount = 0, totalRating = 0 } = userData;

          const newReviewsCount = reviewsCount + 1;
          const newTotalRating = totalRating + Number(rating);
          const newAverageRating = newTotalRating / newReviewsCount;

          const latestReview = {
            feedback: tattooFeedback,
            rating,
            date: new Date(),
            reviewerName: loggedInUser?.name,
            reviewerProfilePicture: loggedInUser?.profilePicture,
          };
          await userRef.update({
            reviewsCount: newReviewsCount,
            totalRating: newTotalRating,
            rating: newAverageRating,
            latestReview,
          });
        }
      }
    } catch (err) {
      console.error("Error publishing review:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.artistProfileTile}>
        <Image
          style={styles.profilePicture}
          source={
            artist?.data?.profilePicture
              ? { uri: artist?.data?.profilePicture }
              : require("../../assets/images/Artist.png")
          }
        />
        <View>
          <Text size="h3" weight="semibold" color="white">
            {artist?.data?.name || "Martin Luis"}
          </Text>
          <Text size="p" weight="normal" color="#A7A7A7">
            {artist?.data?.studio?.name || "Luis Arts Studio"}
          </Text>
          <Text
            size="p"
            weight="normal"
            color="#A7A7A7"
            style={{ width: "70%" }}
          >
            {artist?.data?.city || "Phuket, Thailand"}
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
        <Review
          rating={rating}
          tattooFeedback={tattooFeedback}
          tattooImage={tattooImage}
        />
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

        <Button
          title={loading ? "Publishing..." : "Publish Review"}
          onPress={handlePublishReview}
          disabled={loading} // Disable button during loading
        />
      </View>
    </View>
  );
};

export default PublishReview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
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
    flex: 1,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  loader: {
    marginTop: 20, // Space out the loader from the button
  },
});

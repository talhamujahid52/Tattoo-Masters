import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import Text from "@/components/Text";
import React, { useState } from "react";
import Review from "@/components/Review";
import Button from "@/components/Button";
import { router, useLocalSearchParams } from "expo-router";
import useGetArtist from "@/hooks/useGetArtist";
import firestore from "@react-native-firebase/firestore";
import { firebase } from "@react-native-firebase/firestore";
import { uploadReviewImage } from "@/utils/firebase/uploadReviewImage";

const PublishReview = () => {
  const { artistId, rating, tattooFeedback, tattooImage } =
    useLocalSearchParams();
  const artist = useGetArtist(artistId);
  const currentUserId = firebase?.auth()?.currentUser?.uid;
  const [loading, setLoading] = useState(false);

  const handlePublishReview = async () => {
    setLoading(true);

    try {
      const imageURLs = await uploadReviewImage(
        tattooImage as string,
        currentUserId as string,
        "reviewImage.jpeg"
      );

      if (!imageURLs?.downloadUrlSmall) {
        throw new Error("Failed to upload image");
      }

      await firestore().collection("reviews").add({
        artistId,
        date: new Date(),
        feedback: tattooFeedback,
        rating,
        user: currentUserId,
        imageUrl: imageURLs.downloadUrlSmall,
      });

      const userRef = firestore()
        .collection("Users")
        .doc(artistId as string);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData) {
          const {
            reviewsCount = 0,
            totalRating = 0,
            ratingCategores = {
              "5 star": 0,
              "4 star": 0,
              "3 star": 0,
              "2 star": 0,
              "1 star": 0,
            },
          } = userData;

          const newReviewsCount = reviewsCount + 1;
          const newTotalRating = totalRating + Number(rating);
          const newAverageRating = newTotalRating / newReviewsCount;
          const ratingKey = `${Math.floor(Number(rating))} star`;
          const updatedRatingCategories = {
            ...ratingCategores,
            [ratingKey]: ratingCategores[ratingKey] + 1,
          };

          const latestReview = {
            feedback: tattooFeedback,
            rating,
            date: new Date(),
            reviewerId: currentUserId,
            imageUrl: imageURLs.downloadUrlSmall,
          };

          await userRef.update({
            reviewsCount: newReviewsCount,
            totalRating: newTotalRating,
            rating: newAverageRating,
            ratingCategores: updatedRatingCategories,
            latestReview,
          });
        }
      }

      router.back();
    } catch (err) {
      console.error("Error publishing review:", err);
      Alert.alert(
        "Error",
        err instanceof Error && err.message === "Failed to upload image"
          ? "We couldn't upload your tattoo image. Please try again."
          : "There was a problem publishing your review. Please try again.",
        [{ text: "OK" }]
      );
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
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 24,
            paddingBottom: 16,
          }}
        >
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Review
          </Text>
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
          >
            <Text size="h4" weight="semibold" color="#DAB769">
              Edit Review?
            </Text>
          </TouchableOpacity>
        </View>
        <Review
          rating={rating as string}
          tattooFeedback={tattooFeedback as string}
          tattooImage={tattooImage as string}
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
          title={
            loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              "Publish Review"
            )
          }
          onPress={handlePublishReview}
          disabled={loading}
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
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#202020",
  },
  content: {
    flex: 1,
  },
  buttonContainer: {
    marginBottom: 16,
  },
});

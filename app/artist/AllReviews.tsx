import { StyleSheet, View, FlatList } from "react-native";
import Text from "@/components/Text";
import React from "react";
import PublishedReview from "@/components/PublishedReview";
import { useLocalSearchParams } from "expo-router";
import useGetReviews from "@/hooks/useGetReviews";
import ReviewsAndRatingSummary from "@/components/ReviewsAndRatingSummary";

const AllReviews = () => {
  const { artistId, artistRating, totalReviews, ratingCategories } =
    useLocalSearchParams();
  const { reviews, loading, error } = useGetReviews(artistId);

  const parsedRatingCategories = ratingCategories
    ? JSON.parse(ratingCategories as string)
    : null;

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error loading reviews: {error.message}</Text>;
  }

  return (
    <FlatList
      data={reviews}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <View style={styles.header}>
          <ReviewsAndRatingSummary
            ratingCategories={parsedRatingCategories}
            averageRating={Number(artistRating)}
            totalReviews={Number(totalReviews)}
          />
          <View style={styles.separator} />
        </View>
      }
      renderItem={({ item }) => (
        <View>
          <PublishedReview review={item} />
          <View style={styles.separator}></View>
        </View>
      )}
    />
  );
};

export default AllReviews;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    // marginBottom: 16,
  },
  separator: {
    marginVertical: 24,
    backgroundColor: "#2D2D2D",
    width: "100%",
    height: 1,
  },
});

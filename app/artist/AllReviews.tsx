import { StyleSheet, Text, View, FlatList } from "react-native";
import React from "react";
import PublishedReview from "@/components/PublishedReview";
import { useLocalSearchParams } from "expo-router";
import useGetReviews from "@/hooks/useGetReviews";

const AllReviews = () => {
  const { artistId } = useLocalSearchParams();
  const { reviews, loading, error } = useGetReviews(artistId);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error loading reviews: {error.message}</Text>;
  }

  return (
    <FlatList
      data={reviews}
      keyExtractor={(item) => item.id.toString()} // Ensure unique key for each item
      contentContainerStyle={styles.container}
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
  },
  separator: {
    marginVertical: 24,
    backgroundColor: "#2D2D2D",
    width: "100%",
    height: 1,
  },
});

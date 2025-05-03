import React from "react";
import { View, StyleSheet, Image, ImageSourcePropType } from "react-native";
import Text from "./Text";

// Update the type to match your object structure
type RatingCategories = {
  "1 star": number;
  "2 star": number;
  "3 star": number;
  "4 star": number;
  "5 star": number;
};

interface ReviewsAndRatingSummaryProps {
  ratingCategories?: RatingCategories;
  averageRating?: number;
  totalReviews?: number;
}

const ReviewsAndRatingSummary: React.FC<ReviewsAndRatingSummaryProps> = ({
  ratingCategories = { "1 star": 0, "2 star": 0, "3 star": 0, "4 star": 0, "5 star": 0 },
  averageRating = 4.8,
  totalReviews = 0,
}) => {
  const totalRatings = Object.values(ratingCategories).reduce(
    (a, b) => a + b,
    0
  );

  const wholeStars = Math.floor(averageRating);
  const hasDecimal = averageRating % 1 !== 0;
  const filledStars = wholeStars;
  const halfStar = hasDecimal ? 1 : 0;
  const emptyStars = 5 - filledStars - halfStar;

  const renderStars = () => {
    const stars: JSX.Element[] = [];

    // Filled stars
    for (let i = 0; i < filledStars; i++) {
      stars.push(
        <Image
          key={`filled-${i}`}
          source={require("../assets/images/star-filled.png")}
          style={styles.star}
          resizeMode="contain"
        />
      );
    }

    // Half-filled star
    if (halfStar > 0) {
      stars.push(
        <Image
          key="half"
          source={require("../assets/images/star-halfFilled.png")}
          style={styles.star}
          resizeMode="contain"
        />
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Image
          key={`empty-${i}`}
          source={require("../assets/images/star-empty.png")}
          style={styles.star}
          resizeMode="contain"
        />
      );
    }

    return stars;
  };

  return (
    <View style={styles.mainContainer}>
      {/* Left side - Rating bars */}
      <View style={styles.barsContainer}>
        <Text color="#FFF" style={styles.sectionTitle}>
          Overall Rating
        </Text>
        <View style={styles.barsWrapper}>
          {[5, 4, 3, 2, 1].map((star: number) => {
            // Get count from the rating categories using the key format "X star"
            const starKey = `${star} star` as keyof RatingCategories;
            const count = ratingCategories[starKey] || 0;
            const barWidth =
              totalRatings === 0 ? 0 : (count / totalRatings) * 100;

            return (
              <View key={star} style={styles.barRow}>
                <Text style={styles.starLabel}>{star}</Text>
                <View style={styles.barBackground}>
                  <View style={[styles.barFill, { width: `${barWidth}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Right side - Rating value and stars */}
      <View style={styles.ratingContainer}>
        <Text size="h1" weight="semibold" color="#FFFFFF">
          {averageRating.toFixed(1)}
        </Text>
        <View style={styles.starsContainer}>{renderStars()}</View>
        <Text color="#A7A7A7">{totalReviews} reviews</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    // paddingVertical: 16,
  },
  barsContainer: {
    flex: 0.5,
    paddingRight: 12,
  },
  barsWrapper: {
    marginTop: 4,
    width: "80%",
  },
  ratingContainer: {
    flex: 0.5,
    justifyContent: "center",
    paddingLeft: 8,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 18,
    marginBottom: 4,
  },
  starLabel: {
    fontSize: 14,
    color: "#A7A7A7",
    width: 14,
  },
  barBackground: {
    flex: 1,
    height: 4,
    backgroundColor: "#2D2D2D",
    borderRadius: 5,
    marginHorizontal: 8,
  },
  barFill: {
    height: 4,
    backgroundColor: "#DAB769",
    borderRadius: 12,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  star: {
    width: 17,
    height: 16,
    marginHorizontal: 1,
  },
});

export default ReviewsAndRatingSummary;
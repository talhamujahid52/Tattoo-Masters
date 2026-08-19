import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import React, { useMemo } from "react";
import Text from "./Text";
import { router } from "expo-router";
import useBottomSheet from "@/hooks/useBottomSheet";
import ShareReviewPasswordBottomSheet from "./BottomSheets/ShareReviewPasswordBottomSheet";
import ShareReviewPasswordNote from "./BottomSheets/ShareReviewPasswordNote";
import useGetArtist from "@/hooks/useGetArtist";
import { formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";
import useGetReviews from "@/hooks/useGetReviews";

interface ReviewOnProfileProps {
  ArtistId?: any;
  isMyProfile?: boolean;
  showLoginBottomSheet?: () => void;
}

const ReviewOnProfile: React.FC<ReviewOnProfileProps> = ({
  ArtistId,
  isMyProfile = false,
  showLoginBottomSheet = () => undefined,
}) => {
  const {
    BottomSheet,
    show,
    hide: hideShareReviewPasswordBottomSheet,
  } = useBottomSheet();

  const {
    BottomSheet: ReviewPasswordNoteBottomSheet,
    show: showReviewPasswordNoteBottomSheet,
    hide: hideReviewPasswordNoteBottomSheet,
  } = useBottomSheet();

  const artist = useGetArtist(ArtistId);

  const artistRating = artist?.data?.rating;
  const ratingCategories = artist?.data?.ratingCategories;
  const { reviews } = useGetReviews(ArtistId);
  const latestReview = useMemo(
    () =>
      [...reviews].sort((left, right) => {
        const leftSeconds = Number(left?.date?.seconds ?? left?.date ?? 0);
        const rightSeconds = Number(right?.date?.seconds ?? right?.date ?? 0);
        return rightSeconds - leftSeconds;
      })[0],
    [reviews],
  );
  const totalVisibleReviews = reviews.length;

  // Use date-fns to calculate the distance from now
  const timeAgo = (timestamp: any): string => {
    const seconds = Number(timestamp?.seconds ?? timestamp ?? 0);
    const reviewDate = new Date(seconds * 1000);
    return formatDistanceToNow(reviewDate, { addSuffix: true });
  };
  const loggedInUser = useSelector((state: any) => state?.user?.user);

  return (
    <>
      <BottomSheet
        InsideComponent={
          <ShareReviewPasswordBottomSheet
            hideShareReviewPasswordBottomSheet={
              hideShareReviewPasswordBottomSheet
            }
          />
        }
      />
      <ReviewPasswordNoteBottomSheet
        InsideComponent={<ShareReviewPasswordNote />}
      />
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.midRow}>
            <Text size="profileName" weight="semibold" color="#FBF6FA">
              Reviews
            </Text>
            {isMyProfile && (
              <TouchableOpacity
                onPress={() => {
                  showReviewPasswordNoteBottomSheet();
                }}
              >
                <Image
                  style={styles.icon}
                  source={require("../assets/images/help.png")}
                />
              </TouchableOpacity>
            )}
          </View>
          {isMyProfile ? (
            <TouchableOpacity
              onPress={() => {
                show();
              }}
            >
              <Text size="h4" weight="normal" color="#DAB769">
                Share review password
              </Text>
            </TouchableOpacity>
          ) : (
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
              <Text size="h4" weight="normal" color="#DAB769">
                Review this artist?
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={[styles.midRow, { gap: 4, marginBottom: 16 }]}>
          <Image
            style={styles.icon}
            source={require("../assets/images/star.png")}
          />
          <Text size="p" weight="normal" color="#FBF6FA">
            {artistRating ? Number(artistRating).toFixed(1) : "0.0"} (
            {totalVisibleReviews} review{totalVisibleReviews === 1 ? "" : "s"})
          </Text>
        </View>
        {latestReview ? (
          <>
            <View style={styles.userProfileRow}>
              <View style={styles.pictureAndName}>
                <Image
                  style={styles.profilePicture}
                  source={
                    latestReview?.userProfilePicture
                      ? { uri: latestReview.userProfilePicture }
                      : require("../assets/images/placeholder.png")
                  }
                />
                <View>
                  <Text size="p" weight="normal" color="#FFF">
                    {latestReview?.userName || "Deleted account"}
                  </Text>
                  <Text size="medium" weight="normal" color="#A7A7A7">
                    {latestReview?.date
                      ? timeAgo(latestReview.date)
                      : "Just now"}
                  </Text>
                </View>
              </View>
              <View style={[styles.midRow, { gap: 4 }]}>
                <Image
                  style={styles.icon}
                  source={require("../assets/images/star.png")}
                />
                <Text size="p" weight="normal" color="#FBF6FA">
                  {latestReview?.rating ?? "0"}
                </Text>
              </View>
            </View>
            <Text size="p" weight="normal" color="#A7A7A7">
              {latestReview.feedback}
            </Text>
          </>
        ) : (
          <Text size="p" weight="normal" color="#A7A7A7">
            The tattoo artist has no reiews yet
          </Text>
        )}
        {totalVisibleReviews > 0 && (
          <>
            <View style={styles.seprator}></View>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/artist/AllReviews",
                  params: {
                    artistId: ArtistId,
                    artistRating: artistRating,
                    totalReviews: totalVisibleReviews,
                    ratingCategories: JSON.stringify(ratingCategories),
                  },
                });
              }}
              style={styles.bottomRow}
            >
              <Text size="h4" weight="normal" color="#FBF6FA">
                View all
                {totalVisibleReviews > 1
                  ? " " + totalVisibleReviews + " "
                  : " "}
                reviews
              </Text>
              <Image
                style={styles.icon}
                source={require("../assets/images/rightArrow.png")}
              />
            </TouchableOpacity>
          </>
        )}
      </View>
    </>
  );
};

export default ReviewOnProfile;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#212120",
    borderRadius: 12,
  },
  icon: {
    height: 24,
    width: 24,
    resizeMode: "contain",
  },
  topRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  midRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userProfileRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pictureAndName: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profilePicture: {
    height: 42,
    width: 42,
    resizeMode: "cover",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#202020",
  },
  seprator: {
    height: 1,
    width: "100%",
    backgroundColor: "#FFFFFF26",
    marginVertical: 16,
  },
  bottomRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

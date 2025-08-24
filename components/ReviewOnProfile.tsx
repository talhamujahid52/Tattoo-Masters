import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import Text from "./Text";
import { router } from "expo-router";
import useBottomSheet from "@/hooks/useBottomSheet";
import ShareReviewPasswordBottomSheet from "./BottomSheets/ShareReviewPasswordBottomSheet";
import ShareReviewPasswordNote from "./BottomSheets/ShareReviewPasswordNote";
import useGetArtist from "@/hooks/useGetArtist";
import { formatDistanceToNow } from "date-fns";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";

interface ReviewOnProfileProps {
  ArtistId?: any;
  isMyProfile?: boolean;
  showLoginBottomSheet: () => void;
}

const ReviewOnProfile: React.FC<ReviewOnProfileProps> = ({
  ArtistId,
  isMyProfile = false,
  showLoginBottomSheet,
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
  const totalReviews = artist?.data?.reviewsCount;
  const latestReview = artist?.data?.latestReview;
  const ratingCategories = artist?.data?.ratingCategories;

  const reviewerId = latestReview?.reviewerId;
  const [reviewerDetails, setReviewerDetails] = useState<any>({});

  const getUserFromId = async () => {
    try {
      if (!reviewerId) {
        return null;
      }

      const usersSnapshot = await firestore()
        .collection("Users")
        .where("uid", "==", reviewerId)
        .get();

      if (usersSnapshot.empty) {
        return null;
      }

      const userData = usersSnapshot.docs[0].data();
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  useEffect(() => {
    // Create an async function inside the useEffect
    const fetchUserData = async () => {
      const user = await getUserFromId();
      if (user) {
        setReviewerDetails(user);
        console.log("User data fetched:", user);
        // Do something with the fetched user data (e.g., set state)
      } else {
        console.log("User not found");
      }
    };

    fetchUserData(); // Call the async function
  }, [reviewerId]);

  // Use date-fns to calculate the distance from now
  const timeAgo = (timestamp: number): string => {
    const reviewDate = new Date(timestamp * 1000); // Convert seconds to milliseconds
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
            {artistRating ? Number(artistRating).toFixed(1) : "4.8"} (
            {totalReviews ? totalReviews : "129"} reviews)
          </Text>
        </View>
        <View style={styles.userProfileRow}>
          <View style={styles.pictureAndName}>
            <Image
              style={styles.profilePicture}
              source={
                reviewerDetails?.profilePicture
                  ? { uri: reviewerDetails?.profilePicture }
                  : require("../assets/images/Artist.png")
              }
            />
            <View>
              <Text size="p" weight="normal" color="#FFF">
                {reviewerDetails?.name ? reviewerDetails?.name : "Martin Luis"}
              </Text>
              <Text size="medium" weight="normal" color="#A7A7A7">
                {latestReview?.date ? timeAgo(latestReview.date) : "Just now"}{" "}
                {/* Display the calculated time ago */}
              </Text>
            </View>
          </View>
          <View style={[styles.midRow, { gap: 4 }]}>
            <Image
              style={styles.icon}
              source={require("../assets/images/star.png")}
            />
            <Text size="p" weight="normal" color="#FBF6FA">
              {latestReview?.rating ? latestReview?.rating : "4.5"}
            </Text>
          </View>
        </View>
        <Text size="p" weight="normal" color="#A7A7A7">
          {latestReview?.feedback
            ? latestReview?.feedback
            : "Lorem ipsum dolor sit amet contetur itbj jbds adipiscing elit sed do eiusmod tempor incididunt ut labore."}
        </Text>
        {totalReviews && (
          <>
            <View style={styles.seprator}></View>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/artist/AllReviews",
                  params: {
                    artistId: ArtistId,
                    artistRating: artistRating,
                    totalReviews: totalReviews,
                    ratingCategories: JSON.stringify(ratingCategories),
                  },
                });
              }}
              style={styles.bottomRow}
            >
              <Text size="h4" weight="normal" color="#FBF6FA">
                View all {totalReviews > 1 ? totalReviews : ""} reviews
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

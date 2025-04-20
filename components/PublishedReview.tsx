import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import Text from "./Text";
import { formatDistanceToNow } from "date-fns"; // Import date-fns
import useBottomSheet from "@/hooks/useBottomSheet";
import ReportBottomSheet from "@/components/BottomSheets/ReportBottomSheet";

interface Review {
  artistId: string;
  date: {
    nanoseconds: number;
    seconds: number;
  };
  feedback: string;
  id: string;
  rating: string;
  user: string;
  userName: string;
  userProfilePicture: string;
  imageUrl: string;
}

const options = [
  { label: "Nudity or sexual content", value: "Nudity or sexual content" },
  { label: "Inappropriate content", value: "Inappropriate content" },
  { label: "False review", value: "False review" },
  { label: "Other", value: "Other" },
];

const PublishedReview = ({ review }: { review: Review }) => {
  const reviewDate = new Date(review.date.seconds * 1000);
  const timeAgo = formatDistanceToNow(reviewDate, { addSuffix: true });

  const {
    BottomSheet: ReportSheet,
    show: showReportSheet,
    hide: hideReportSheet,
  } = useBottomSheet();

  return (
    <>
      <ReportSheet
        InsideComponent={
          <ReportBottomSheet
            hideReportSheet={hideReportSheet}
            title="Review"
            options={options}
            reportItem={review?.id}
          />
        }
      />
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.profilePictureAndName}>
            <Image
              style={styles.profilePicture}
              source={
                review?.userProfilePicture
                  ? { uri: review?.userProfilePicture }
                  : require("../assets/images/Artist.png")
              }
            />
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
              }}
            >
              <Text size="p" weight="normal" color="#FFF">
                {review?.userName ? review?.userName : "Martin Luis"}
              </Text>
              <Text size="medium" weight="normal" color="#A7A7A7">
                {timeAgo} {/* Display the calculated time ago */}
              </Text>
            </View>
            <View style={styles.midRow}>
              <Image
                style={styles.icon}
                source={require("../assets/images/star.png")}
              />
              <Text size="p" weight="normal" color="#FBF6FA">
                {review?.rating ? review?.rating : "4.5"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              showReportSheet();
            }}
          >
            <Image
              style={styles.icon}
              source={require("../assets/images/report-flag.png")}
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          <Text
            size="p"
            weight="normal"
            color="#A7A7A7"
            style={{ width: "70%" }}
          >
            {review?.feedback
              ? review?.feedback
              : "This is the 3rd review. This artist is going great."}
          </Text>
          <View
            style={{
              height: 90,
              width: "27%",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <Image
              style={{
                height: "100%",
                width: "100%",
                resizeMode: "cover",
              }}
              source={
                review.imageUrl
                  ? { uri: review.imageUrl }
                  : require("../assets/images/Artist.png")
              }
            />
          </View>
        </View>
      </View>
    </>
  );
};

export default PublishedReview;

const styles = StyleSheet.create({
  container: {},
  icon: {
    height: 20,
    width: 20,
    resizeMode: "contain",
  },
  topRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profilePictureAndName: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  midRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 20,
  },
  userProfileRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  profilePicture: {
    height: 42,
    width: 42,
    resizeMode: "cover",
    borderRadius: 50,
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

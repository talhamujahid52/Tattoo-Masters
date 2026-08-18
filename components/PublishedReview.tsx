import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import Text from "./Text";
import { formatDistanceToNow } from "date-fns"; // Import date-fns
import useBottomSheet from "@/hooks/useBottomSheet";
import ReportBottomSheet from "@/components/BottomSheets/ReportBottomSheet";
import BlockUserBottomSheet from "@/components/BottomSheets/BlockUserBottomSheet";
import LoginBottomSheet from "./BottomSheets/LoginBottomSheet";
import { useSelector } from "react-redux";
import ProfilePicturePreview from "./ProfilePicturePreview";
import useSafety from "@/hooks/useSafety";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  largeImageUrl: string;
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
  const loggedInUser = useSelector((state: any) => state?.user?.user);
  const {
    currentUserId,
    blockedUserIds,
    reportedReviewIds,
  } = useSafety();

  const {
    BottomSheet: ReportSheet,
    show: showReportSheet,
    hide: hideReportSheet,
  } = useBottomSheet();

  const {
    BottomSheet: BlockSheet,
    show: showBlockSheet,
    hide: hideBlockSheet,
  } = useBottomSheet();

  const {
    BottomSheet: SafetyActionsSheet,
    show: showSafetyActionsSheet,
    hide: hideSafetyActionsSheet,
  } = useBottomSheet();

  const {
    BottomSheet: LoggingInBottomSheet,
    show: showLoggingInBottomSheet,
    hide: hideLoggingInBottomSheet,
  } = useBottomSheet();

  const isHidden =
    reportedReviewIds.includes(review.id) ||
    blockedUserIds.includes(review.user);

  if (isHidden) return null;

  return (
    <>
      <SafetyActionsSheet
        InsideComponent={
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                hideSafetyActionsSheet();
                showReportSheet();
              }}
            >
              <Image
                style={styles.actionIcon}
                source={require("../assets/images/report-flag.png")}
              />
              <Text size="h4" weight="normal" color="#FBF6FA">
                Report review
              </Text>
            </TouchableOpacity>
            {review.user && review.user !== currentUserId && (
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => {
                  hideSafetyActionsSheet();
                  showBlockSheet();
                }}
              >
                <MaterialCommunityIcons
                  name="account-cancel-outline"
                  size={24}
                  color="#A7A7A7"
                />
                <Text size="h4" weight="normal" color="#FBF6FA">
                  Block user
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      <ReportSheet
        InsideComponent={
          <ReportBottomSheet
            hideReportSheet={hideReportSheet}
            title="Review"
            type="review"
            options={options}
            reportItem={review?.id}
            targetOwnerId={review?.user}
          />
        }
      />
      <BlockSheet
        InsideComponent={
          <BlockUserBottomSheet
            hideBlockSheet={hideBlockSheet}
            blockedUserId={review.user}
            blockedUserName={review.userName}
            blockedUserProfilePicture={review.userProfilePicture}
            sourceType="review"
            sourceId={review.id}
          />
        }
      />
      <LoggingInBottomSheet
        InsideComponent={
          <LoginBottomSheet hideLoginBottomSheet={hideLoggingInBottomSheet} />
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
                  : require("../assets/images/placeholder.png")
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
                {review?.userName ? review?.userName : "Deleted account"}
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
              if (loggedInUser) {
                showSafetyActionsSheet();
              } else {
                showLoggingInBottomSheet();
              }
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
            {/* <Image
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
            /> */}
            <ProfilePicturePreview
              imageSource={
                review.imageUrl
                  ? { uri: review.imageUrl }
                  : require("../assets/images/Artist.png")
              }
              imageStyle={{
                height: "100%",
                width: "100%",
                resizeMode: "cover",
              }}
              isSquare={true}
              highResolutionImage={review?.largeImageUrl}
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
  actionsContainer: {
    backgroundColor: "#080808",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  actionIcon: {
    height: 24,
    width: 24,
    resizeMode: "contain",
  },
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

import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import Text from "./Text";
import useBottomSheet from "@/hooks/useBottomSheet";
import ShareReviewPasswordBottomSheet from "./BottomSheets/ShareReviewPasswordBottomSheet";
import ShareReviewPasswordNote from "./BottomSheets/ShareReviewPasswordNote";

const NoReviewsOnMyProfile: React.FC = () => {
  const {
    BottomSheet,
    show,
    hide: hideShareReviewPasswordBottomSheet,
  } = useBottomSheet();

  const {
    BottomSheet: ReviewPasswordNoteBottomSheet,
    show: showReviewPasswordNoteBottomSheet,
  } = useBottomSheet();

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
          </View>

          <TouchableOpacity
            onPress={() => {
              show();
            }}
          >
            <Text size="h4" weight="normal" color="#DAB769">
              Share review password
            </Text>
          </TouchableOpacity>
        </View>

        <Text size="p" weight="normal" color="#A7A7A7">
          You have no reviews yet
        </Text>
      </View>
    </>
  );
};

export default NoReviewsOnMyProfile;

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  midRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

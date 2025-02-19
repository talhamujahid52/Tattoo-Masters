import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import Text from "./Text";
import { useRouter } from "expo-router";

interface ReviewOnProfileProps {
  isArtist?: boolean;
}

const ReviewOnProfile: React.FC<ReviewOnProfileProps> = ({
  isArtist = true,
}) => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.midRow}>
          <Text size="profileName" weight="semibold" color="#FBF6FA">
            Reviews
          </Text>
          <Image
            style={styles.icon}
            source={require("../assets/images/help.png")}
          />
        </View>
        {isArtist ? (
          <TouchableOpacity>
            <Text size="h4" weight="normal" color="#DAB769">
              Share review password
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              router.push("/artist/VerifyReviewPassword");
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
          4.8 (129 reviews)
        </Text>
      </View>
      <View style={styles.userProfileRow}>
        <View style={styles.pictureAndName}>
          <Image
            style={styles.profilePicture}
            source={require("../assets/images/Artist.png")}
          />
          <View>
            <Text size="p" weight="normal" color="#FFF">
              Martin Luis
            </Text>
            <Text size="medium" weight="normal" color="#A7A7A7">
              2 days ago
            </Text>
          </View>
        </View>
        <View style={[styles.midRow, { gap: 4 }]}>
          <Image
            style={styles.icon}
            source={require("../assets/images/star.png")}
          />
          <Text size="p" weight="normal" color="#FBF6FA">
            4.5
          </Text>
        </View>
      </View>
      <Text size="p" weight="normal" color="#A7A7A7">
        Lorem ipsum dolor sit amet, contetur itbj jbds adipiscing elit, sed do
        eiusmod tempor incididunt ut labore.
      </Text>
      <View style={styles.seprator}></View>
      <TouchableOpacity style={styles.bottomRow}>
        <Text size="h4" weight="normal" color="#FBF6FA">
          View all 129 reviews
        </Text>
        <Image
          style={styles.icon}
          source={require("../assets/images/rightArrow.png")}
        />
      </TouchableOpacity>
    </View>
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
    resizeMode: "contain",
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

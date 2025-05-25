import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import Text from "./Text";
import { useSelector } from "react-redux";
import { router } from "expo-router";

interface Review {
  rating?: any;
  tattooFeedback?: any;
  tattooImage?: any;
  isShownOnProfile?: boolean;
}

const Review: React.FC<Review> = ({
  rating,
  tattooFeedback,
  tattooImage,
  isShownOnProfile = false,
}) => {
  const loggedInUser = useSelector((state: any) => state?.user?.user); // get Loggedin User

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.profilePictureAndName}>
          <Image
            style={styles.profilePicture}
            source={
              loggedInUser?.profilePicture
                ? { uri: loggedInUser?.profilePicture }
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
              {loggedInUser?.name ? loggedInUser?.name : "Martin Luis"}
            </Text>
            <Text size="medium" weight="normal" color="#A7A7A7">
              1 min
            </Text>
          </View>
          <View style={styles.midRow}>
            <Image
              style={styles.icon}
              source={require("../assets/images/star.png")}
            />
            <Text size="p" weight="normal" color="#FBF6FA">
              {rating ? rating : "4.5"}
            </Text>
          </View>
        </View>

        {isShownOnProfile && (
          <TouchableOpacity
            onPress={() => {
              // router.back();
            }}
          >
            <Image
              style={styles.icon}
              source={require("../assets/images/report-flag.png")}
            />
          </TouchableOpacity>
        )}
      </View>

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 16,
        }}
      >
        <Text size="p" weight="normal" color="#A7A7A7" style={{ width: "70%" }}>
          {tattooFeedback}
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
              backgroundColor: "#202020",
            }}
            source={
              tattooImage
                ? { uri: tattooImage }
                : require("../assets/images/Artist.png")
            }
          />
        </View>
      </View>
    </View>
  );
};

export default Review;

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

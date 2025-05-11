import { StyleSheet, View, Image } from "react-native";
import React from "react";
import Text from "./Text";

const ReviewOnProfileBlur = () => {
  return (
    <>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Text size="profileName" weight="semibold" color="#FBF6FA">
            Reviews
          </Text>
        </View>
        <View
          style={{
            height: 19,
            width: 148,
            borderRadius: 6,
            backgroundColor: "#414140",
            marginBottom: 10,
          }}
        ></View>
        <View style={styles.userProfileRow}>
          <View style={styles.pictureAndName}>
            <View
              style={{
                height: 42,
                width: 42,
                borderRadius: 50,
                backgroundColor: "#4F4E4D",
              }}
            ></View>

            <View style={{ gap: 5 }}>
              <View
                style={{
                  height: 11,
                  width: 72,
                  borderRadius: 6,
                  backgroundColor: "#414140",
                }}
              ></View>
              <View
                style={{
                  height: 9,
                  width: 53,
                  borderRadius: 6,
                  backgroundColor: "#414140",
                }}
              ></View>
            </View>
          </View>
          <View style={[styles.midRow, { gap: 4 }]}>
            <Image
              style={styles.icon}
              source={require("../assets/images/star.png")}
            />
            <View
              style={{
                height: 11,
                width: 31,
                borderRadius: 6,
                backgroundColor: "#414140",
              }}
            ></View>
          </View>
        </View>
        <View style={{ gap: 5 }}>
          <View
            style={{
              height: 11,
              width: "100%",
              borderRadius: 6,
              backgroundColor: "#414140",
            }}
          ></View>
          <View
            style={{
              height: 11,
              width: "100%",
              borderRadius: 6,
              backgroundColor: "#414140",
            }}
          ></View>
          <View
            style={{
              height: 11,
              width: "30%",

              borderRadius: 6,
              backgroundColor: "#414140",
            }}
          ></View>
        </View>
      </View>
    </>
  );
};

export default ReviewOnProfileBlur;

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
});

import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";

const ArtistProfileCard = () => {
  return (
    <View
      style={{
        width: 131,
        height: 215,
      }}
    >
      <Image
        source={require("../assets/images/Artist.png")}
        style={{
          width: 131,
          height: 170,
          borderRadius: 12,
          resizeMode: "cover",
        }}
      />
      <View style={styles.RatingAndLocation}>
        <Image
          source={require("../assets/images/star.png")}
          style={{ height: 16, width: 16, resizeMode: "contain" }}
        />
        <Text style={styles.RatingText}> 4.8 (129)</Text>
        <View style={styles.SeparatorDot}></View>
        <Text style={styles.RatingText}>Phuket</Text>
      </View>
      <Text style={styles.ArtistName}>Martin Luis</Text>
    </View>
  );
};

export default ArtistProfileCard;

const styles = StyleSheet.create({
  RatingAndLocation: {
    marginTop: 8,
    marginBottom: 4,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  RatingText: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 14.32,
    color: "#FBF6FA",
  },
  SeparatorDot: {
    height: 3,
    width: 3,
    borderRadius: 3,
    backgroundColor: "#8F8F8F",
    marginHorizontal: 4,
  },
  ArtistName: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 16.71,
    color: "#FFFFFF",
  },
});

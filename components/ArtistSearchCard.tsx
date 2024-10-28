import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";

interface ArtistSearchCardProps {
  isActive: boolean;
}

const ArtistSearchCard = ({ isActive }: ArtistSearchCardProps) => {
  return (
    <View
      style={{
        width: "100%",
        height: 193,
        // backgroundColor: "green",
      }}
    >
      <Image
        source={require("../assets/images/Artist.png")}
        style={{
          width: "100%",
          height: 148,
          borderRadius: 12,
          resizeMode: "cover",
        }}
      />
      <View style={styles.RatingAndLocation}>
        {isActive && (
          <View
            style={{
              height: 8,
              width: 8,
              borderRadius: 8,
              backgroundColor: "#44E52C",
              marginRight: 5,
            }}
          />
        )}
        <Text style={styles.ArtistName} numberOfLines={1}>
          Martin Luis
        </Text>
      </View>
      <Text style={styles.TattooStyle}>Phuket</Text>
    </View>
  );
};

export default ArtistSearchCard;

const styles = StyleSheet.create({
  RatingAndLocation: {
    marginTop: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  ArtistName: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20.8,
    color: "#FFFFFF",
    width: 100,
  },
  TattooStyle: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 15.51,
    color: "#A7A7A7",
  },
});

import { StyleSheet, View, Image } from "react-native";
import Text from "./Text";
import React from "react";

interface ArtistSearchCardProps {
  isActive: boolean;
}

const ArtistSearchCard = ({ isActive }: ArtistSearchCardProps) => {
  return (
    <View style={styles.card}>
      <Image
        source={require("../assets/images/Artist.png")}
        style={styles.imageStyle}
      />
      <View style={styles.RatingAndLocation}>
        {isActive && <View style={styles.greenOnlineDot} />}
        <Text size="p" weight="semibold" color="#FFFFFF">
          Martin Luis
        </Text>
      </View>
      <Text size="medium" weight="normal" color="#A7A7A7">
        Ink Fusion
      </Text>
    </View>
  );
};

export default ArtistSearchCard;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 193,
  },
  imageStyle: {
    width: "100%",
    height: 148,
    borderRadius: 12,
    resizeMode: "cover",
  },
  greenOnlineDot: {
    height: 8,
    width: 8,
    borderRadius: 8,
    backgroundColor: "#44E52C",
    marginRight: 5,
  },
  RatingAndLocation: {
    marginTop: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
});

import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import Text from "./Text";
import { Image as ExpoImage } from "expo-image";
import React from "react";
import { useRouter } from "expo-router";

interface ArtistSearchCardProps {
  // isActive: boolean;
  artist: any;
}

const ArtistSearchCard = ({ artist }: ArtistSearchCardProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/artist/ArtistProfile",
          params: { artistId: artist.id },
        });
      }}
      style={styles.card}
    >
      <ExpoImage
        // source={require("../assets/images/Artist.png")}
        source={
          artist?.data?.profilePicture || artist?.data?.profilePictureSmall
            ? {
                uri:
                  artist?.data?.profilePictureSmall ??
                  artist?.data?.profilePicture,
              }
            : require("../assets/images/Artist.png")
        }
        style={styles.imageStyle}
        contentFit="cover"
        cachePolicy={"disk"}
      />
      <View style={styles.RatingAndLocation}>
        {/* {isActive && <View style={styles.greenOnlineDot} />} */}
        <Text size="p" weight="semibold" color="#FFFFFF">
          {artist?.data?.name ?? ""}
        </Text>
      </View>
      <Text size="medium" weight="normal" color="#A7A7A7">
        {artist?.data?.studio === "studio"
          ? artist?.data?.studioName
          : artist?.data?.studio === "freelancer"
          ? "Freelancer"
          : "Home artist"}
      </Text>
    </TouchableOpacity>
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
    borderRadius: 8,
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

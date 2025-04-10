import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import Text from "./Text";
import React from "react";
import { useRouter } from "expo-router";

interface ArtistProfileCardProps {
  artist: any;
}

const ArtistProfileCard: React.FC<ArtistProfileCardProps> = ({ artist }) => {
  const router = useRouter();
  const profilePicture =
    artist?.data?.profilePictureSmall ?? artist?.data?.profilePicture;
  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/artist/ArtistProfile",
          params: { artistId: artist.id },
        });
      }}
      style={{
        width: 131,
        height: 215,
      }}
    >
      <Image
        source={
          artist.data.profilePicture
            ? { uri: profilePicture }
            : require("../assets/images/Artist.png")
        }
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
        <Text size="small" weight="normal" color="#FBF6FA">
          {artist.data.rating ? Number(artist.data.rating).toFixed(1) : "4.8"} (
          {artist.data?.reviewsCount ? artist.data?.reviewsCount : "5"})
        </Text>
        <View style={styles.SeparatorDot}></View>
        <View style={{ flex: 1 }}>
          <Text
            size="small"
            weight="normal"
            color="#FBF6FA"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {artist.data.city ? artist.data.city : "Phuket"}
          </Text>
        </View>
      </View>
      <Text size="large" weight="medium" color="#FFFFFF">
        {artist.data.name ? artist.data.name : "Martin Luis"}
      </Text>
    </TouchableOpacity>
  );
};

export default ArtistProfileCard;

const styles = StyleSheet.create({
  RatingAndLocation: {
    marginTop: 8,
    marginBottom: 4,
    display: "flex",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
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

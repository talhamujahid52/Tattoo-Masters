import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import Text from "./Text";
import { Image as ExpoImage } from "expo-image";
import React from "react";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";

interface ArtistSearchCardProps {
  // isActive: boolean;
  artist: any;
}

const ArtistSearchCard = ({ artist }: ArtistSearchCardProps) => {
  const router = useRouter();
  const loggedInUser = useSelector((state: any) => state?.user?.user);

  return (
    <TouchableOpacity
      onPress={() => {
        if (artist?.data?.uid === loggedInUser?.uid) {
          router.push({
            pathname: "/artist/MyProfile",
            params: { artistId: artist.id },
          });
        } else {
          router.push({
            pathname: "/artist/ArtistProfile",
            params: { artistId: artist.id },
          });
        }
      }}
      style={styles.card}
    >
      <View style={{ height: 148, position: "relative" }}>
        <ExpoImage
          key={artist?.data?.profilePicture}
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
        {artist?.data?.originalArtistNumber && (
          <View style={styles.BottomLeftOverlay}>
            <ExpoImage
              cachePolicy={"disk"}
              source={require("../assets/images/originalArtist.png")}
              contentFit="cover"
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
              }}
            />
            <Text
              size="small"
              weight="normal"
              color="#FBF6FA"
              numberOfLines={1}
            >
              Original artist
            </Text>
          </View>
        )}
      </View>
      <View style={styles.RatingAndLocation}>
        {/* {isActive && <View style={styles.greenOnlineDot} />} */}
        <Text
          size="p"
          weight="semibold"
          color="#FFFFFF"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
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
  BottomLeftOverlay: {
    position: "absolute",
    bottom: 4,
    left: 4,
    borderRadius: 6,
    borderColor: "#00000029",
    borderWidth: 1,
    width: 105,
    height: 26,
    backgroundColor: "#000000C2",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    columnGap: 4,
  },
});

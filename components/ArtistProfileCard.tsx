import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import Text from "./Text";
import React from "react";
import { useRouter } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { useSelector } from "react-redux";

interface ArtistProfileCardProps {
  artist: any;
}

const ArtistProfileCard: React.FC<ArtistProfileCardProps> = ({ artist }) => {
  const router = useRouter();
  const profilePicture =
    artist?.data?.profilePictureSmall ?? artist?.data?.profilePicture;
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
      style={{
        width: 131,
        height: 215,
      }}
    >
      <View style={{ width: 131, height: 170, position: "relative" }}>
        <ExpoImage
          key={artist.data?.profilePicture}
          cachePolicy={"disk"}
          source={{ uri: profilePicture }}
          // source="https://picsum.photos/seed/696/3000/2000"
          contentFit="cover"
          style={{
            width: 131,
            height: 170,
            borderRadius: 12,
          }}
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

      <Text
        size="large"
        weight="medium"
        color="#FFFFFF"
        style={{ marginTop: 8 }}
      >
        {artist.data.name ? artist.data.name : ""}
      </Text>
      <View style={styles.RatingAndLocation}>
        {artist.data.rating && (
          <>
            <Image
              source={require("../assets/images/star.png")}
              style={{ height: 16, width: 16, resizeMode: "contain" }}
            />
            <Text size="small" weight="normal" color="#FBF6FA">
              {artist.data.rating ? Number(artist.data.rating).toFixed(1) : ""}
              {artist.data?.reviewsCount
                ? ` (${artist.data?.reviewsCount})`
                : ""}
            </Text>
            <View style={styles.SeparatorDot}></View>
          </>
        )}
        <View style={{ flex: 1 }}>
          <Text
            size="small"
            weight="normal"
            color="#FBF6FA"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {artist.data.city ? artist.data.city : ""}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(ArtistProfileCard);

const styles = StyleSheet.create({
  RatingAndLocation: {
    marginTop: 4,
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
  BottomLeftOverlay: {
    position: "absolute",
    bottom: 4,
    left: 4,
    borderRadius: 6,
    borderColor: "#00000029",
    borderWidth: 1,
    height: 26,
    backgroundColor: "#000000C2",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    columnGap: 4,
  },
});

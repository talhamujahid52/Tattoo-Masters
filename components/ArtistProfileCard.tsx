import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Text from "./Text";
import React from "react";
import { useRouter } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { useSelector } from "react-redux";
import Animated from "react-native-reanimated";
import { SKELETON_DIM_COLOR, useSkeletonPulse } from "./Skeleton";

const CARD_WIDTH = 131;
const CARD_HEIGHT = 215;
const IMAGE_HEIGHT = 170;

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
      style={styles.Card}
    >
      <View style={styles.ImageContainer}>
        <ExpoImage
          key={artist.data?.profilePicture}
          cachePolicy={"disk"}
          source={{ uri: profilePicture }}
          // source="https://picsum.photos/seed/696/3000/2000"
          contentFit="cover"
          style={styles.Image}
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

// Same box as the card: the image block, then one bar per text line. Each bar
// is centred on an invisible copy of the real text, so it sits exactly where
// the name and the rating/city line will render.
const ArtistProfileCardSkeleton = () => (
  <View style={styles.Card}>
    <View style={[styles.Image, styles.SkeletonFill]} />
    <View style={styles.SkeletonNameLine}>
      <Text size="large" weight="medium" color="transparent">
        {" "}
      </Text>
      <View style={[styles.SkeletonBar, { width: 84, height: 12 }]} />
    </View>
    <View style={styles.SkeletonMetaLine}>
      <Text size="small" weight="normal" color="transparent">
        {" "}
      </Text>
      <View style={[styles.SkeletonBar, { width: 56, height: 10 }]} />
    </View>
  </View>
);

// A screen-wide row of placeholder cards. `gap` is the spacing the real list
// uses between cards.
export const ArtistProfileCardSkeletonRow = ({ gap }: { gap: number }) => {
  const pulseStyle = useSkeletonPulse();
  const count = Math.ceil(
    Dimensions.get("window").width / (CARD_WIDTH + gap)
  );

  return (
    <Animated.View style={[{ flexDirection: "row", gap }, pulseStyle]}>
      {Array.from({ length: count }, (_, index) => (
        <ArtistProfileCardSkeleton key={index} />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  Card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  ImageContainer: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    position: "relative",
  },
  Image: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 12,
  },
  SkeletonFill: {
    backgroundColor: SKELETON_DIM_COLOR,
  },
  SkeletonNameLine: {
    marginTop: 8,
    justifyContent: "center",
  },
  SkeletonMetaLine: {
    marginTop: 4,
    // The real line is at least as tall as its 16px star icon
    minHeight: 16,
    justifyContent: "center",
  },
  SkeletonBar: {
    position: "absolute",
    left: 0,
    borderRadius: 4,
    backgroundColor: SKELETON_DIM_COLOR,
  },
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

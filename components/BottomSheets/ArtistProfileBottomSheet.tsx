import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
  Linking,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import Text from "@/components/Text";
import IconButton from "@/components/IconButton";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { selectFilter } from "@/redux/slices/filterSlices";
import useFollowArtist from "@/hooks/useFollowArtist";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type ArtistProfileBottomSheetProps = {
  hideMapProfileBottomSheet: () => void;
};
const ArtistProfileBottomSheet = ({
  hideMapProfileBottomSheet,
}: ArtistProfileBottomSheetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const insets = useSafeAreaInsets();
  const { currentlyViewingArtist } = useSelector(selectFilter);
  const userFirestore = useSelector((state: any) => state.user.userFirestore);
  const { toggleFollow, isFollowing } = useFollowArtist();
  const [isFollowingLocal, setIsFollowingLocal] = useState(false);

  const content = currentlyViewingArtist?.aboutYou
    ? currentlyViewingArtist.aboutYou
    : "No description available.";

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (currentlyViewingArtist?.id) {
      setIsFollowingLocal(isFollowing(currentlyViewingArtist.id));
    }
  }, [currentlyViewingArtist?.id, isFollowing]);

  const handleFavoritePress = async () => {
    if (!currentlyViewingArtist?.id) return;
    if (!userFirestore) {
      // No login UI here; do nothing for now
      return;
    }
    const next = !isFollowingLocal;
    setIsFollowingLocal(next);
    try {
      const result = await toggleFollow(currentlyViewingArtist.id);
      if (typeof result === "boolean" && result !== next) {
        setIsFollowingLocal(result);
      }
    } catch (e) {
      setIsFollowingLocal((prev) => !prev);
    }
  };

  const profilePicture = useMemo(() => {
    const profileSmall = currentlyViewingArtist?.profilePictureSmall;
    const profileDefault = currentlyViewingArtist?.profilePicture;
    return profileSmall
      ? { uri: profileSmall }
      : profileDefault
      ? { uri: profileDefault }
      : require("../../assets/images/Artist.png");
  }, [currentlyViewingArtist]);

  const handleOpenLink = async (url: string) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn("Can't open URL:", url);
      }
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.userProfileRow}>
        <View style={styles.pictureAndName}>
          <TouchableOpacity
            onPress={() => {
              hideMapProfileBottomSheet();
              router.push({
                pathname: "/artist/ArtistProfile",
                params: { artistId: currentlyViewingArtist?.id },
              });
            }}
          >
            <Image style={styles.profilePicture} source={profilePicture} />
          </TouchableOpacity>

          <View>
            <Text size="h3" weight="semibold" color="white">
              {currentlyViewingArtist?.name ? currentlyViewingArtist.name : ""}
            </Text>
            <Text size="p" weight="normal" color="#A7A7A7">
              {currentlyViewingArtist?.studio === "studio"
                ? currentlyViewingArtist?.studioName
                : currentlyViewingArtist?.studio === "freelancer"
                ? "Freelancer"
                : "Home artist"}
            </Text>
            <Text size="p" weight="normal" color="#A7A7A7">
              {currentlyViewingArtist?.city ? currentlyViewingArtist.city : ""}
            </Text>
          </View>
        </View>
        {/* <TouchableOpacity style={styles.moreIconContainer}>
          <Image
            style={styles.icon}
            source={require("../../assets/images/more_vert.png")}
          />
        </TouchableOpacity> */}
      </View>

      <View style={styles.userSocialsRow}>
        {currentlyViewingArtist?.facebookProfile && (
          <TouchableOpacity
            onPress={() =>
              handleOpenLink(currentlyViewingArtist?.facebookProfile)
            }
          >
            <Image
              style={styles.icon}
              source={require("../../assets/images/facebook_2.png")}
            />
          </TouchableOpacity>
        )}

        {currentlyViewingArtist?.instagramProfile && (
          <TouchableOpacity
            onPress={() =>
              handleOpenLink(currentlyViewingArtist?.instagramProfile)
            }
          >
            <Image
              style={styles.icon}
              source={require("../../assets/images/instagram.png")}
            />
          </TouchableOpacity>
        )}
        {currentlyViewingArtist?.twitterProfile && (
          <TouchableOpacity
            onPress={() =>
              handleOpenLink(currentlyViewingArtist?.twitterProfile)
            }
          >
            <Image
              style={styles.icon}
              source={require("../../assets/images/twitter.png")}
            />
          </TouchableOpacity>
        )}
      </View>

      <Pressable onPress={handleToggle}>
        <Text size="p" weight="normal" color="#A7A7A7">
          {isExpanded ? content : `${content?.slice(0, 100)}...`}
        </Text>
      </Pressable>

      <View style={styles.buttonRow}>
        <IconButton
          title={isFollowingLocal ? "Unfavorite" : "Favorite"}
          icon={
            <MaterialCommunityIcons
              name={isFollowingLocal ? "heart" : "heart-outline"}
              size={20}
              color="#22221F"
            />
          }
          iconStyle={{ height: 20, width: 20, resizeMode: "contain" }}
          variant="Secondary"
          onPress={handleFavoritePress}
        />
        <IconButton
          title="Message"
          icon={require("../../assets/images/message.png")}
          variant="Primary"
          onPress={() => {
            router.push({
              pathname: "/artist/IndividualChat",
              params: {
                selectedArtistId: currentlyViewingArtist?.id
                  ? currentlyViewingArtist.id
                  : "",
              },
            });
          }}
        />
      </View>
    </View>
  );
};

export default ArtistProfileBottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
    padding: 16,
  },
  userProfileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pictureAndName: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profilePicture: {
    height: 82,
    width: 82,
    resizeMode: "cover",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#202020",
  },
  icon: {
    height: 24,
    width: 24,
    resizeMode: "contain",
  },
  moreIconContainer: {
    justifyContent: "flex-start",
  },
  userSocialsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 16,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 24,
  },
});

import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";
import React, { useMemo, useState, useEffect } from "react";
import Text from "@/components/Text";
import IconButton from "@/components/IconButton";
import { router } from "expo-router";
import useGetArtist from "@/hooks/useGetArtist";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ArtistProfileBottomSheetProps {
  selectedArtistId: string;
}

const ArtistProfileBottomSheet = () => {
  const artist = useGetArtist(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const insets = useSafeAreaInsets();

  const content =
    artist?.data?.aboutYou ||
    "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.";

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const profilePicture = useMemo(() => {
    const profileSmall = artist?.data?.profilePictureSmall;
    const profileDefault = artist?.data?.profilePicture;
    if (profileSmall) {
      return { uri: profileSmall };
    } else if (profileDefault) {
      return { uri: profileDefault };
    }
    return require("../../assets/images/Artist.png");
  }, [artist]);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + 10 }}
      style={styles.container}
    >
      <View style={styles.userProfileRow}>
        <View style={styles.pictureAndName}>
          <Image style={styles.profilePicture} source={profilePicture} />
          <View>
            <Text size="h3" weight="semibold" color="white">
              {artist?.data?.name || "Martin Luis"}
            </Text>
            <Text size="p" weight="normal" color="#A7A7A7">
              {artist?.data?.studio?.name || "No Studio"}
            </Text>
            <Text size="p" weight="normal" color="#A7A7A7">
              {artist?.data?.city || "Oslo"}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreIconContainer}>
          <Image
            style={styles.icon}
            source={require("../../assets/images/more_vert.png")}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.userSocialsRow}>
        <TouchableOpacity>
          <Image
            style={styles.icon}
            source={require("../../assets/images/facebook_2.png")}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            style={styles.icon}
            source={require("../../assets/images/instagram.png")}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            style={styles.icon}
            source={require("../../assets/images/twitter.png")}
          />
        </TouchableOpacity>
      </View>

      <Pressable onPress={handleToggle}>
        <Text size="p" weight="normal" color="#A7A7A7">
          {isExpanded ? content : `${content.slice(0, 100)}...`}
        </Text>
      </Pressable>

      <View style={styles.buttonRow}>
        <IconButton
          title="Favorite"
          icon={require("../../assets/images/favorite-black.png")}
          iconStyle={{ height: 20, width: 20, resizeMode: "contain" }}
          variant="Secondary"
          onPress={() => {}}
        />
        <IconButton
          title="Message"
          icon={require("../../assets/images/message.png")}
          variant="Primary"
        //   onPress={() => {
        //     router.push({
        //       pathname: "/artist/IndividualChat",
        //       params: { selectedArtistId },
        //     });
        //   }}
        />
      </View>
    </ScrollView>
  );
};

export default ArtistProfileBottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
    borderTopWidth: 0.33,
    borderColor: "#2D2D2D",
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

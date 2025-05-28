import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";
import React, { useMemo, useState } from "react";
import Text from "@/components/Text";
import IconButton from "@/components/IconButton";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { selectFilter } from "@/redux/slices/filterSlices";

type ArtistProfileBottomSheetProps = {
  hideMapProfileBottomSheet: () => void;
};
const ArtistProfileBottomSheet = ({
  hideMapProfileBottomSheet,
}: ArtistProfileBottomSheetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const insets = useSafeAreaInsets();
  const { currentlyViewingArtist } = useSelector(selectFilter);

  const content = currentlyViewingArtist?.aboutYou
    ? currentlyViewingArtist.aboutYou
    : "No description available.";

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
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

  return (
    <View style={styles.container}>
      <View style={styles.userProfileRow}>
        <View style={styles.pictureAndName}>
          <Image style={styles.profilePicture} source={profilePicture} />
          <View>
            <TouchableOpacity
              onPress={() => {
                hideMapProfileBottomSheet();
                router.push({
                  pathname: "/artist/ArtistProfile",
                  params: { artistId: currentlyViewingArtist?.id },
                });
              }}
            >
              <Text size="h3" weight="semibold" color="white">
                {currentlyViewingArtist?.name
                  ? currentlyViewingArtist.name
                  : ""}
              </Text>
            </TouchableOpacity>
            <Text size="p" weight="normal" color="#A7A7A7">
              {currentlyViewingArtist?.studio === "studio"
                ? currentlyViewingArtist?.studioName
                : currentlyViewingArtist?.studio === "freelancer"
                ? "Freelancer"
                : "HomeArtist"}
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
          {isExpanded ? content : `${content?.slice(0, 100)}...`}
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

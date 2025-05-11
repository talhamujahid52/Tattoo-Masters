import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Pressable,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import Text from "@/components/Text";
import IconButton from "@/components/IconButton";
import ReviewOnProfile from "@/components/ReviewOnProfile";
import ImageGallery from "@/components/ImageGallery";
import ShareArtistProfileBottomSheet from "@/components/BottomSheets/ShareArtistProfileBottomSheet";
import ReportBottomSheet from "@/components/BottomSheets/ReportBottomSheet";
import { router, useLocalSearchParams } from "expo-router";
import useBottomSheet from "@/hooks/useBottomSheet";
import MapView, { Region, PROVIDER_GOOGLE } from "react-native-maps";
import useGetArtist from "@/hooks/useGetArtist";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTypesense from "@/hooks/useTypesense";
import ReviewOnProfileBlur from "@/components/ReviewOnProfileBlur";
import LoginBottomSheet from "@/components/BottomSheets/LoginBottomSheet";

interface StudioItem {
  title: string;
  value: number;
  selected: boolean;
}
const options = [
  { label: "Inappropriate account", value: "Inappropriate account" },
  { label: "Impersonation", value: "Impersonation" },
  { label: "Fake Account", value: "Fake Account" },
  { label: "Other", value: "Other" },
];

const ArtistProfile = () => {
  const {
    BottomSheet: ShareSheet,
    show: showShareSheet,
    hide: hideShareSheet,
  } = useBottomSheet();
  const {
    BottomSheet: ReportSheet,
    show: showReportSheet,
    hide: hideReportSheet,
  } = useBottomSheet();
  const {
    BottomSheet: LoggingInBottomSheet,
    show: showLoggingInBottomSheet,
    hide: hideLoggingInBottomSheet,
  } = useBottomSheet();

  const { artistId } = useLocalSearchParams<any>();
  const artist = useGetArtist(artistId);
  console.log("Artist is: ", artist);
  const [isExpanded, setIsExpanded] = useState(false);
  const content =
    artist?.data?.aboutYou ||
    "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.";

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const insets = useSafeAreaInsets();
  const defaultLocation = {
    latitude: 33.664286,
    longitude: 73.004291,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  // const [region, setRegion] = useState<Region>({
  //   latitude: defaultLocation.latitude,
  //   longitude: defaultLocation.longitude,
  //   latitudeDelta: defaultLocation.latitudeDelta,
  //   longitudeDelta: defaultLocation.longitudeDelta,
  // });

  const region = {
    latitude: artist?.data?.location?.latitude || defaultLocation.latitude,
    longitude: artist?.data?.location?.longitude || defaultLocation.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const [studio, setStudio] = useState<StudioItem[]>([
    { title: "Studio", value: 1, selected: false },
    { title: "Freelancer", value: 2, selected: false },
    { title: "Home Artist", value: 3, selected: false },
  ]);

  const toggleStudio = (value: number) => {
    const updatedstudio = studio.map((item) =>
      item.value === value ? { ...item, selected: !item.selected } : item
    );

    setStudio(updatedstudio);
  };
  const profilePicture = useMemo(() => {
    const profileSmall = artist?.data?.profilePictureSmall;
    const profileDefault = artist?.data?.profilePicture;
    if (profileSmall) {
      return { uri: profileSmall };
    } else if (artist?.data?.profilePicture) {
      return { uri: profileDefault };
    }

    return require("../../assets/images/Artist.png");
  }, [artist]);

  const renderItem = ({ item }: { item: StudioItem }) => (
    <TouchableOpacity
      key={item.value}
      activeOpacity={1}
      style={{
        padding: 6,
        borderRadius: 6,
        backgroundColor: item.selected ? "#DAB769" : "#262526",
      }}
      onPress={() => toggleStudio(item.value)} // Toggle selected state on press
    >
      <Text
        style={{
          color: item.selected ? "#22221F" : "#A7A7A7",
        }}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const publicationsTs = useTypesense();

  // Function to fetch publications on button click
  const handleFetchPublications = async () => {
    try {
      // Triggering the publication search when the button is clicked
      const hits = await publicationsTs.search({
        collection: "publications", // Your collection name
        query: artistId, // You can adjust the query here
        queryBy: "userId", // Modify according to your schema
      });

      // Update the state with the fetched publications (assuming it's stored in a state)
      console.log("Fetched Publications: ", hits);

      // Set the fetched publications to a state to display
      // Assuming publications state is defined below
      // setPublications(hits);
    } catch (err) {
      console.error("Error fetching publications:", err);
    }
  };

  useEffect(() => {
    // handleFetchPublications();
  }, [artistId]);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + 10 }}
      style={styles.container}
    >
      <LoggingInBottomSheet
        InsideComponent={
          <LoginBottomSheet hideLoginBottomSheet={hideLoggingInBottomSheet} />
        }
      />
      <ShareSheet
        InsideComponent={
          <ShareArtistProfileBottomSheet
            showLoginBottomSheet={showLoggingInBottomSheet}
            hideShareSheet={hideShareSheet}
            showReportSheet={showReportSheet}
          />
        }
      />

      <ReportSheet
        InsideComponent={
          <ReportBottomSheet
            hideReportSheet={hideReportSheet}
            title="User"
            options={options}
            reportItem={artistId}
          />
        }
      />

      <View style={styles.userProfileRow}>
        <View style={styles.pictureAndName}>
          <Image
            style={styles.profilePicture}
            source={profilePicture}
            // source={require("../../assets/images/Artist.png")}
          />
          <View>
            <Text size="h3" weight="semibold" color="white">
              {artist?.data?.name ? artist?.data?.name : ""}
            </Text>
            <Text size="p" weight="normal" color="#A7A7A7">
              {artist?.data?.studio === "studio"
                ? artist?.data?.studioName
                : artist?.data?.studio === "freelancer"
                ? "Freelancer"
                : "HomeArtist"}
            </Text>
            <Text size="p" weight="normal" color="#A7A7A7">
              {artist?.data?.city ? artist?.data?.city : "Oslo"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            showShareSheet();
          }}
          style={styles.moreIconContainer}
        >
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
      <View style={styles.artistFavoriteRow}>
        <Image
          style={styles.icon}
          source={require("../../assets/images/favorite-white.png")}
        />
        <Text size="p" weight="normal" color="#FBF6FA">
          {artist?.data?.followersCount ? artist?.data?.followersCount : 0}
        </Text>
      </View>
      <View style={styles.tattooStylesRow}>
        <Image
          style={styles.icon}
          source={require("../../assets/images/draw.png")}
        />
        {artist?.data?.tattooStyles?.map((item: any, idx: any) => {
          return (
            <View
              key={idx}
              style={{
                backgroundColor: "#262526",
                paddingHorizontal: 5,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text size="p" weight="normal" color="#D7D7C9">
                {item}
              </Text>
            </View>
          );
        })}
      </View>
      <Pressable onPress={handleToggle}>
        <Text size="p" weight="normal" color="#A7A7A7">
          {isExpanded ? content : `${content.slice(0, 100)}...`}{" "}
          {/* Show a snippet or full content */}
        </Text>
      </Pressable>

      <View style={styles.buttonRow}>
        <IconButton
          title="Favorite"
          icon={require("../../assets/images/favorite-black.png")}
          iconStyle={{
            height: 20,
            width: 20,
            resizeMode: "contain",
          }}
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
              params: { selectedArtistId: artistId },
            });
          }}
        />
      </View>
      {artist?.data?.latestReview ? (
        <ReviewOnProfile ArtistId={artistId} />
      ) : (
        <ReviewOnProfileBlur />
      )}

      <View style={{ marginTop: 24 }}>
        <Text
          size="h4"
          weight="semibold"
          color="white"
          style={{ marginBottom: 10 }}
        >
          Location
        </Text>
        <Text
          size="medium"
          weight="normal"
          color="#A7A7A7"
          style={{ marginBottom: 10 }}
        >
          {artist?.data?.address ? artist?.data?.address : ""}
        </Text>
      </View>
      <View
        style={{
          height: 130,
          borderRadius: 20,
          overflow: "hidden",
          marginTop: 8,
        }}
      >
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          mapType="terrain"
          region={region}
          zoomEnabled={false}
        ></MapView>
      </View>
      <Text size="h4" weight="semibold" color="white" style={{ marginTop: 24 }}>
        Portfolio
      </Text>
      <View style={styles.stylesFilterRow}>
        <FlatList
          data={studio}
          renderItem={renderItem}
          keyExtractor={(item) => item.value.toString()}
          horizontal={true}
          contentContainerStyle={{ gap: 10 }}
        />
      </View>
      <ImageGallery></ImageGallery>
    </ScrollView>
  );
};

export default ArtistProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
    borderTopWidth: 0.33,
    borderColor: "#2D2D2D",
  },
  userProfileRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pictureAndName: {
    display: "flex",
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
    height: 20,
    width: 20,
    resizeMode: "contain",
  },
  moreIconContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  userSocialsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 16,
  },
  artistFavoriteRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tattooStylesRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  buttonRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  stylesFilterRow: {
    marginTop: 16,
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Makes the map take up the entire screen
  },
});

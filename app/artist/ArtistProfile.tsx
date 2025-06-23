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
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import useGetArtist from "@/hooks/useGetArtist";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTypesense from "@/hooks/useTypesense";
import NoReviews from "@/components/NoReviews";
import LoginBottomSheet from "@/components/BottomSheets/LoginBottomSheet";

interface StyleItem {
  title: string;
  count: number;
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
  const [isExpanded, setIsExpanded] = useState(false);
  const content = artist?.data?.aboutYou;
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

  const region = {
    latitude: artist?.data?.location?.latitude || defaultLocation.latitude,
    longitude: artist?.data?.location?.longitude || defaultLocation.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
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

  const publicationsTs = useTypesense();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [styleFilters, setStyleFilters] = useState<StyleItem[]>([]);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await publicationsTs.search({
          collection: "publications",
          query: artistId,
          queryBy: "userId",
        });
        setSearchResults(response || []);
      } catch (error) {
        console.error("Error fetching publications:", error);
      }
    };

    fetchPublications();
  }, [artistId]);

  useEffect(() => {
    if (!searchResults.length) {
      setStyleFilters([]);
      return;
    }

    const styleCountMap: Record<string, number> = {};
    searchResults.forEach((doc) => {
      if (Array.isArray(doc.document.styles)) {
        doc.document.styles.forEach((style) => {
          styleCountMap[style] = (styleCountMap[style] || 0) + 1;
        });
      }
    });

    const stylesArray: StyleItem[] = [
      {
        title: "All",
        count: searchResults.length,
        selected: true, // Default selection
      },
      ...Object.entries(styleCountMap).map(([title, count]) => ({
        title,
        count,
        selected: false,
      })),
    ];

    setStyleFilters(stylesArray);
  }, [searchResults]);

  const toggleStyleFilter = (title: string) => {
    setStyleFilters((prevFilters) =>
      prevFilters.map((item) => ({
        ...item,
        selected: item.title === title,
      }))
    );
  };

  const filteredResults = useMemo(() => {
    const selectedFilter = styleFilters.find((item) => item.selected);
    if (!selectedFilter || selectedFilter.title === "All") return searchResults;

    return searchResults.filter(
      (doc) =>
        Array.isArray(doc.document.styles) &&
        doc.document.styles.includes(selectedFilter.title)
    );
  }, [searchResults, styleFilters]);

  const renderItem = ({ item }: { item: StyleItem }) => (
    <TouchableOpacity
      key={item.title}
      activeOpacity={1}
      style={{
        padding: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: item.selected ? "#DAB769" : "#262526",
        flexDirection: "row",
        alignItems: "center",
      }}
      onPress={() => toggleStyleFilter(item.title)}
    >
      {item.title !== "All" && (
        <Text
          style={{
            color: item.selected ? "#22221F" : "#A7A7A7",
            marginLeft: 6,
          }}
        >
          {item.count}
        </Text>
      )}
      <Text
        style={{
          color: item.selected ? "#22221F" : "#A7A7A7",
          marginLeft: item.title !== "All" ? 4 : 0, // spacing adjustment
        }}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const googleDarkModeStyle = [
    { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
    {
      featureType: "administrative.country",
      elementType: "geometry.stroke",
      stylers: [{ color: "#4b6878" }],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "labels.text.fill",
      stylers: [{ color: "#64779e" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6f9ba5" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry.fill",
      stylers: [{ color: "#023e58" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#3C7680" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#304a7d" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#98a5be" }],
    },
    {
      featureType: "transit",
      elementType: "labels.text.fill",
      stylers: [{ color: "#98a5be" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0e1626" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#4e6d70" }],
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + 10 }}
      style={styles.container}
    >
      {/* BottomSheets */}
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
          <Image style={styles.profilePicture} source={profilePicture} />
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
              height: "100%",
              paddingVertical: 5,
            }}
          >
            <Text size="h3" weight="semibold" color="white">
              {artist?.data?.name || ""}
            </Text>
            <Text size="p" weight="normal" color="#A7A7A7">
              {artist?.data?.studio === "studio"
                ? artist?.data?.studioName
                : artist?.data?.studio === "freelancer"
                ? "Freelancer"
                : "HomeArtist"}
            </Text>
            <Text size="p" weight="normal" color="#A7A7A7">
              {artist?.data?.city || ""}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={showShareSheet}
          style={styles.moreIconContainer}
        >
          <Image
            style={styles.icon}
            source={require("../../assets/images/more_vert.png")}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.userSocialsRow}>
        {artist?.data?.facebookProfile && (
          <TouchableOpacity>
            <Image
              style={styles.icon}
              source={require("../../assets/images/facebook_2.png")}
            />
          </TouchableOpacity>
        )}
        {artist?.data?.instagramProfile && (
          <TouchableOpacity>
            <Image
              style={styles.icon}
              source={require("../../assets/images/instagram.png")}
            />
          </TouchableOpacity>
        )}
        {artist?.data?.twitterProfile && (
          <TouchableOpacity>
            <Image
              style={styles.icon}
              source={require("../../assets/images/twitter.png")}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.artistFavoriteRow}>
        <Image
          style={styles.icon}
          source={require("../../assets/images/favorite-white.png")}
        />
        <Text size="p" weight="normal" color="#FBF6FA">
          {artist?.data?.followersCount || "Not favourited yet"}
        </Text>
      </View>
      <View style={styles.tattooStylesRow}>
        <Image
          style={styles.icon}
          source={require("../../assets/images/draw.png")}
        />
        {artist?.data?.tattooStyles?.map((item: any, idx: number) => (
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
        ))}
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
          onPress={() =>
            router.push({
              pathname: "/artist/IndividualChat",
              params: { selectedArtistId: artistId },
            })
          }
        />
      </View>
      {artist?.data?.latestReview ? (
        <ReviewOnProfile ArtistId={artistId} />
      ) : (
        <NoReviews ArtistId={artistId} />
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
          size="large"
          weight="normal"
          color="#A7A7A7"
          style={{ marginBottom: 10 }}
        >
          {artist?.data?.address || ""}
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
          customMapStyle={googleDarkModeStyle}
          scrollEnabled={false}
          style={styles.map}
          mapType="standard"
          region={region}
          zoomEnabled={false}
        />
      </View>
      <Text size="h4" weight="semibold" color="white" style={{ marginTop: 24 }}>
        Portfolio
      </Text>
      <View style={styles.stylesFilterRow}>
        <FlatList
          data={styleFilters}
          renderItem={renderItem}
          keyExtractor={(item) => item.title}
          horizontal={true}
          contentContainerStyle={{ gap: 10 }}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <ImageGallery images={filteredResults} />
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
    borderColor: "#282828",
  },
  userProfileRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 82,
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
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#202020",
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

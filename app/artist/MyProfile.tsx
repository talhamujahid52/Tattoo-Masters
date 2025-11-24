import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Pressable,
  Linking,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import Text from "@/components/Text";
import IconButton from "@/components/IconButton";
import ReviewOnProfile from "@/components/ReviewOnProfile";
import ImageGallery from "@/components/ImageGallery";
import FilterBottomSheet from "@/components/BottomSheets/FilterBottomSheet";
import ShareProfileBottomSheet from "@/components/BottomSheets/ShareProfileBottomSheet";
import { useRouter, useLocalSearchParams } from "expo-router";
import useBottomSheet from "@/hooks/useBottomSheet";
import { useDispatch, useSelector } from "react-redux";
import { UserFirestore } from "@/types/user";
import useTypesense from "@/hooks/useTypesense";
import ReviewOnProfileBlur from "@/components/ReviewOnProfileBlur";
import NoReviewsOnMyProfile from "@/components/NoReviewsOnMyProfile";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ProfilePicturePreview from "@/components/ProfilePicturePreview";

interface StyleItem {
  title: string;
  count: number;
  selected: boolean;
}

const MyProfile = () => {
  const router = useRouter();
  const { BottomSheet, show, hide } = useBottomSheet();
  const loggedInUser: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore
  );

  const myId = loggedInUser?.uid;

  // console.log("My Profile : ", loggedInUser);
  // console.log("LoggedIn User Id: ", loggedInUser?.uid);

  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [styleFilters, setStyleFilters] = useState<StyleItem[]>([]);
  const [showAllUserStyles, setShowAllUserStyles] = useState(false);

  const content =
    loggedInUser?.aboutYou ||
    "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.";

  const handleToggle = () => {
    setIsExpanded(!isExpanded); // Toggle the state
  };

  const toggleStyleFilter = (title: string) => {
    setStyleFilters((prevFilters) =>
      prevFilters.map((item) => ({
        ...item,
        selected: item.title === title,
      }))
    );
  };

  const renderItem = ({ item }: { item: StyleItem }) => (
    <TouchableOpacity
      key={item.title}
      activeOpacity={1}
      style={{
        padding: 6,
        paddingHorizontal: 8,
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
            // marginLeft: 6,
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

  const publicationsTs = useTypesense();

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await publicationsTs.search({
          collection: "publications",
          query: myId,
          queryBy: "userId",
        });
        setSearchResults(response || []);
      } catch (error) {
        console.error("Error fetching publications:", error);
      }
    };

    fetchPublications();
  }, [myId]);

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

  const filteredResults = useMemo(() => {
    const selectedFilter = styleFilters.find((item) => item.selected);
    if (!selectedFilter || selectedFilter.title === "All") return searchResults;

    return searchResults.filter(
      (doc) =>
        Array.isArray(doc.document.styles) &&
        doc.document.styles.includes(selectedFilter.title)
    );
  }, [searchResults, styleFilters]);

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
    <ScrollView style={styles.container}>
      <BottomSheet
        InsideComponent={<ShareProfileBottomSheet hide={hide} myId={myId} />}
      />
      <View style={{ paddingHorizontal: 16 }}>
        <View style={styles.userProfileRow}>
          <View style={styles.pictureAndName}>
            {/* <Image
              style={styles.profilePicture}
              source={{
                uri:
                  loggedInUser?.profilePictureSmall ??
                  loggedInUser?.profilePicture,
              }}
            /> */}
            <ProfilePicturePreview
              imageSource={{
                uri:
                  loggedInUser?.profilePictureSmall ??
                  loggedInUser?.profilePicture,
              }}
              imageStyle={styles.profilePicture}
            />
            <View>
              <Text size="h3" weight="semibold" color="white">
                {loggedInUser?.name ?? ""}
              </Text>
              <Text size="p" weight="normal" color="#A7A7A7">
                {loggedInUser?.studio === "studio"
                  ? loggedInUser?.studioName
                  : loggedInUser?.studio === "freelancer"
                  ? "Freelancer"
                  : "Home artist"}
              </Text>
              <Text size="p" weight="normal" color="#A7A7A7">
                {loggedInUser?.city ?? ""}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              show();
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
          {loggedInUser?.facebookProfile && (
            <TouchableOpacity
              onPress={() => {
                handleOpenLink(loggedInUser.facebookProfile);
              }}
            >
              <Image
                style={styles.icon}
                source={require("../../assets/images/facebook_2.png")}
              />
            </TouchableOpacity>
          )}
          {loggedInUser?.instagramProfile && (
            <TouchableOpacity
              onPress={() => handleOpenLink(loggedInUser.instagramProfile)}
            >
              <Image
                style={styles.icon}
                source={require("../../assets/images/instagram.png")}
              />
            </TouchableOpacity>
          )}
          {loggedInUser?.twitterProfile && (
            <TouchableOpacity
              onPress={() => handleOpenLink(loggedInUser.twitterProfile)}
            >
              <Image
                style={styles.icon}
                source={require("../../assets/images/twitter.png")}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.artistFavoriteRow}>
          <MaterialCommunityIcons name="heart" size={20} color="#FBF6FA" />

          {loggedInUser?.followersCount ? (
            <Text size="p" weight="normal" color="#FBF6FA">
              {loggedInUser?.followersCount}
            </Text>
          ) : (
            <View
              style={{
                height: 11,
                width: 31,
                borderRadius: 6,
                backgroundColor: "#2D2D2D",
              }}
            ></View>
          )}
        </View>
        <View style={styles.tattooStylesRow}>
          <Image
            style={styles.icon}
            source={require("../../assets/images/draw.png")}
          />
          {loggedInUser?.tattooStyles && (
            <>
              {(showAllUserStyles
                ? loggedInUser?.tattooStyles
                : loggedInUser?.tattooStyles.slice(0, 6)
              ).map((item: any, idx: number) => (
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

              {loggedInUser?.tattooStyles?.length > 6 && (
                <TouchableOpacity
                  onPress={() => setShowAllUserStyles((prev) => !prev)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                  }}
                >
                  <Text size="p" weight="normal" color="#FBF6FA">
                    {showAllUserStyles ? "See less" : "See more"}
                  </Text>
                  <View style={{ width: 20, height: 20, marginLeft: 4 }}>
                    <Image
                      style={{
                        width: "100%",
                        height: "100%",
                        transform: [
                          { rotate: showAllUserStyles ? "180deg" : "0deg" },
                        ],
                      }}
                      source={require("../../assets/images/arrow_down.png")}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
        {/* <Text size="p" weight="normal" color="#A7A7A7">
        {loggedInUser?.aboutYou ?? ""}
      </Text> */}
        <Pressable onPress={handleToggle}>
          <Text size="p" weight="normal" color="#A7A7A7">
            {isExpanded || content?.length <= 120
              ? content
              : `${content?.slice(0, 160)}...`}
          </Text>
        </Pressable>
        <View style={styles.buttonRow}>
          <IconButton
            title="Edit profile"
            icon={require("../../assets/images/edit.png")}
            variant="Primary"
            onPress={() => {
              router.push({
                pathname: "/artist/EditProfile",
              });
            }}
          />
          <IconButton
            title="Add tattoo"
            icon={require("../../assets/images/add_photo_alternate-2.png")}
            variant="Primary"
            onPress={() => {
              router.push("/artist/AddTattoo");
            }}
          />
        </View>
        {loggedInUser?.latestReview ? (
          <ReviewOnProfile ArtistId={myId} isMyProfile={true} />
        ) : (
          <NoReviewsOnMyProfile />
        )}
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
      </View>
      <View style={{ paddingBottom: 60 }}>
        <ImageGallery images={filteredResults}></ImageGallery>
      </View>
    </ScrollView>
  );
};

export default MyProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 16,
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
    flexWrap: "wrap",
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
    marginTop: 24,
    marginBottom: 16,
  },
});

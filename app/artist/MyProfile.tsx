import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Pressable,
} from "react-native";
import React, { useState, useEffect } from "react";
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

interface StudioItem {
  title: string;
  value: number;
  selected: boolean;
}

const MyProfile = () => {
  const router = useRouter();
  const { BottomSheet, show, hide } = useBottomSheet();
  const loggedInUser: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore,
  );

  const myId = loggedInUser?.uid;

  console.log("LoggedIn User : ", loggedInUser);
  console.log("LoggedIn User Id: ", loggedInUser?.uid);

  const [isExpanded, setIsExpanded] = useState(false);
  const content =
    loggedInUser?.aboutYou ||
    "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.";

  const handleToggle = () => {
    setIsExpanded(!isExpanded); // Toggle the state
  };

  const [studio, setStudio] = useState<StudioItem[]>([
    { title: "Studio", value: 1, selected: false },
    { title: "Freelancer", value: 2, selected: false },
    { title: "Home Artist", value: 3, selected: false },
  ]);

  const toggleStudio = (value: number) => {
    const updatedstudio = studio.map((item) =>
      item.value === value ? { ...item, selected: !item.selected } : item,
    );

    setStudio(updatedstudio);
  };

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

  const handleFetchPublications = async () => {
    try {
      // Triggering the publication search when the button is clicked
      const hits = await publicationsTs.search({
        collection: "publications", // Your collection name
        query: myId, // You can adjust the query here
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
    publicationsTs.search({
      collection: "publications", // Your collection name
      query: myId, // You can adjust the query here
      queryBy: "userId", // Modify according to your schema
    });
    // handleFetchPublications();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <BottomSheet InsideComponent={<ShareProfileBottomSheet hide={hide} />} />

      <View style={styles.userProfileRow}>
        <View style={styles.pictureAndName}>
          <Image
            style={styles.profilePicture}
            source={{
              uri:
                loggedInUser?.profilePictureSmall ??
                loggedInUser?.profilePicture,
            }}
          />
          <View>
            <Text size="h3" weight="semibold" color="white">
              {loggedInUser?.name ?? ""}
            </Text>
            <Text size="p" weight="normal" color="#A7A7A7">
              {loggedInUser.studioName ?? ""}
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
        <TouchableOpacity onPress={() => {}}>
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
        {loggedInUser?.tattooStyles?.map((item: any, idx: any) => {
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
      {/* <Text size="p" weight="normal" color="#A7A7A7">
        {loggedInUser?.aboutYou ?? ""}
      </Text> */}
      <Pressable onPress={handleToggle}>
        <Text size="p" weight="normal" color="#A7A7A7">
          {isExpanded ? content : `${content?.slice(0, 100)}...`}{" "}
          {/* Show a snippet or full content */}
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
        <ReviewOnProfile isMyProfile={true} />
      ) : (
        <ReviewOnProfileBlur />
      )}
      <View style={styles.stylesFilterRow}>
        <FlatList
          data={studio}
          renderItem={renderItem}
          keyExtractor={(item) => item.value.toString()}
          horizontal={true}
          contentContainerStyle={{ gap: 10 }}
        />
      </View>
      <ImageGallery images={publicationsTs.results}></ImageGallery>
    </ScrollView>
  );
};

export default MyProfile;

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

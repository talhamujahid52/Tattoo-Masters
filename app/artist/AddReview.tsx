import React, { useState, useMemo, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Text from "@/components/Text";
import Rating from "@/components/Rating";
import Button from "@/components/Button";
import { useLocalSearchParams } from "expo-router";
import useGetArtist from "@/hooks/useGetArtist";
import StylesBottomSheet from "@/components/BottomSheets/StylesBottomSheet";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Input from "@/components/Input";
import firestore from "@react-native-firebase/firestore";
import useBottomSheet from "@/hooks/useBottomSheet";

const AddReview = () => {
  const insets = useSafeAreaInsets();
  const { artistId } = useLocalSearchParams();
  const artist = useGetArtist(artistId);

  const profilePicture = useMemo(() => {
    const profileSmall = artist?.data?.profilePictureSmall;
    const profileDefault = artist?.data?.profilePicture;
    if (profileSmall) {
      return { uri: profileSmall };
    } else if (artist?.data?.profilePicture) {
      return { uri: profileDefault };
    }

    return require("../../assets/images/Artist.png");
  }, [artistId]);

  // State hooks
  const [overallRating, setOverallRating] = useState<number>(0);
  const [qualityOfTattoo, setQualityOfTattoo] = useState<number>(0);
  const [tattooAsImagined, setTattooAsImagined] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [attachment, setAttachment] = useState<string | null>("");
  const [hashtags, setHashtags] = useState<string>("");

  // Tattoo styles state and toggling function
  const [tattooStyles, setTattooStyles] = useState<
    { title: string; selected: boolean }[]
  >([]);
  const [selectedTattooStyles, setSelectedTattooStyles] = useState<
    { title: string; selected: boolean }[]
  >([]);

  const toggleTattooStyles = (tattooStyle: {
    title: string;
    selected: boolean;
  }) => {
    const updatedTattooStyles = tattooStyles.map((item) =>
      item.title === tattooStyle.title
        ? { ...item, selected: !item.selected }
        : item
    );
    setTattooStyles(updatedTattooStyles);
    const selectedTattooStyles = updatedTattooStyles.filter(
      (item) => item.selected
    );
    setSelectedTattooStyles(selectedTattooStyles);
  };

  // Handle image selection
  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: 1,
    });

    if (!result.didCancel && result.assets && result.assets[0].uri) {
      setAttachment(result.assets[0].uri);
    }
  };

  const isFormComplete =
    overallRating > 0 &&
    qualityOfTattoo > 0 &&
    tattooAsImagined > 0 &&
    feedback.trim().length > 0 &&
    attachment &&
    selectedTattooStyles.length > 0;

  const {
    BottomSheet: TattooStylesSheet,
    show: showTattooStylesSheet,
    hide: hideTattooStylesSheet,
  } = useBottomSheet();

  useEffect(() => {
    const fetchTattooStyles = async () => {
      try {
        const doc = await firestore()
          .collection("Configurations")
          .doc("TattooStyles")
          .get();

        const data = doc.data();
        if (data?.styles && Array.isArray(data.styles)) {
          // Ensure "selected" is set to false
          const formattedStyles = data.styles.map((style: any) => ({
            title: style.title,
            selected: false,
          }));
          setTattooStyles(formattedStyles);
        }
      } catch (error) {
        console.error("Error fetching tattoo styles:", error);
      }
    };

    fetchTattooStyles();
  }, []);

  const setSelectedTattooStylesinBottomSheet = (
    updatedStyles: { title: string; selected: boolean }[]
  ) => {
    setTattooStyles(updatedStyles);
    const selected = updatedStyles.filter((item) => item.selected);
    setSelectedTattooStyles(selected);
  };

  // Render content
  return (
    <KeyboardAwareScrollView
      style={[styles.container, { marginBottom: insets.bottom + 16 }]}
      contentContainerStyle={styles.scrollViewContent}
    >
      <TattooStylesSheet
        InsideComponent={
          <StylesBottomSheet
            tattooStyles={tattooStyles}
            setSelectedTattooStyles={setSelectedTattooStylesinBottomSheet}
            hideTattooStylesSheet={hideTattooStylesSheet}
          />
        }
      />
      {/* Artist Profile Section */}
      <View style={styles.artistProfileTile}>
        <Image style={styles.profilePicture} source={profilePicture} />
        <View>
          <Text size="h3" weight="semibold" color="white">
            {artist?.data?.name ? artist?.data?.name : ""}
          </Text>
          <Text size="p" weight="normal" color="#A7A7A7">
            {artist?.data?.studio === "studio"
              ? artist?.data?.studioName
              : artist?.data?.studio === "freelancer"
              ? "Freelancer"
              : "Home artist"}
          </Text>
          <Text
            size="p"
            weight="normal"
            color="#A7A7A7"
            style={{ width: "70%" }}
          >
            {artist?.data?.city ? artist?.data?.city : ""}
          </Text>
        </View>
      </View>

      {/* Ratings Section */}
      <Rating
        title="Overall"
        selectedStar={overallRating}
        setSelectedStar={setOverallRating}
      />
      <Rating
        title="Quality of tattoo"
        selectedStar={qualityOfTattoo}
        setSelectedStar={setQualityOfTattoo}
      />
      <Rating
        title="Tattoo as imagined"
        selectedStar={tattooAsImagined}
        setSelectedStar={setTattooAsImagined}
      />

      {/* Feedback Section */}
      <View>
        <Text size="h4" weight="semibold" color="#A7A7A7">
          Feedback
        </Text>
        <TextInput
          selectionColor="#A29F93"
          placeholderTextColor="#A29F93"
          placeholder="Enter feedback"
          multiline
          value={feedback}
          style={styles.textArea}
          maxLength={500}
          onChangeText={setFeedback}
        />
        <Text
          size="medium"
          weight="normal"
          color="#A7A7A7"
          style={styles.charCount}
        >
          {feedback.length} / 500
        </Text>
      </View>

      {/* Attachment Section */}
      <View>
        <Text size="h4" weight="semibold" color="#A7A7A7">
          Attachment
        </Text>
        <TouchableOpacity
          style={styles.attachmentContainer}
          onPress={handleSelectImage}
        >
          {attachment ? (
            <Image
              style={styles.attachmentImage}
              source={{ uri: attachment }}
              resizeMode="contain"
            />
          ) : (
            <>
              <View style={styles.addIcon}>
                <Image
                  style={styles.addIconImage}
                  source={require("../../assets/images/add_photo_alternate-2.png")}
                />
              </View>
              <Text size="h4" weight="medium" color="#D7D7C9">
                Add tattoo
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* <View>
        <Text
          size="h4"
          weight="semibold"
          color="#A7A7A7"
          style={{ marginBottom: 16 }}
        >
          Tags
        </Text>
        <Input
          leftIconCustom={require("../../assets/images/tag.png")}
          placeholder="Enter tags"
          value={hashtags}
          onChangeText={(text) => {
            setHashtags(text);
          }}
        ></Input>
      </View> */}

      {/* Styles Section */}
      <View>
        <Text size="h4" weight="semibold" color="#A7A7A7">
          Styles{" "}
          {selectedTattooStyles?.length > 0
            ? "(" + selectedTattooStyles?.length + " selected)"
            : ""}
        </Text>
        <View style={styles.stylesRow}>
          {tattooStyles.slice(0, 6).map((item, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={1}
              style={[
                styles.styleButton,
                { backgroundColor: item.selected ? "#DAB769" : "#22221F" },
              ]}
              onPress={() => toggleTattooStyles(item)}
            >
              <Text
                size="p"
                weight="normal"
                color={item.selected ? "#22221F" : "#A7A7A7"}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
          {tattooStyles.length > 6 && (
            <TouchableOpacity
              onPress={() => {
                showTattooStylesSheet();
              }}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: 6,
              }}
            >
              <Text size="p" weight="normal" color="#FBF6FA">
                {"See more"}
              </Text>
              <View style={{ width: 24, height: 24 }}>
                <Image
                  style={{ width: "100%", height: "100%" }}
                  source={require("../../assets/images/arrow_down.png")}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Next Button */}
      <Button
        title="Next"
        disabled={!isFormComplete}
        variant={!isFormComplete ? "secondary" : "primary"}
        onPress={() => {
          router.push({
            pathname: "/artist/PublishReview",
            params: {
              artistId: artistId,
              rating: Number(
                (overallRating + qualityOfTattoo + tattooAsImagined) / 3
              ).toFixed(1),
              tattooFeedback: feedback,
              tattooImage: attachment,
            },
          });
        }}
      />
    </KeyboardAwareScrollView>
  );
};

export default AddReview;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#080808",
    borderTopColor: "#282828",
    borderTopWidth: 1,
  },
  scrollViewContent: {
    paddingBottom: 32,
    display: "flex",
    flexDirection: "column",
    rowGap: 16,
  },
  artistProfileTile: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#20201E",
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
  stylesRow: {
    marginTop: 16,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  textArea: {
    height: 150,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#FFFFFF1A",
    color: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
  },
  charCount: {
    textAlign: "right",
    marginTop: 4,
  },
  attachmentContainer: {
    height: 150,
    width: "100%",
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 12,
    marginTop: 16,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    rowGap: 5,
    overflow: "hidden",
  },
  attachmentImage: {
    height: "100%",
    width: "100%",
  },
  addIcon: {
    height: 20,
    width: 20,
  },
  addIconImage: {
    height: "100%",
    width: "100%",
  },
  styleButton: {
    height: 33,
    paddingHorizontal: 6,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
});

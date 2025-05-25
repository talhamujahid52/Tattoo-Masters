import React, { useState } from "react";
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

const AddReview = () => {
  const insets = useSafeAreaInsets();
  const { artistId } = useLocalSearchParams();
  const artist = useGetArtist(artistId);

  // State hooks
  const [overallRating, setOverallRating] = useState<number>(0);
  const [qualityOfTattoo, setQualityOfTattoo] = useState<number>(0);
  const [tattooAsImagined, setTattooAsImagined] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [attachment, setAttachment] = useState<string | null>("");

  // Tattoo styles state and toggling function
  const [tattooStyles, setTattooStyles] = useState([
    { title: "Tribal", value: 1, selected: false },
    { title: "Geometric", value: 2, selected: false },
    { title: "Black and White", value: 3, selected: false },
    { title: "Tribal", value: 4, selected: false },
    { title: "Geometric", value: 5, selected: false },
    { title: "Black and White", value: 6, selected: false },
  ]);

  const toggleTattooStyles = (value: number) => {
    setTattooStyles((prevState) =>
      prevState.map((item) =>
        item.value === value ? { ...item, selected: !item.selected } : item
      )
    );
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

  // Render content
  return (
    <ScrollView
      style={[styles.container, { marginBottom: insets.bottom + 16 }]}
      contentContainerStyle={styles.scrollViewContent}
    >
      {/* Artist Profile Section */}
      <View style={styles.artistProfileTile}>
        <Image
          style={styles.profilePicture}
          source={
            artist?.data?.profilePicture
              ? { uri: artist?.data?.profilePicture }
              : require("../../assets/images/Artist.png")
          }
        />
        <View>
          <Text size="h3" weight="semibold" color="white">
            {artist?.data?.name ? artist?.data?.name : "Martin Luis"}
          </Text>
          <Text size="p" weight="normal" color="#A7A7A7">
            {artist?.data?.studio
              ? artist?.data?.studio?.name
              : "Luis Arts Studio"}
          </Text>
          <Text
            size="p"
            weight="normal"
            color="#A7A7A7"
            style={{ width: "70%" }}
          >
            {artist?.data?.city ? artist?.data?.city : "Phuket, Thailand"}
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
        title="Quality of Tattoo"
        selectedStar={qualityOfTattoo}
        setSelectedStar={setQualityOfTattoo}
      />
      <Rating
        title="Tattoo as Imagined"
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
          placeholder="Enter Feedback"
          multiline
          value={feedback}
          style={styles.textArea}
          maxLength={200}
          onChangeText={setFeedback}
        />
        <Text
          size="medium"
          weight="normal"
          color="#A7A7A7"
          style={styles.charCount}
        >
          {feedback.length} / 200
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
                Add Tattoo
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Styles Section */}
      <View>
        <Text size="h4" weight="semibold" color="#A7A7A7">
          Styles
        </Text>
        <View style={styles.stylesRow}>
          {tattooStyles.map((item) => (
            <TouchableOpacity
              key={item.value}
              activeOpacity={1}
              style={[
                styles.styleButton,
                { backgroundColor: item.selected ? "#DAB769" : "#22221F" },
              ]}
              onPress={() => toggleTattooStyles(item.value)}
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
        </View>
      </View>

      {/* Next Button */}
      <Button
        title="Next"
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
    </ScrollView>
  );
};

export default AddReview;

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
    resizeMode: "contain",
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
    height: 24,
    width: 24,
  },
  addIconImage: {
    height: "100%",
    width: "100%",
  },
  styleButton: {
    padding: 6,
    borderRadius: 6,
  },
});

import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
} from "react-native";
import Text from "@/components/Text";
import React, { useState } from "react";
import { launchImageLibrary } from "react-native-image-picker";
import Rating from "@/components/Rating";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/Button";
import { router } from "expo-router";

const AddReview = () => {
  const [reviewText, setReviewText] = useState("");
  const [attachment, setAttachment] = useState<string | null>("");
  const [overallRating, setOverallRating] = useState<number | null>(null);
  const [qualityOfTattooRating, setQualityOfTattooRating] = useState<
    number | null
  >(null);
  const [tattooAsImagined, setTattooAsImagined] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  const [tattooStyles, setTattooStyles] = useState([
    { title: "Tribal", value: 1, selected: false },
    { title: "Geometric", value: 2, selected: false },
    { title: "Black and White", value: 3, selected: false },
    { title: "Tribal", value: 4, selected: false },
    { title: "Geometric", value: 5, selected: false },
    { title: "Black and White", value: 6, selected: false },
  ]);
  const toggleTattooStyles = (value: number) => {
    const updatedTattooStyles = tattooStyles.map((item) =>
      item.value === value ? { ...item, selected: !item.selected } : item
    );
    setTattooStyles(updatedTattooStyles);
  };

  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: 1,
    });

    if (!result.didCancel && result.assets && result.assets[0].uri) {
      const selectedImageUri = result.assets[0].uri;

      setAttachment(selectedImageUri);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { marginBottom: insets.bottom + 16 }]} // Extra margin for bottom spacing
      contentContainerStyle={{
        paddingBottom: 32,
        display: "flex",
        flexDirection: "column",
        rowGap: 16,
      }} // Ensure there's enough bottom space
    >
      <View style={styles.artistProfileTile}>
        <Image
          style={styles.profilePicture}
          source={require("../../assets/images/Artist.png")}
        />
        <View>
          <Text size="h3" weight="semibold" color="white">
            Martin Luis
          </Text>
          <Text size="p" weight="normal" color="#A7A7A7">
            Luis Arts Studio
          </Text>
          <Text size="p" weight="normal" color="#A7A7A7">
            Phuket, Thailand
          </Text>
        </View>
      </View>
      <Rating
        title="Overall"
        selectedStar={overallRating}
        setSelectedStar={setOverallRating}
      />
      <Rating
        title="Quality of Tattoo"
        selectedStar={qualityOfTattooRating}
        setSelectedStar={setQualityOfTattooRating}
      />
      <Rating
        title="Tattoo as Imagined"
        selectedStar={tattooAsImagined}
        setSelectedStar={setTattooAsImagined}
      />

      <View>
        <Text size="h4" weight="semibold" color="#A7A7A7">
          Feedback
        </Text>
        <TextInput
          selectionColor="#A29F93"
          placeholderTextColor="#A29F93"
          placeholder="Enter Feedback"
          multiline
          value={reviewText}
          style={styles.textArea}
          maxLength={200}
          onChangeText={(text) => {
            setReviewText(text);
          }}
        />
        <Text
          size="medium"
          weight="normal"
          color="#A7A7A7"
          style={{ textAlign: "right", marginTop: 4 }}
        >
          {reviewText.length} / 200
        </Text>
      </View>

      <View>
        <Text size="h4" weight="semibold" color="#A7A7A7">
          Attachment
        </Text>
        <TouchableOpacity
          style={{
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
          }}
          onPress={handleSelectImage} // Trigger the image selection
        >
          {attachment ? (
            <Image
              style={{ height: "100%", width: "100%" }}
              source={{ uri: attachment }}
            />
          ) : (
            <>
              <View style={{ height: 24, width: 24 }}>
                <Image
                  style={{ height: "100%", width: "100%" }}
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

      <View>
        <Text size="h4" weight="semibold" color="#A7A7A7">
          Styles
        </Text>
        <View style={styles.stylesRow}>
          {tattooStyles.map((item) => {
            return (
              <TouchableOpacity
                key={item.value}
                activeOpacity={1}
                style={{
                  padding: 6,
                  borderRadius: 6,
                  backgroundColor: item.selected ? "#DAB769" : "#22221F",
                }}
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
            );
          })}
        </View>
      </View>
      <Button
        title="Next"
        onPress={() => {
          router.push("/artist/PublishReview");
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
});

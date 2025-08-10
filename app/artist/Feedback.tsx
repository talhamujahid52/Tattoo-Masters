import {
  StyleSheet,
  View,
  Image,
  Pressable,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import Text from "@/components/Text";
import Button from "@/components/Button";
import { launchImageLibrary, Asset } from "react-native-image-picker"; // Ensure proper typing for launchImageLibrary
import useBackgroundUpload from "@/hooks/useBackgroundUpload";
import { firebase } from "@react-native-firebase/firestore";
import firestore from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const Feedback = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null); // Track the selected option
  const [content, setContent] = useState<string>("");
  const [attachment, setAttachment] = useState<string | null>("");
  const currentUserId = firebase?.auth()?.currentUser?.uid;
  const [loading, setLoading] = useState(false);
  const { queueUpload } = useBackgroundUpload();

  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: 1, // Allow only one image to be selected
    });

    if (!result.didCancel && result.assets && result.assets[0].uri) {
      const selectedImageUri = result.assets[0].uri;

      setAttachment(selectedImageUri); // Save the selected image URI
    }
  };

  const handleSelection = (option: string) => {
    setSelectedOption(option);
  };

  const handleSubmitFeedback = async () => {
    setLoading(true);

    try {
      let imageQueuedSuccessfully = true;

      // Queue image for background upload if there is an attachment
      if (attachment) {
        imageQueuedSuccessfully = await queueUpload({
          uri: attachment,
          userId: currentUserId as string,
          type: "feedback",
          name: "feedbackImage.jpeg",
        });

        if (!imageQueuedSuccessfully) {
          Alert.alert(
            "Image Upload Warning",
            "Your feedback will be submitted, but the image could not be queued for upload. The image file may no longer exist."
          );
        }
      }

      // Save feedback immediately (image will be processed in background)
      await firestore().collection("feedback").add({
        feedbackType: selectedOption,
        date: new Date(),
        feedback: content,
        user: currentUserId,
        imageUrl: null, // Will be updated when background upload completes
        hasAttachment: !!attachment, // Track if there should be an image
      });

      const successMessage =
        "Your Feedback has been submitted Successfully. " +
        (attachment && imageQueuedSuccessfully
          ? "Your image is uploading in the background."
          : attachment && !imageQueuedSuccessfully
          ? "However, the image could not be uploaded."
          : "");

      router.replace("/artist/FeedbackSubmitted");
    } catch (err) {
      console.error("Error submitting feedback:", err);
      Alert.alert(
        "Error",
        "There was a problem submitting your feedback. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };
  const canSubmit = loading || selectedOption !== null;

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <Text size="h4" weight="semibold" color="#A7A7A7">
        Feedback type
      </Text>

      <View style={styles.optionContainer}>
        {/* Share an idea option */}
        <Pressable
          style={[
            styles.optionCard,
            selectedOption === "idea" && styles.selectedOption, // Apply selected styles
          ]}
          onPress={() => handleSelection("idea")}
        >
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={require("../../assets/images/lightbulb.png")}
            />
          </View>
          <Text size="h4" weight="normal" color="#FBF6FA">
            Share an idea
          </Text>
          <Text
            size="medium"
            weight="normal"
            color="#A7A7A7"
            style={{ textAlign: "center" }}
          >
            I have a suggestion{"\n"} or feature request.
          </Text>
        </Pressable>

        {/* Report a bug option */}
        <Pressable
          style={[
            styles.optionCard,
            selectedOption === "bug" && styles.selectedOption, // Apply selected styles
          ]}
          onPress={() => handleSelection("bug")}
        >
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={require("../../assets/images/bug_report.png")}
            />
          </View>
          <Text size="h4" weight="normal" color="#FBF6FA">
            Report a bug
          </Text>
          <Text
            size="medium"
            weight="normal"
            color="#A7A7A7"
            style={{ textAlign: "center" }}
          >
            Something isn't working as expected.
          </Text>
        </Pressable>
      </View>

      <View style={{ paddingTop: 16 }}>
        <Text size="h4" weight="semibold" color="#A7A7A7">
          Feedback
        </Text>
        <TextInput
          selectionColor="#A29F93"
          placeholderTextColor="#A29F93"
          placeholder="Enter message"
          multiline
          value={content}
          style={styles.textArea}
          maxLength={500}
          onChangeText={(text) => {
            setContent(text);
          }}
        />
        <Text
          size="medium"
          weight="normal"
          color="#A7A7A7"
          style={{ textAlign: "right", marginTop: 4 }}
        >
          {content.length} / 500
        </Text>
      </View>

      <View>
        <Text size="h4" weight="semibold" color="#A7A7A7">
          Attachment {}
          <Text size="medium" weight="normal" color="#A7A7A7">
            (optional)
          </Text>
        </Text>
        <TouchableOpacity
          style={{
            height: 150,
            width: "100%",
            borderWidth: 1,
            borderColor: "#2D2D2D",
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
              <View style={{ height: 18, width: 18 }}>
                <Image
                  style={{ height: "100%", width: "100%" }}
                  source={require("../../assets/images/add_photo_white.png")}
                />
              </View>
              <Text size="p" weight="normal" color="#D7D7C9">
                Add photo
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Button fixed at the bottom */}
      <View style={styles.footer}>
        <Button
          title={
            loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              "Submit"
            )
          }
          onPress={handleSubmitFeedback}
          disabled={!canSubmit}
          variant={selectedOption ? "primary" : "secondary"}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Feedback;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  optionCard: {
    flex: 0.48, // Adjusting flex to better fit the container
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#A291AA", // Default border color
    borderWidth: 1,
    borderRadius: 12,
    padding: 16, // Added padding for better spacing inside the card
  },
  selectedOption: {
    borderColor: "#DAB769", // Green border color for selected option
    backgroundColor: "#F2D1891A",
  },
  imageContainer: {
    height: 27, // Increased image container size for better visibility
    width: 27, // Increased image container size for better visibility
    marginBottom: 8, // Added margin for spacing
  },
  image: {
    height: "100%",
    width: "100%",
    resizeMode: "contain", // Ensure the image scales properly
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
  footer: {
    marginTop: "auto", // Pushes the button to the bottom
    marginBottom: 16, // Optional: Adds spacing between button and screen's edge
  },
});

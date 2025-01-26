import {
  StyleSheet,
  View,
  Image,
  Pressable,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import Text from "@/components/Text";
import Button from "@/components/Button";
import { launchImageLibrary, Asset } from "react-native-image-picker"; // Ensure proper typing for launchImageLibrary

const Feedback = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null); // Track the selected option
  const [content, setContent] = useState<string>("");
  const [attachment, setAttachment] = useState<string | null>("");

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

  return (
    <View style={styles.container}>
      <Text size="h4" weight="semibold" color="#A7A7A7">
        Feedback Type
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
            I have a suggestion or feature request.
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
          Message
        </Text>
        <TextInput
          selectionColor="#A29F93"
          placeholderTextColor="#A29F93"
          placeholder="Enter Feedback"
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

      {/* Button fixed at the bottom */}
      <View style={styles.footer}>
        <Button title="Submit" />
      </View>
    </View>
  );
};

export default Feedback;

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container takes up the entire screen height
    padding: 16,
    justifyContent: "space-between", // Push button to the bottom by spacing out elements
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
    height: 40, // Increased image container size for better visibility
    width: 40, // Increased image container size for better visibility
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

import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import Text from "@/components/Text";
import { launchImageLibrary } from "react-native-image-picker";
import Button from "@/components/Button";

const AddTattoo = () => {
  const [attachment, setAttachment] = useState<string | null>("");
  const [caption, setCaption] = useState<string>("");
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
      selectionLimit: 1, // Allow only one image to be selected
    });

    if (!result.didCancel && result.assets && result.assets[0].uri) {
      const selectedImageUri = result.assets[0].uri;
      setAttachment(selectedImageUri); // Save the selected image URI
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{
          height: "50%",
          width: "100%",
          borderWidth: 1,
          borderColor: "#262626",
          borderRadius: 12,
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
            style={{ height: "100%", width: "100%", resizeMode: "stretch" }} // Set image height to 40%
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

      <View>
        <TextInput
          selectionColor="#A29F93"
          placeholderTextColor="#A29F93"
          placeholder="Write Caption"
          multiline
          value={caption}
          style={styles.textArea}
          maxLength={200}
          onChangeText={(text) => {
            setCaption(text);
          }}
        />
        <Text
          size="medium"
          weight="normal"
          color="#A7A7A7"
          style={{ textAlign: "right", marginTop: 4 }}
        >
          {caption.length} / 200
        </Text>
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
                  backgroundColor: item.selected ? "#DAB769" : "#262526",
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

      <View style={styles.fixedButtonContainer}>
        <Button title="Publish" />
      </View>
    </View>
  );
};

export default AddTattoo;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1, // Allow the container to take full screen height
  },
  textArea: {
    width: "100%",
    color: "white",
    paddingVertical: 12,
    marginTop: 10,
    borderBottomColor: "#262626",
    borderBottomWidth: 1,
  },
  stylesRow: {
    marginTop: 16,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  fixedButtonContainer: {
    position: "absolute", // Fix the button at the bottom
    bottom: 20, // Adjust the distance from the bottom
    left: 16,
    right: 16,
  },
});

import React, { useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import Text from "@/components/Text";
import { launchImageLibrary, Asset } from "react-native-image-picker";

// Types for the selected image state
type SelectedImages = (string | null | undefined)[];

const Step2: React.FC = () => {
  const { width } = Dimensions.get("window");
  const imageTileWidth = (width - 40) / 2; // For 2 tiles per row

  // State to hold selected image URIs
  const [selectedImages, setSelectedImages] = useState<SelectedImages>([null, null, null, null]);

  const handleImageSelection = (index: number) => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.7,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User canceled image picker");
        } else if (response.errorCode) {
          console.log("ImagePicker Error: ", response.errorMessage);
        } else {
          const updatedImages = [...selectedImages];
          updatedImages[index] = response.assets ? (response.assets[0] as Asset).uri : null;
          setSelectedImages(updatedImages);
        }
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text
        size="p"
        weight="normal"
        color="#A7A7A7"
        style={{ textAlign: "center", paddingHorizontal: 50 }}
      >
        Upload at least 4 tattoos to your portfolio to continue.
      </Text>

      <View style={styles.imageGrid}>
        {selectedImages.map((imageUri, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.imageTile,
              { width: imageTileWidth, height: imageTileWidth },
            ]}
            onPress={() => handleImageSelection(index)} // Trigger image picker on press
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <>
                <Image
                  style={styles.icon}
                  source={require("../assets/images/add_photo_white.png")}
                />
                <Text
                  size="medium"
                  weight="semibold"
                  color="#D7D7C9"
                  style={{ marginTop: 4 }}
                >
                  Add Tattoo
                </Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default Step2;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#FFFFFF56",
    borderRadius: 20,
  },
  icon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "cover", // Ensures the image covers the area of the tile
  },
  imageTile: {
    borderWidth: 1,
    borderColor: "#FFFFFF56",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
});

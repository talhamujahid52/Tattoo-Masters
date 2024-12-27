import React, { useContext } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import Text from "@/components/Text";
import { launchImageLibrary } from "react-native-image-picker";
import { FormContext } from "../context/FormContext";
const Step2: React.FC = () => {
  const { formData, setFormData } = useContext(FormContext)!;
  const { width } = Dimensions.get("window");
  const imageTileWidth = (width - 40) / 2; // For 2 tiles per row

  const handleSelectImage = async (index: number) => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: 1, // Allow only one image to be selected
    });

    if (!result.didCancel && result.assets && result.assets[0].uri) {
      const selectedImageUri = result.assets[0].uri;

      setFormData((prev) => {
        const updatedImages = [...prev.images];
        updatedImages[index] = selectedImageUri; // Replace or add the image at the given index
        return { ...prev, images: updatedImages };
      });
    }
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
        {Array.from({ length: 4 }).map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.imageTile,
              { width: imageTileWidth, height: imageTileWidth },
            ]}
            onPress={() => handleSelectImage(index)} // Open image picker when a box is clicked
          >
            {formData.images[index] ? (
              <Image
                source={{ uri: formData.images[index] }}
                style={styles.image}
              />
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

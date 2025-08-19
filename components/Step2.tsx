import React, { useContext } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import Text from "@/components/Text";
import { FormContext } from "../context/FormContext";
import { useRouter } from "expo-router";

const Step2: React.FC = () => {
  const { formData } = useContext(FormContext)!;
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const imageTileWidth = (width - 40) / 2;

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
            onPress={() =>
              router.push({
                pathname: "/artist/UploadTattoo",
                params: { index },
              })
            }
          >
            {formData.images[index]?.uri ? (
              <Image
                source={{ uri: formData.images[index].uri }}
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
                  Add tattoo
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
    resizeMode: "cover",
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

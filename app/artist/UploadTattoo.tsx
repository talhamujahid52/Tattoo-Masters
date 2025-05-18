import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useContext } from "react";
import Text from "@/components/Text";
import { launchImageLibrary } from "react-native-image-picker";
import Button from "@/components/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FormContext } from "../../context/FormContext";
import { getFileName } from "@/utils/helperFunctions";

const UploadTattoo = () => {
  const [attachment, setAttachment] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<number[]>([]);
  const router = useRouter();
  const { index } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { setFormData } = useContext(FormContext)!;

  const tattooStyles = [
    { title: "Tribal", value: 1 },
    { title: "Geometric", value: 2 },
    { title: "Black and White", value: 3 },
  ];

  const toggleStyle = (value: number) => {
    setSelectedStyles((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: 1,
    });

    if (!result.didCancel && result.assets && result.assets[0].uri) {
      setAttachment(result.assets[0].uri);
    }
  };

  const publishTattoo = async () => {
    if (!attachment || index === undefined) return;

    try {
      setLoading(true);

      const imageIndex = parseInt(index as string);

      const selectedStyleTitles = tattooStyles
        .filter((style) => selectedStyles.includes(style.value))
        .map((style) => style.title);

      // Build image object
      const imageObject = {
        uri: attachment,
        name: getFileName(attachment),
        caption,
        styles: selectedStyleTitles,
      };

      setFormData((prev) => {
        const updatedImages = [...prev.images];
        updatedImages[imageIndex] = imageObject;
        return { ...prev, images: updatedImages };
      });

      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save tattoo image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
    >
      <TouchableOpacity style={styles.imagePicker} onPress={handleSelectImage}>
        {attachment ? (
          <Image
            style={{ height: "100%", width: "100%", resizeMode: "contain" }}
            source={{ uri: attachment }}
          />
        ) : (
          <>
            <View style={{ height: 24, width: 24 }}>
              <Image
                style={{ height: "100%", width: "100%", resizeMode: "cover" }}
                source={require("../../assets/images/add_photo_alternate-2.png")}
              />
            </View>
            <Text size="h4" weight="medium" color="#D7D7C9">
              Add Tattoo
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TextInput
        selectionColor="#A29F93"
        placeholderTextColor="#A29F93"
        placeholder="Write Caption"
        multiline
        value={caption}
        style={styles.textArea}
        maxLength={200}
        onChangeText={setCaption}
      />
      <Text
        size="medium"
        weight="normal"
        color="#A7A7A7"
        style={{ textAlign: "right", marginTop: 4 }}
      >
        {caption.length} / 200
      </Text>

      <Text
        size="h4"
        weight="semibold"
        color="#A7A7A7"
        style={{ marginTop: 16 }}
      >
        Styles
      </Text>
      <View style={styles.stylesRow}>
        {tattooStyles.map((style) => (
          <TouchableOpacity
            key={style.value}
            onPress={() => toggleStyle(style.value)}
            style={{
              padding: 6,
              borderRadius: 6,
              backgroundColor: selectedStyles.includes(style.value)
                ? "#DAB769"
                : "#262526",
            }}
          >
            <Text
              size="p"
              weight="normal"
              color={
                selectedStyles.includes(style.value) ? "#22221F" : "#A7A7A7"
              }
            >
              {style.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={[styles.fixedButtonContainer, { marginBottom: insets.bottom }]}
      >
        <Button
          loading={loading}
          disabled={!attachment}
          onPress={publishTattoo}
          title="Publish"
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

export default UploadTattoo;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  imagePicker: {
    height: "50%",
    width: "100%",
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    rowGap: 5,
    overflow: "hidden",
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
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 10,
    left: 16,
    right: 16,
  },
});

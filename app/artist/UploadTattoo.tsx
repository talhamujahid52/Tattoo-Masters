import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useContext, useEffect } from "react";
import Text from "@/components/Text";
import { launchImageLibrary } from "react-native-image-picker";
import Button from "@/components/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FormContext } from "../../context/FormContext";
import { getFileName } from "@/utils/helperFunctions";
import firestore from "@react-native-firebase/firestore";
import StylesBottomSheet from "@/components/BottomSheets/StylesBottomSheet";
import useBottomSheet from "@/hooks/useBottomSheet";

const UploadTattoo = () => {
  const [attachment, setAttachment] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<number[]>([]);
  const router = useRouter();
  const { index } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { setFormData } = useContext(FormContext)!;

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

      const selectedStyleTitles = selectedTattooStyles
        .filter((style) => style.selected)
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

  const {
    BottomSheet: TattooStylesSheet,
    show: showTattooStylesSheet,
    hide: hideTattooStylesSheet,
  } = useBottomSheet();

  const setSelectedTattooStylesinBottomSheet = (
    updatedStyles: { title: string; selected: boolean }[]
  ) => {
    setTattooStyles(updatedStyles);
    const selected = updatedStyles.filter((item) => item.selected);
    setSelectedTattooStyles(selected);
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
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
              Add tattoo
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TextInput
        selectionColor="#A29F93"
        placeholderTextColor="#A29F93"
        placeholder="Write caption"
        multiline
        value={caption}
        style={styles.textArea}
        maxLength={500}
        onChangeText={setCaption}
      />
      <Text
        size="medium"
        weight="normal"
        color="#A7A7A7"
        style={{ textAlign: "right", marginTop: 4 }}
      >
        {caption.length} / 500
      </Text>

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

      <View
        style={[styles.fixedButtonContainer, { marginBottom: insets.bottom }]}
      >
        <Button
          loading={loading}
          disabled={!attachment}
          variant={attachment ? "primary" : "secondary"}
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

import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import Text from "@/components/Text";
import { launchImageLibrary } from "react-native-image-picker";
import Button from "@/components/Button";
import useBackgroundUpload from "@/hooks/useBackgroundUpload";
import { useSelector } from "react-redux";
import { getFileName } from "@/utils/helperFunctions";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import firestore from "@react-native-firebase/firestore";
import StylesBottomSheet from "@/components/BottomSheets/StylesBottomSheet";
import useBottomSheet from "@/hooks/useBottomSheet";

const AddTattoo = () => {
  const [attachment, setAttachment] = useState<string | null>("");
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [caption, setCaption] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const loggedInUser = useSelector((state: any) => state?.user?.user);
  const currentUserId = loggedInUser?.uid;
  const { queueUpload } = useBackgroundUpload();
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
      selectionLimit: 1, // Allow only one image to be selected
    });

    if (!result.didCancel && result.assets && result.assets[0].uri) {
      const selectedImageUri = result.assets[0].uri;
      setAttachment(selectedImageUri); // Save the selected image URI
    }
  };
  const publishTattoo = async () => {
    try {
      if (!attachment) {
        throw new Error("No image selected");
      }
      setLoading(true);
      const styles = selectedTattooStyles?.reduce((acc: string[], item) => {
        if (item.selected) {
          acc.push(item.title);
        }
        return acc;
      }, []);
      const uploadSuccess = await queueUpload({
        uri: attachment,
        userId: currentUserId,
        type: "publication",
        caption,
        styles,
        name: getFileName(attachment),
      }); // queue image for background upload

      if (!uploadSuccess) {
        Alert.alert(
          "Upload Error",
          "Failed to queue image for upload. The file may no longer exist."
        );
        return;
      }

      router.back();
    } catch (error) {
      Alert.alert("Error adding tattoo", error as string);
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
            style={{ height: "100%", width: "100%", resizeMode: "contain" }} // Set image height to 40%
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

      <View>
        <TextInput
          selectionColor="#A29F93"
          placeholderTextColor="#A29F93"
          placeholder="Write caption"
          multiline
          value={caption}
          style={styles.textArea}
          maxLength={500}
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
          {caption.length} / 500
        </Text>
      </View>

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
          // disabled={!attachment}
          variant={attachment ? "primary" : "secondary"}
          onPress={publishTattoo}
          title="Publish"
        />
      </View>
    </KeyboardAwareScrollView>
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
    bottom: 10, // Adjust the distance from the bottom
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

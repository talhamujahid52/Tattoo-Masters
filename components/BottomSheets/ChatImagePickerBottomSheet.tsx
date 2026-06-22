import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "../Text";
import CameraIcon from "../CameraIcon";
import UploadPhotoIcon from "../UploadPhotoIcon";

interface ChatImagePickerBottomSheetProps {
  hideImagePickerSheet: () => void;
  onTakePhoto: () => void;
  onChooseFromLibrary: () => void;
}

const ChatImagePickerBottomSheet = ({
  hideImagePickerSheet,
  onTakePhoto,
  onChooseFromLibrary,
}: ChatImagePickerBottomSheetProps) => {
  const selectImageSource = (action: () => void) => {
    hideImagePickerSheet();

    // Wait for the sheet dismissal animation before presenting the native picker.
    setTimeout(action, 300);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => selectImageSource(onChooseFromLibrary)}
        style={styles.action}
      >
        <UploadPhotoIcon />
        <Text size="h4" weight="normal" color="#FBF6FA">
          Upload photo
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => selectImageSource(onTakePhoto)}
        style={styles.action}
      >
        <CameraIcon />
        <Text size="h4" weight="normal" color="#FBF6FA">
          Take photo
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatImagePickerBottomSheet;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#080808",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
  },
});

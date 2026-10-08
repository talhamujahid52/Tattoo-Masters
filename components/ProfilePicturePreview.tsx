import React, { useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
  ImageStyle,
  StyleProp,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface ProfilePicturePreviewProps {
  imageSource: any;
  imageStyle?: StyleProp<ImageStyle>;
  isSquare?: boolean;
  highResolutionImage?: any;
}

const ProfilePicturePreview: React.FC<ProfilePicturePreviewProps> = ({
  imageSource,
  imageStyle,
  isSquare,
  highResolutionImage,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const previewSize = isSquare ? width * 0.95 : width * 0.85;

  return (
    <>
      {/* Clickable Profile Picture */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <ExpoImage
          style={imageStyle}
          source={imageSource}
          cachePolicy="memory-disk"
        />
      </TouchableOpacity>

      {/* Full Screen Preview Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="close" size={30} color="white" />
          </TouchableOpacity>

          {/* Full Size Image */}
          <View
            style={{
              borderRadius: isSquare ? 0 : (width * 0.85) / 2,
              overflow: "hidden",
            }}
          >
            <Pressable
              style={{ width: previewSize, height: previewSize }}
              onPress={(e) => e.stopPropagation()}
            >
              {/* The small picture is already cached by the thumbnail above,
                  so it shows instantly while the full-size one downloads. */}
              <ExpoImage
                style={StyleSheet.absoluteFill}
                source={imageSource}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              {highResolutionImage ? (
                <ExpoImage
                  style={StyleSheet.absoluteFill}
                  source={{ uri: highResolutionImage }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={200}
                />
              ) : null}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 25,
  },
  fullImage: {
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: (width * 0.85) / 2,
  },
});

export default ProfilePicturePreview;

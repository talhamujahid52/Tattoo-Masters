import React, { useState } from "react";
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Pressable,
  ImageStyle,
  StyleProp,
} from "react-native";
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

  return (
    <>
      {/* Clickable Profile Picture */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Image style={imageStyle} source={imageSource} />
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
          <StatusBar barStyle="light-content" />

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
            <Pressable onPress={(e) => e.stopPropagation()}>
              <Image
                style={{
                  width: isSquare ? width * 0.95 : width * 0.85,
                  height: isSquare ? width * 0.95 : width * 0.85,
                  borderRadius: isSquare ? 0 : (width * 0.85) / 2,
                }}
                source={
                  highResolutionImage
                    ? { uri: highResolutionImage }
                    : imageSource
                }
                resizeMode="cover"
              />
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

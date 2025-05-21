import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/Button";
import Text from "@/components/Text";
import ShareReviewPasswordModal from "@/components/Modals/ShareReviewPasswordModal";

const ShareProfile = () => {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(true);

  useEffect(() => {
    // Automatically show modal when screen loads
    setModalVisible(true);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/shareProfileBackground.png")}
        style={styles.backgroundImage}
        resizeMode="contain"
      />
      <LinearGradient
        style={styles.gradientOverlay}
        locations={[0.4, 0.6, 1]}
        colors={["rgba(25, 25, 23, 0.1)", "rgba(25, 25, 23, 0.1)", "#171715"]}
      />

      <View style={[styles.buttonContainer, { bottom: insets.bottom }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            // router.push({
            //   pathname: "/artist/ShareReviewPassword",
            // });
          }}
        >
          <Text size="h4" weight="normal" color="#FBF6FA">
            Skip
          </Text>
        </TouchableOpacity>
        {/* <Button
          title="Skip"
          onPress={() => {
            router.push({
              pathname: "/(bottomTabs)/Home",
            });
          }}
        /> */}
      </View>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalContainer}
            onPress={() => {}} // prevent closing when tapping inside
          >
            <ShareReviewPasswordModal onClose={() => setModalVisible(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ShareProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#23221F",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    height: "100%",
    width: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    zIndex: 2,
    width: "100%",
    position: "absolute",
  },
  button: {
    height: 48,
    width: "100%",
    borderRadius: 30,
    backgroundColor: "#20201E",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});

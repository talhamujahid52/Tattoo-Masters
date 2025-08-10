import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import Text from "./Text";
import useBackgroundUpload from "@/hooks/useBackgroundUpload";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface UploadProgressIndicatorProps {
  showDetailed?: boolean;
  onPress?: () => void;
}

const UploadProgressIndicator: React.FC<UploadProgressIndicatorProps> = ({
  showDetailed = false,
  onPress,
}) => {
  const {
    queue,
    isProcessing,
    pendingCount,
    uploadingCount,
    completedCount,
    failedCount,
    retryAllFailedUploads,
    clearAllUploads,
  } = useBackgroundUpload();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(60)).current;
  const circleProgress = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  const activeCount = pendingCount + uploadingCount;
  const totalCount = queue.length;
  const overallProgress =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const hasFailedUploads = failedCount > 0;
  const isUploading = activeCount > 0;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  // Show the component when there are uploads
  useEffect(() => {
    if (queue.length > 0) {
      // Reset progress and rotation when new uploads start
      circleProgress.setValue(0);
      rotationAnim.setValue(0);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(50);
    }
  }, [queue.length, fadeAnim, translateY, circleProgress, rotationAnim]);

  // Update circle progress based on actual upload completion
  useEffect(() => {
    Animated.timing(circleProgress, {
      toValue: overallProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [overallProgress, circleProgress]);

  // Continuous rotation animation while uploading
  useEffect(() => {
    if (isUploading) {
      // Reset rotation to ensure consistent animation
      rotationAnim.setValue(0);

      const rotateAnimation = Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      );
      rotateAnimation.start();
      return () => rotateAnimation.stop();
    } else {
      // Reset rotation when not uploading
      rotationAnim.setValue(0);
    }
  }, [isUploading, rotationAnim]);

  // Auto-hide when all completed successfully
  useEffect(() => {
    if (allCompleted && !hasFailedUploads) {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 120,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1500); // Show success state for 1.5 seconds before hiding

      return () => clearTimeout(timer);
    }
  }, [allCompleted, hasFailedUploads, fadeAnim, translateY]);

  // Don't show if no uploads (moved after all hooks)
  if (queue.length === 0) return null;

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleRetry = () => {
    retryAllFailedUploads();
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Clear all uploads when manually dismissed to reset everything
      clearAllUploads();
    });
  };

  // If uploading, show simple pill with text and activity indicator
  if (isUploading) {
    return (
      <Animated.View
        style={[
          styles.uploadingContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.uploadingPill}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text
            size="small"
            weight="medium"
            color="#888888"
            style={styles.uploadingText}
          >
            Uploading
          </Text>
        </View>
      </Animated.View>
    );
  }

  // If there are failed uploads, show the error state
  if (hasFailedUploads) {
    return (
      <Animated.View
        style={[
          styles.errorContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.errorContent}
          onPress={handleRetry}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#FF6B6B", "#E55555"]}
            style={styles.errorGradient}
          >
            <Text size="medium" weight="semibold" color="#FBF6FA">
              {failedCount} upload{failedCount > 1 ? "s" : ""} failed
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={require("@/assets/images/close.png")}
            style={styles.closeIcon}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Don't render anything else (completed uploads auto-hide)
  return null;
};

const styles = StyleSheet.create({
  uploadingContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: "absolute",
    bottom: 120,
    right: 16,
    zIndex: 1000,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadingPill: {
    backgroundColor: "#2D2D2D",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadingText: {
    marginLeft: 6,
  },
  circleContainer: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  progressRing: {
    width: 60,
    height: 60,
    position: "absolute",
  },
  progressArc: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 6,
    borderColor: "#DAB769",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
  },
  innerCircle: {
    width: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2D2D2D",
  },
  errorContainer: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
  },
  errorContent: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  errorGradient: {
    padding: 16,
    alignItems: "center",
  },
  closeButton: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: "#FF6B6B",
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: "#FBF6FA",
  },
});

export default UploadProgressIndicator;

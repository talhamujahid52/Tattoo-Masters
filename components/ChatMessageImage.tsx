import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaProvider,
  initialWindowMetrics,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Zoomable } from "@likashefqet/react-native-image-zoom";

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;
const OPEN_DURATION = 220;
const OPEN_FROM_SCALE = 0.85;
// Releasing a drag past this distance, or flicking faster than this velocity,
// dismisses the viewer.
const DISMISS_DISTANCE = 100;
const DISMISS_VELOCITY = 900;
const DISMISS_DURATION = 150;
// Drag distance over which the backdrop fades out completely.
const DRAG_FADE_DISTANCE = 300;

interface ChatMessageImageProps {
  uri?: string;
}

const CloseButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const insets = useSafeAreaInsets();
  return (
    <TouchableOpacity
      style={[styles.closeButton, { top: insets.top + 10 }]}
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={10}
    >
      <MaterialIcons name="close" size={24} color="black" />
    </TouchableOpacity>
  );
};

// Mounted only while the Modal is visible, so the animation replays on every
// open. The close button just unmounts it; swiping away fades it out first.
const Viewer: React.FC<{ uri: string; onClose: () => void }> = ({
  uri,
  onClose,
}) => {
  const progress = useSharedValue(0);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: OPEN_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  // One finger drags the image away; Zoomable only uses two-finger gestures
  // (pinch + pan), so the two don't compete. A second finger landing cancels
  // the drag (success === false) and the image snaps back.
  const dismissGesture = Gesture.Pan()
    .maxPointers(1)
    .onUpdate((event) => {
      dragX.value = event.translationX;
      dragY.value = event.translationY;
    })
    .onEnd((event, success) => {
      const distance = Math.sqrt(
        event.translationX ** 2 + event.translationY ** 2,
      );
      const velocity = Math.sqrt(event.velocityX ** 2 + event.velocityY ** 2);
      const flicked = velocity > DISMISS_VELOCITY && distance > 20;
      if (success && (distance > DISMISS_DISTANCE || flicked)) {
        progress.value = withTiming(
          0,
          { duration: DISMISS_DURATION },
          (finished) => {
            if (finished) runOnJS(onClose)();
          },
        );
      } else {
        dragX.value = withTiming(0);
        dragY.value = withTiming(0);
      }
    });

  const backdropStyle = useAnimatedStyle(() => {
    const distance = Math.sqrt(dragX.value ** 2 + dragY.value ** 2);
    return {
      opacity:
        progress.value *
        interpolate(
          distance,
          [0, DRAG_FADE_DISTANCE],
          [1, 0],
          Extrapolation.CLAMP,
        ),
    };
  });
  const contentStyle = useAnimatedStyle(() => {
    const distance = Math.sqrt(dragX.value ** 2 + dragY.value ** 2);
    return {
      opacity:
        progress.value *
        interpolate(
          distance,
          [0, DRAG_FADE_DISTANCE],
          [1, 0.4],
          Extrapolation.CLAMP,
        ),
      transform: [
        { translateX: dragX.value },
        { translateY: dragY.value },
        { scale: OPEN_FROM_SCALE + (1 - OPEN_FROM_SCALE) * progress.value },
      ],
    };
  });

  return (
    <GestureHandlerRootView style={styles.overlay}>
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      <GestureDetector gesture={dismissGesture}>
        <Animated.View style={[styles.content, contentStyle]}>
          <Zoomable minScale={MIN_SCALE} maxScale={MAX_SCALE}>
            <ExpoImage
              style={StyleSheet.absoluteFill}
              source={{ uri }}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </Zoomable>
        </Animated.View>
      </GestureDetector>
      <CloseButton onPress={onClose} />
    </GestureHandlerRootView>
  );
};

const ChatMessageImage: React.FC<ChatMessageImageProps> = ({ uri }) => {
  const [visible, setVisible] = useState(false);

  if (!uri) return null;

  const close = () => setVisible(false);

  return (
    <View>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setVisible(true)}>
        <ExpoImage
          style={styles.thumbnail}
          source={{ uri }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={close}
        statusBarTranslucent
      >
        {/* The Modal is its own window: it needs its own safe-area provider
            to measure insets, and (on Android) its own gesture root view.
            Seeded with the app's launch metrics so the close button doesn't
            jump once the provider finishes measuring. */}
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <Viewer uri={uri} onClose={close} />
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  thumbnail: {
    width: 150,
    height: 100,
    borderRadius: 13,
    margin: 3,
  },
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    right: 20,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
  },
});

export default ChatMessageImage;

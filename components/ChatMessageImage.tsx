import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
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
import { useChatContext } from "react-native-gifted-chat";
import { saveImageToLibrary } from "@/utils/saveImageToLibrary";
import { ToastHost } from "@/components/Toast";

// Big enough to see the tattoo in the chat, small enough to leave room for
// the avatar and bubble margins on narrow phones
const THUMBNAIL_SIZE = Math.min(
  240,
  Math.round(Dimensions.get("window").width * 0.6),
);
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
// A one-finger drag must move this far before it starts dismissing, which
// leaves time for a second finger to land and start a pinch instead.
const DISMISS_ACTIVE_OFFSET = 12;

interface ChatMessageImageProps {
  uri?: string;
  // True until the upload has replaced the sender's local path with a URL
  pending?: boolean;
  // Whether the current user sent the message
  isOwn?: boolean;
}

const isRemoteUri = (uri: string) => /^https?:\/\//i.test(uri);

const ViewerButtons: React.FC<{
  onClose: () => void;
  onSave?: () => void;
}> = ({ onClose, onSave }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.viewerButtons, { top: insets.top + 10 }]}>
      {onSave && (
        <TouchableOpacity
          style={styles.viewerButton}
          onPress={onSave}
          activeOpacity={0.8}
          hitSlop={10}
          accessibilityLabel="Save image"
        >
          <MaterialIcons name="file-download" size={24} color="black" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.viewerButton}
        onPress={onClose}
        activeOpacity={0.8}
        hitSlop={10}
        accessibilityLabel="Close"
      >
        <MaterialIcons name="close" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

// Mounted only while the Modal is visible, so the animation replays on every
// open. The close button just unmounts it; swiping away fades it out first.
const Viewer: React.FC<{
  uri: string;
  onClose: () => void;
  onSave?: () => void;
}> = ({ uri, onClose, onSave }) => {
  const progress = useSharedValue(0);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  // Zoom level, shared with Zoomable so swiping away is off while zoomed
  const zoomScale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: OPEN_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  // One finger drags the image away; Zoomable only uses two-finger gestures
  // (pinch + pan), so the two don't compete. A second finger landing, or the
  // image being zoomed, cancels the drag and the image snaps back. Like the
  // tattoo detail page, Zoomable springs back to normal size on release.
  const dismissGesture = Gesture.Pan()
    .maxPointers(1)
    .activeOffsetX([-DISMISS_ACTIVE_OFFSET, DISMISS_ACTIVE_OFFSET])
    .activeOffsetY([-DISMISS_ACTIVE_OFFSET, DISMISS_ACTIVE_OFFSET])
    .onTouchesDown((event, manager) => {
      if (event.numberOfTouches > 1 || zoomScale.value !== 1) manager.fail();
    })
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
          <Zoomable scale={zoomScale} minScale={MIN_SCALE} maxScale={MAX_SCALE}>
            <ExpoImage
              style={StyleSheet.absoluteFill}
              source={{ uri }}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </Zoomable>
        </Animated.View>
      </GestureDetector>
      <ViewerButtons onClose={onClose} onSave={onSave} />
      {/* The Modal is its own window, above the app's root toast host */}
      <ToastHost />
    </GestureHandlerRootView>
  );
};

const ChatMessageImage: React.FC<ChatMessageImageProps> = ({
  uri,
  pending,
  isOwn,
}) => {
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const { actionSheet } = useChatContext();

  if (!uri) return null;

  const close = () => setVisible(false);
  const save = () => saveImageToLibrary(uri);

  const showImageActions = () => {
    actionSheet().showActionSheetWithOptions(
      { options: ["Save image", "Cancel"], cancelButtonIndex: 1 },
      (buttonIndex) => {
        if (buttonIndex === 0) save();
      },
    );
  };

  // Until the upload finishes, the message holds a path on the sender's
  // device. The sender can still show it; anyone else gets a placeholder.
  const remote = isRemoteUri(uri);
  const canDisplay = remote || (isOwn && !failed);

  if (!canDisplay) {
    return (
      <View style={[styles.thumbnail, styles.placeholder]}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setVisible(true)}
        onLongPress={remote ? showImageActions : undefined}
      >
        <ExpoImage
          style={styles.thumbnail}
          source={{ uri }}
          contentFit="cover"
          cachePolicy="memory-disk"
          onError={() => setFailed(true)}
        />
        {pending && !remote && (
          <View style={[styles.thumbnail, styles.uploadingOverlay]}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
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
          <Viewer
            uri={uri}
            onClose={close}
            onSave={remote ? save : undefined}
          />
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 13,
    margin: 3,
  },
  placeholder: {
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
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
  viewerButtons: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    gap: 12,
  },
  viewerButton: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    // Strong shadow so the buttons stand out on light images too
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
});

export default ChatMessageImage;

import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Text from "@/components/Text";

const GOLD = "#DAB769";
const SHOW_DURATION = 180;
const HOLD_DURATION = 1300;
const HIDE_DURATION = 220;

// "loading" stays up until the next toast replaces it
type ToastType = "success" | "error" | "loading";
type ToastMessage = { id: number; text: string; type: ToastType };
type Listener = (message: ToastMessage) => void;

// Each mounted <ToastHost /> registers here; only the most recent one shows
// the toast. A host inside a full-screen Modal mounts after the app's root
// host, so toasts appear above the Modal while it is open.
const hosts: Listener[] = [];
let nextId = 0;

/** Shows a short message in the middle of the screen that hides by itself. */
export const showToast = (text: string, type: ToastType = "success") => {
  hosts[hosts.length - 1]?.({ id: ++nextId, text, type });
};

export const ToastHost: React.FC = () => {
  const [message, setMessage] = useState<ToastMessage | null>(null);
  const progress = useSharedValue(0);
  const latestId = useRef(0);

  useEffect(() => {
    const listener: Listener = (next) => {
      latestId.current = next.id;
      setMessage(next);
    };
    hosts.push(listener);
    return () => {
      const index = hosts.indexOf(listener);
      if (index !== -1) hosts.splice(index, 1);
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    const id = message.id;
    const clear = () => {
      // A newer toast may have replaced this one while it was fading out
      if (latestId.current === id) setMessage(null);
    };
    // Starts from the current value, so replacing a visible toast
    // (e.g. "Saving…" -> "Saved") doesn't flash
    const show = withTiming(1, {
      duration: SHOW_DURATION,
      easing: Easing.out(Easing.cubic),
    });
    if (message.type === "loading") {
      progress.value = show;
      return;
    }
    progress.value = withSequence(
      show,
      withDelay(
        HOLD_DURATION,
        withTiming(
          0,
          { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) },
          (finished) => {
            if (finished) runOnJS(clear)();
          },
        ),
      ),
    );
  }, [message, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.92 + 0.08 * progress.value }],
  }));

  if (!message) return null;

  const isError = message.type === "error";

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View
        style={[styles.card, animatedStyle]}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
      >
        <View style={[styles.iconRing, isError && styles.iconRingError]}>
          {message.type === "loading" ? (
            <ActivityIndicator color={GOLD} />
          ) : (
            <MaterialCommunityIcons
              name={isError ? "close" : "check"}
              size={26}
              color={isError ? "#E5E5E5" : GOLD}
            />
          )}
        </View>
        <Text
          size="p"
          weight="medium"
          color="#FBF6FA"
          style={styles.text}
          numberOfLines={2}
        >
          {message.text}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    elevation: 9999,
  },
  card: {
    minWidth: 132,
    maxWidth: 220,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(18, 18, 17, 0.94)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(218, 183, 105, 0.35)",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  iconRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: GOLD,
    backgroundColor: "rgba(218, 183, 105, 0.08)",
  },
  iconRingError: {
    borderColor: "#5A5A5A",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  text: {
    textAlign: "center",
  },
});

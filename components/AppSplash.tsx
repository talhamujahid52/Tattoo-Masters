import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { isSplashVisible, subscribeSplash } from "@/utils/splash";

const LOGO = require("../assets/images/logo.png");

// Fraction of the screen width the logo should span.
const LOGO_WIDTH_RATIO = 0.88;
const FADE_OUT_MS = 350;

/**
 * Full-screen splash shown on Android while the app initializes.
 *
 * Android 12+ renders the native launch splash as a small icon inside a
 * system-enforced circle, so a near-edge-to-edge logo is impossible there.
 * This overlay takes over as soon as JS mounts and fades out when
 * `hideSplash()` is called. iOS already shows the full-size logo natively.
 */
export default function AppSplash() {
  const [mounted, setMounted] = useState(isSplashVisible());
  const opacity = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();

  useEffect(() => {
    return subscribeSplash((visible) => {
      if (visible) return;
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }).start(() => setMounted(false));
    });
  }, [opacity]);

  if (Platform.OS !== "android" || !mounted) return null;

  const size = Math.round(width * LOGO_WIDTH_RATIO);

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.container, { opacity }]}
    >
      <Image
        source={LOGO}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    elevation: 1000,
  },
});

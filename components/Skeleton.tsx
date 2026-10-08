import React, { useEffect } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  style?: StyleProp<ViewStyle>;
}

// Placeholder block with a soft pulse. Size it via `style` to match the
// content it stands in for so nothing shifts when the content arrives.
const Skeleton = ({ style }: SkeletonProps) => {
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.base, style, animatedStyle]} />;
};

export default Skeleton;

const styles = StyleSheet.create({
  base: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: 4,
  },
});

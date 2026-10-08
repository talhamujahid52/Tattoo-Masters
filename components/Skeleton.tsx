import React, { useEffect, useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  style?: StyleProp<ViewStyle>;
}

// Dim placeholder fill for dark screens. Matches the empty-tile colour in
// ImageGallery so a placeholder and a still-loading image look the same.
export const SKELETON_DIM_COLOR = "#202020";

// Soft pulse shared by every placeholder. Apply it to one wrapper around a
// group of static blocks rather than to each block, so the group stays in
// sync and only one animation runs.
export const useSkeletonPulse = () => {
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  return useAnimatedStyle(() => ({ opacity: opacity.value }));
};

// Placeholder block with a soft pulse. Size it via `style` to match the
// content it stands in for so nothing shifts when the content arrives.
const Skeleton = ({ style }: SkeletonProps) => {
  const animatedStyle = useSkeletonPulse();

  return <Animated.View style={[styles.base, style, animatedStyle]} />;
};

export default Skeleton;

interface SkeletonRevealProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}

// Lays `skeleton` over `children` while loading, then cross-fades to the
// content. The content is mounted the whole time and owns the layout, so the
// swap cannot move anything around it.
export const SkeletonReveal = ({
  loading,
  skeleton,
  children,
}: SkeletonRevealProps) => {
  const reveal = useSharedValue(loading ? 0 : 1);
  const [skeletonMounted, setSkeletonMounted] = useState(loading);

  useEffect(() => {
    if (loading) {
      setSkeletonMounted(true);
      reveal.value = 0;
      return;
    }
    reveal.value = withTiming(
      1,
      { duration: 280, easing: Easing.out(Easing.quad) },
      (finished) => {
        if (finished) runOnJS(setSkeletonMounted)(false);
      }
    );
  }, [loading, reveal]);

  const contentStyle = useAnimatedStyle(() => ({ opacity: reveal.value }));
  const skeletonStyle = useAnimatedStyle(() => ({ opacity: 1 - reveal.value }));

  return (
    <View>
      <Animated.View
        style={contentStyle}
        pointerEvents={loading ? "none" : "auto"}
      >
        {children}
      </Animated.View>
      {skeletonMounted && (
        <Animated.View
          style={[styles.overlay, skeletonStyle]}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {skeleton}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: 4,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});

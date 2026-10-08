import React from "react";
import { DimensionValue, StyleSheet, View, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { SKELETON_DIM_COLOR, useSkeletonPulse } from "@/components/Skeleton";

interface BarProps {
  width: DimensionValue;
  height: number;
  radius?: number;
  style?: ViewStyle;
}

const Bar = ({ width, height, radius = 4, style }: BarProps) => (
  <View
    style={[styles.bar, { width, height, borderRadius: radius }, style]}
  />
);

// Stand-in for the artist profile header while the artist document loads,
// for example when the profile is opened from a shared link and is not in the
// store yet. Mirrors the real header's rows and spacing (see ArtistProfile)
// so the content lands roughly where its placeholder was.
const ArtistProfileSkeleton = () => {
  const pulseStyle = useSkeletonPulse();

  return (
    <Animated.View
      style={[styles.container, pulseStyle]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Picture, name, studio and city */}
      <View style={styles.profileRow}>
        <View style={styles.avatar} />
        <View style={styles.nameColumn}>
          <Bar width={150} height={20} />
          <Bar width={96} height={13} />
          <Bar width={72} height={13} />
        </View>
      </View>

      {/* Favorites count */}
      <View style={styles.row}>
        <Bar width={20} height={20} radius={10} />
        <Bar width={28} height={13} />
      </View>

      {/* Tattoo styles */}
      <View style={styles.row}>
        <Bar width={24} height={24} radius={6} />
        {[64, 88, 56, 76].map((width, index) => (
          <Bar key={index} width={width} height={22} radius={6} />
        ))}
      </View>

      {/* About */}
      <View style={styles.paragraph}>
        <Bar width="100%" height={13} />
        <Bar width="100%" height={13} />
        <Bar width="55%" height={13} />
      </View>

      {/* Favorite and Message buttons */}
      <View style={[styles.row, styles.buttonRow]}>
        <Bar width="48%" height={36} radius={20} />
        <Bar width="48%" height={36} radius={20} />
      </View>

      {/* Reviews */}
      <View style={styles.reviews}>
        <View style={styles.spaceBetween}>
          <Bar width={80} height={18} />
          <Bar width={130} height={15} />
        </View>
        <View style={styles.row}>
          <Bar width={24} height={24} radius={12} />
          <Bar width={110} height={13} />
        </View>
      </View>

      {/* Address and map */}
      <View style={styles.address}>
        <Bar width={80} height={18} />
        <Bar width="70%" height={13} />
        <Bar width="100%" height={130} radius={20} style={styles.map} />
      </View>

      {/* Portfolio title and style filters */}
      <Bar width={90} height={18} style={styles.portfolioTitle} />
      <View style={[styles.row, styles.filters]}>
        {[36, 64, 72, 58].map((width, index) => (
          <Bar key={index} width={width} height={30} radius={6} />
        ))}
      </View>
    </Animated.View>
  );
};

export default ArtistProfileSkeleton;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16,
  },
  bar: {
    backgroundColor: SKELETON_DIM_COLOR,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    minHeight: 82,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: SKELETON_DIM_COLOR,
  },
  nameColumn: {
    flex: 1,
    justifyContent: "space-around",
    alignSelf: "stretch",
    paddingVertical: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  spaceBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paragraph: {
    gap: 8,
  },
  buttonRow: {
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviews: {
    gap: 12,
  },
  address: {
    marginTop: 8,
    gap: 10,
  },
  map: {
    marginTop: 4,
  },
  portfolioTitle: {
    marginTop: 8,
  },
  filters: {
    gap: 10,
    marginBottom: 16,
  },
});

import React, { FC } from "react";
import { Text as RNText, TextStyle } from "react-native";

interface TextProps {
  size?: "h1" | "h2" | "h3" | "h4" | "p" | "small" | "medium" | "large"| "profileName";
  weight?: "normal" | "bold" | "bolder" | "light" | "medium" | "semibold";
  color?: string;
  font?: string; // Optional if you want to specify custom fonts
  children: React.ReactNode;
  style?: TextStyle; // Allow additional styles to be passed in
}

// Custom Text component
const Text: FC<TextProps> = ({
  size = "p",
  weight = "normal",
  color = "black",
  font, // Optional
  children,
  style, // New prop for additional styles
}) => {
  // Define the size mapping
  const sizeMap: Record<string, number> = {
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 17,
    p: 16,
    large: 14,
    medium: 13,
    small: 12,
    profileName:20
  };

  // Define a weight mapping
  const weightMap: Record<string, TextStyle["fontWeight"]> = {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    bolder: "800",
  };

  // Get the corresponding weight value
  const resolvedWeight = weightMap[weight] || "400";

  // Set the base style object
  const baseStyle: TextStyle = {
    fontSize: sizeMap[size] || sizeMap.p,
    fontWeight: resolvedWeight,
    color,
    // Optionally include fontFamily if needed
  };

  // Combine baseStyle with any additional styles
  const combinedStyle = [baseStyle, style]; // React Native accepts an array of styles

  return <RNText style={combinedStyle}>{children}</RNText>;
};

export default Text;

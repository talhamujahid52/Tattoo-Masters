import { normalize } from "@/utils/helperFunctions";
import React, { FC } from "react";
import { Text as RNText, TextStyle, TextProps as RNTextProps } from "react-native";

interface TextProps extends RNTextProps {
  size?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "p"
    | "small"
    | "medium"
    | "large"
    | "profileName";
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
  ...props // Capture any other props like `numberOfLines`, `ellipsizeMode`
}) => {
  // Define the size mapping
  const sizeMap: Record<string, number> = {
    h1: normalize(32),
    h2: normalize(28),
    h3: normalize(24),
    h4: normalize(17),
    p: normalize(16),
    large: normalize(14),
    medium: normalize(13),
    small: normalize(12),
    profileName: normalize(20),
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

  return <RNText style={combinedStyle} {...props}>{children}</RNText>;
};

export default Text;

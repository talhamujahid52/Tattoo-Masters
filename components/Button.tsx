import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { RadialGradient } from "react-native-gradients";
import Text from "./Text";

interface ButtonProps {
  title: string | React.ReactElement;
  onPress?: (event: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

const Button = ({
  title = "Let's go",
  onPress,
  loading,
  disabled,
  variant = "primary",
}: ButtonProps) => {
  const isPrimary = variant === "primary";

  const colorList = [
    { offset: "0%", color: "#FFD982", opacity: "1" },
    { offset: "100%", color: "#927639", opacity: "1" },
  ];

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, !isPrimary && styles.secondaryButton]}
    >
      {isPrimary && (
        <View style={styles.gradientContainer}>
          <RadialGradient
            x="53.8%"
            y="50%"
            rx="46.2%"
            ry="307.19%"
            colorList={colorList}
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={isPrimary ? "black" : "white"} />
      ) : typeof title === "string" ? (
        <Text
          size="h4"
          weight="semibold"
          color={isPrimary ? "#22221F" : "#A7A7A7"}
        >
          {title}
        </Text>
      ) : (
        title
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    width: "100%",
    borderRadius: 30,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  gradientContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    backgroundColor: "#927639",
  },
  secondaryButton: {
    backgroundColor: "#444444",
  },
});

export default Button;

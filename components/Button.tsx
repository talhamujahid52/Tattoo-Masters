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
}

const Button = ({
  title = "Let's go",
  onPress,
  loading,
  disabled,
}: ButtonProps) => {
  const colorList = [
    { offset: "0%", color: "#FFD982", opacity: "1" },
    { offset: "100%", color: "#927639", opacity: "1" },
  ];

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={styles.button}
    >
      <View style={[styles.gradientContainer, disabled && styles.disabled]}>
        <RadialGradient
          x="53.8%" // Center position (horizontal)
          y="50%" // Center position (vertical)
          rx="46.2%" // Horizontal radius
          ry="307.19%" // Vertical radius
          colorList={!disabled ? colorList : []}
        />
      </View>
      {loading ? (
        <ActivityIndicator color={"black"} />
      ) : (
        <Text size="h4" weight="semibold">
          {title}
        </Text>
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
  disabled: {
    // backgroundColor: "grey",
  },
});

export default Button;

import React from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { RadialGradient } from "react-native-gradients";
import Text from "./Text";

interface ButtonProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
}

const Button = ({ title = "Let's go", onPress }: ButtonProps) => {
  const colorList = [
    { offset: "0%", color: "#FFD982", opacity: "1" },
    { offset: "100%", color: "#927639", opacity: "1" },
  ];

  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <View style={styles.gradientContainer}>
        <RadialGradient
          x="53.8%" // Center position (horizontal)
          y="50%" // Center position (vertical)
          rx="46.2%" // Horizontal radius
          ry="307.19%" // Vertical radius
          colorList={colorList}
        />
      </View>
      <Text size="h4" weight="semibold">
        {title}
      </Text>
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
  },
});

export default Button;
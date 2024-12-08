import React from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import Text from "./Text";

interface ButtonProps {
  title: string;
  icon: any;
  variant: "Primary" | "Secondary";
  onPress?: (event: GestureResponderEvent) => void;
}

const IconButton = ({
  title = "Let's go",
  icon,
  variant,
  onPress,
}: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: variant === "Primary" ? "#262526" : "#DAB769" },
      ]}
    >
      <Image style={styles.icon} source={icon} />
      <Text
        size="h4"
        weight="medium"
        color={variant === "Primary" ? "#D7D7C9" : "#22221F"}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 36,
    borderRadius: 20,
    display: "flex",
    flex: 1 / 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    height: 15,
    width: 15,
    resizeMode: "contain",
  },
});

export default IconButton;

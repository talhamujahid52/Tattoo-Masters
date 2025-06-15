import React from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
} from "react-native";
import Text from "./Text";

interface ButtonProps {
  title: string;
  icon: any;
  iconStyle?: any;
  variant: "Primary" | "Secondary";
  onPress?: (event: GestureResponderEvent) => void;
}

const IconButton = ({
  title = "Let's go",
  icon,
  iconStyle,
  variant,
  onPress,
}: ButtonProps) => {
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    return <Image style={iconStyle ? iconStyle : styles.icon} source={icon} />;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: variant === "Primary" ? "#262526" : "#DAB769" },
      ]}
    >
      {renderIcon()}
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

import React from "react";
import {
  GestureResponderEvent,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import Text from "./Text";

interface ButtonProps {
  title: string;
  icon?: ImageSourcePropType;
  iconElement?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
}

const ThirdPartyLoginButton = ({
  title = "Google",
  icon,
  iconElement,
  onPress,
}: ButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      {iconElement || (icon && <Image style={styles.Image} source={icon} />)}
      <Text size="p" weight="normal" color="#FBF6FA">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    gap: 8,
    height: 50,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A291AA",
  },
  Image: {
    height: 20,
    width: 20,
    resizeMode: "contain",
  },
});

export default ThirdPartyLoginButton;

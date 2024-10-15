import React from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View,
} from "react-native";

interface ButtonProps {
  title: string;
  icon?: any;
  onPress?: (event: GestureResponderEvent) => void;
}

const ThirdPartyButton = ({ title = "Google", icon, onPress }: ButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Image style={styles.Image} source={icon} />
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    height: 50,
    width: 110,
    borderRadius: 30,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A291AA",
  },
  Image: {
    height: 20,
    width: 20,
  },
  buttonText: {
    color: "#FBF6FA",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 20.8,
  },
});

export default ThirdPartyButton;

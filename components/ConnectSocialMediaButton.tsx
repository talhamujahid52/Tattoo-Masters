import React from "react";
import {
  View,
  GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import Text from "./Text";

interface ButtonProps {
  title: string;
  icon?: any;
  isConnected?: boolean;
  onConnect?: (event: GestureResponderEvent) => void;
  onDisconnect?: (event: GestureResponderEvent) => void;
}

const ConnectSocialMediaButton = ({
  title = "Google",
  isConnected = false,
  icon,
  onConnect,
  onDisconnect,
}: ButtonProps) => {
  return isConnected ? (
    <View style={styles.button}>
      <View style={styles.iconAndTitle}>
        <Image style={styles.Image} source={icon} />
        <Text size="p" weight="normal" color="#A7A7A7">
          {title}
        </Text>
      </View>
      <TouchableOpacity onPress={onDisconnect}>
        <Text size="p" weight="semibold" color="#FBF6FA">
          Disconnect
        </Text>
      </TouchableOpacity>
    </View>
  ) : (
    <TouchableOpacity onPress={onConnect} style={styles.button}>
      <View style={styles.iconAndTitle}>
        <Image style={styles.Image} source={icon} />
        <Text size="p" weight="semibold" color="#FBF6FA">
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 0.48,
    display: "flex",
    flexDirection: "row",
    height: 50,
    borderRadius: 30,
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A291AA",
    paddingHorizontal: 16,
  },
  iconAndTitle: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  Image: {
    height: 20,
    width: 20,
    resizeMode: "contain",
  },
});

export default ConnectSocialMediaButton;

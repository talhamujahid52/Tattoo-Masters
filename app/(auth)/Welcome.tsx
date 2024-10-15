import Button from "@/components/Button";
import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const Welcome = () => {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#23221F", "#000000"]} // Define the gradient colors
        style={styles.gradient}
        start={{ x: 0, y: 0 }} // Start from the top
        end={{ x: 0, y: 1 }} // End at the bottom
      />
      <Image
        source={require("../../assets/images/welcome.png")}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.buttonContainer}>
        <Button
          title="Let's go"
          onPress={() => {
            router.push({
              pathname: "/(auth)/Login",
            });
          }}
        />
      </View>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Ensure the overlay is above the first gradient
  },
  image: {
    height: "100%",
    width: "100%",
  },
  buttonContainer: {
    paddingHorizontal: 24,
    zIndex: 10,
    width: "100%",
    position: "absolute",
    bottom: 50,
  },
});

import Button from "@/components/Button";
import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { router } from "expo-router";
// import { LinearGradient } from "expo-linear-gradient";
import OnboardingComponent from "@/components/OnboardingComponent";

const Welcome = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#23221F",
      }}
    >
      <Image
        source={require("../../assets/images/welcome.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      {/* <LinearGradient */}
      {/*   style={styles.gradientOverlay} */}
      {/*   locations={[0, 0.17, 0.89]} */}
      {/*   colors={["rgba(25, 25, 23, 0.2)", "rgba(25, 25, 23, 0.3)", "#171715"]} */}
      {/* /> */}
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="cover"
      />
      <OnboardingComponent />
      <View style={styles.buttonContainer}>
        <Button
          title="Let's go"
          onPress={() => {
            router.push({
              pathname: "/Login",
            });
          }}
        />
      </View>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  backgroundImage: {
    height: "100%",
    width: "100%",
  },
  logo: {
    // position: "absolute",
    width: 253,
    height: 218,
    position: "absolute",
    top: "34%",
    right: "auto",
    zIndex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    zIndex: 1,
    width: "100%",
    position: "absolute",
    bottom: 50,
  },
  textContainer: {
    position: "absolute",
    top: "64%",
    right: "auto",
    zIndex: 1,
    paddingHorizontal: 30,
  },
  whiteText: {
    color: "#fbf6fa",
    fontSize: 32,
    fontWeight: "300",
  },
  coloredText: {
    color: "#FFD982",
    fontSize: 32,
    fontWeight: "300",
  },
  searchArtistsWorldwide: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "400",
    color: "#d0d0d0",
    textAlign: "center",
    marginTop: 16,
  },
});

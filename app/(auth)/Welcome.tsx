import Button from "@/components/Button";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View, Image } from "react-native";
import { Redirect, SplashScreen, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import OnboardingComponent from "@/components/OnboardingComponent";
import { StatusBar } from "expo-status-bar";
import { useDispatch, useSelector } from "react-redux";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { AppDispatch, RootState } from "@/redux/store";
import { setUser } from "@/redux/slices/userSlice";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const SCREEN_HEIGHT = Dimensions.get("window").height;
const Welcome = () => {
  const insets = useSafeAreaInsets();
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
      <LinearGradient
        style={styles.gradientOverlay}
        locations={[0, 0.17, 0.89]}
        colors={["rgba(25, 25, 23, 0.2)", "rgba(25, 25, 23, 0.3)", "#171715"]}
      />
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="cover"
      />
      <OnboardingComponent />
      <View style={[styles.buttonContainer, { bottom: insets.bottom + 25 }]}>
        <Button
          title="Let's go"
          onPress={() => {
            router.push({
              pathname: "/(bottomTabs)/Home",
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
    top: SCREEN_HEIGHT * 0.2,
    right: "auto",
    zIndex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    zIndex: 1,
    width: "100%",
    position: "absolute",
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

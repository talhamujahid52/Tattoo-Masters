import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ThirdPartyButton from "@/components/ThirdPartyLoginButton";
import { router } from "expo-router";

const Registration = () => {
  return (
    <View style={styles.Container}>
      <Image
        style={styles.Logo}
        source={require("../../assets/images/logo.png")}
      />
      <Text style={styles.PageTitle}>Registration</Text>
      <View style={styles.Row}>
        <Text style={styles.Col1}>Already have an account?</Text>
        <Text style={styles.Col2}> Login here.</Text>
      </View>
      <View style={styles.InputContainer}>
        <Input inputMode="text" placeholder="Full Name"></Input>
        <Input inputMode="email" placeholder="Email address"></Input>
        <Input inputMode="tel" placeholder="Phone Number"></Input>
        <Input inputMode="password" placeholder="Create Password"></Input>
        <Input inputMode="password" placeholder="Confirm Password"></Input>
      </View>
      <Button
        title="Register"
        onPress={() => {
          router.push({
            pathname: "/(auth)/Registration",
          });
        }}
      />
      <View style={styles.SpacerContainer}>
        <View style={styles.Spacer}></View>
        <Text style={styles.SpacerText}>Or continue with</Text>
        <View style={styles.Spacer}></View>
      </View>
      <View style={styles.ThirdPartyButtonsContainer}>
        <ThirdPartyButton
          title="Google"
          icon={require("../../assets/images/Google.png")}
        />
        <ThirdPartyButton
          title="X"
          icon={require("../../assets/images/X.png")}
        />
        <ThirdPartyButton
          title="Apple ID"
          icon={require("../../assets/images/Apple.png")}
        />
      </View>
      <View style={styles.BottomText}>
        <Text style={styles.TermsofServiceText}>
          By clicking continue, you agree to our
        </Text>
        <View style={styles.TermsOfServiceContainer}>
          <Text style={styles.HighlitedText}>Terms of Service</Text>
          <Text style={styles.TermsofServiceText}> and </Text>
          <Text style={styles.HighlitedText}>Privacy Policy</Text>
        </View>
      </View>
    </View>
  );
};

export default Registration;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: "#000",
    // justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  Logo: {
    height: 120,
    width: 120,
    resizeMode: "contain",
  },
  PageTitle: {
    fontSize: 28,
    fontWeight: "500",
    lineHeight: 33.41,
    color: "#FBF6FA",
  },
  Row: {
    paddingTop: 8,
    display: "flex",
    flexDirection: "row",
    fontSize: 16,
    lineHeight: 20.8,
  },
  Col1: {
    color: "#A7A7A7",
    fontWeight: "400",
  },
  Col2: {
    color: "#FBF6FA",
    fontWeight: "600",
  },
  InputContainer: {
    paddingVertical: 24,
    display: "flex",
    flexDirection: "column",
    rowGap: 16,
  },
  SpacerContainer: {
    height: 21,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
    gap: 8,
  },
  SpacerText: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 20.8,
    color: "#A7A7A7",
  },
  Spacer: {
    width: 102,
    height: 1,
    backgroundColor: "#E6E6E6",
  },
  ThirdPartyButtonsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  BottomText: {
    marginTop: 24,
  },
  TermsOfServiceContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  HighlitedText: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 14.32,
    color: "#FBF6FA",
  },
  TermsofServiceText: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 14.32,
    color: "#828282",
  },
});

import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ThirdPartyButton from "@/components/ThirdPartyLoginButton";
import { router } from "expo-router";

const Login = () => {
  return (
    <View style={styles.Container}>
      <Image
        style={styles.Logo}
        source={require("../../assets/images/logo.png")}
      />
      <Text style={styles.PageTitle}>Login</Text>
      <View style={styles.Row}>
        <Text style={styles.Col1}>Don’t have an account?</Text>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/(auth)/Register",
            });
          }}
        >
          <Text style={styles.Col2}> Register here.</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.InputContainer}>
        <Input inputMode="email" placeholder="Email address"></Input>
        <Input inputMode="password" placeholder="Password"></Input>
      </View>
      <View style={styles.ForgotPasswordContainer}>
        <TouchableOpacity>
          <Text style={styles.Col2}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
      <Button
        title="Login"
        onPress={() => {
          router.push({
            pathname: "/(auth)/Register",
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

export default Login;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  Logo: {
    height: 250,
    width: 250,
    resizeMode: "contain",
  },
  PageTitle: {
    fontSize: 28,
    fontWeight: "500",
    lineHeight: 33.41,
    color: "#FBF6FA",
    marginTop: 24,
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
    paddingTop: 24,
    display: "flex",
    flexDirection: "column",
    rowGap: 16,
  },
  ForgotPasswordContainer: {
    paddingTop: 8,
    paddingBottom: 24,
    width: "90%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  ForgotPassword: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 15.51,
    color: "#FBF6FA",
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

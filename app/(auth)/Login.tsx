import React from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ThirdPartyButton from "@/components/ThirdPartyLoginButton";
import { router } from "expo-router";
import Text from "@/components/Text";

const Login = () => {
  return (
    <View style={styles.Container}>
      <Image
        style={styles.Logo}
        source={require("../../assets/images/logo.png")}
      />
      <Text size="h2" weight="medium" color="#FBF6FA" style={styles.PageTitle}>
        Login
      </Text>
      <View style={styles.Row}>
        <Text size="p" weight="normal" color="#A7A7A7">
          Don’t have an account?
        </Text>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/(auth)/Register",
            });
          }}
        >
          <Text size="p" weight="semibold" color="#FBF6FA">
            {" "}
            Register here.
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.InputContainer}>
        <Input inputMode="email" placeholder="Email address"></Input>
        <Input inputMode="password" placeholder="Password"></Input>
      </View>
      <View style={styles.ForgotPasswordContainer}>
        <TouchableOpacity>
          <Text size="medium" weight="semibold" color="#FBF6FA">
            Forgot password?
          </Text>
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
        <Text size="p" weight="normal" color="#A7A7A7">
          Or continue with
        </Text>
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
        <Text size="small" weight="normal" color="#828282">
          By clicking continue, you agree to our
        </Text>
        <View style={styles.TermsOfServiceContainer}>
          <Text size="small" weight="normal" color="#FBF6FA">
            Terms of Service
          </Text>
          <Text size="small" weight="normal" color="#828282">
            {" "}
            and{" "}
          </Text>
          <Text size="small" weight="normal" color="#FBF6FA">
            Privacy Policy
          </Text>
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
    marginTop: 24,
  },
  Row: {
    paddingTop: 8,
    display: "flex",
    flexDirection: "row",
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
});

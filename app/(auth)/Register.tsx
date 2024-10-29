import React from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import Input from "@/components/Input";
import PhoneInput from "@/components/PhoneCustomInput";
import Button from "@/components/Button";
import ThirdPartyButton from "@/components/ThirdPartyLoginButton";
import Text from "@/components/Text";
import { router } from "expo-router";

const Register = () => {
  return (
    <View style={styles.Container}>
      <Image
        style={styles.Logo}
        source={require("../../assets/images/logo.png")}
      />
      <Text style={styles.PageTitle}>Registration</Text>
      <View style={styles.Row}>
        <Text size="p" weight="normal" color="#A7A7A7">
          Already have an account?
        </Text>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/(auth)/Login",
            });
          }}
        >
          <Text size="p" weight="semibold" color="#FBF6FA">
            {" "}
            Login here.
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.InputContainer}>
        <Input inputMode="text" placeholder="Full Name"></Input>
        <Input inputMode="email" placeholder="Email address"></Input>
        <PhoneInput></PhoneInput>
        <Input inputMode="password" placeholder="Create Password"></Input>
        <Input inputMode="password" placeholder="Confirm Password"></Input>
      </View>
      <Button
        title="Register"
        onPress={() => {
          router.push({
            pathname: "/(auth)/Verification",
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

export default Register;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: "#000",
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

import React, { useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import Input from "@/components/Input";
import PhoneInput from "@/components/PhoneCustomInput";
import Button from "@/components/Button";
import ThirdPartyLoginButton from "@/components/ThirdPartyLoginButton";
import Text from "@/components/Text";
import { router } from "expo-router";
import auth from "@react-native-firebase/auth";

const Register: React.FC = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const formatPhoneNumber = (): string => {
    // Combine the country code and phone number
    return `${countryCode ? `${countryCode}` : ""} ${phone}`.trim();
  };

  const validateEmail = (email: string) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleRegister = async () => {
    const fullPhoneNumber = formatPhoneNumber();

    console.log("Full Name:", fullName);
    console.log("Email:", email);
    console.log("countryCode :", countryCode); // Log formatted phone number
    console.log("phone :", phone); // Log formatted phone number

    console.log("Phone Number:", fullPhoneNumber); // Log formatted phone number
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);

    if (!validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      await userCredential.user.sendEmailVerification();
      // Handle successful registration, e.g., navigate to verification
      router.push({ pathname: "/(auth)/Verification" });

      alert("Verification email sent. Please check your inbox.");
    } catch (error: any) {
      // Assert the error type to 'any'
      if (error && error.code && error.message) {
        alert(error.message); // Use the error message from Firebase
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

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
          onPress={() => router.push({ pathname: "/(auth)/Login" })}
        >
          <Text size="p" weight="semibold" color="#FBF6FA">
            {" "}
            Login here.
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.InputContainer}>
        <Input
          inputMode="text"
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />
        <Input
          inputMode="email"
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
        />
        <PhoneInput
          value={phone}
          onChange={(phoneNumber, code) => {
            setPhone(phoneNumber);
            setCountryCode(code); // Capture country code
          }}
        />
        <Input
          inputMode="password"
          placeholder="Create Password"
          value={password}
          onChangeText={setPassword}
        />
        <Input
          inputMode="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>
      <Button title="Register" onPress={handleRegister} />
      <View style={styles.SpacerContainer}>
        <View style={styles.Spacer}></View>
        <Text size="p" weight="normal" color="#A7A7A7">
          {" "}
          Or continue with{" "}
        </Text>
        <View style={styles.Spacer}></View>
      </View>
      <View style={styles.ThirdPartyLoginButtonsContainer}>
        <ThirdPartyLoginButton
          title="Google"
          icon={require("../../assets/images/Google.png")}
        />
        <ThirdPartyLoginButton
          title="Facebook"
          icon={require("../../assets/images/facebook.png")}
          onPress={() => {
            alert(
              "Login with Facebook is currently unavailable. We're working on it and it will be available soon!"
            );
          }}
        />
      </View>
      <View style={styles.BottomText}>
        <Text size="small" weight="normal" color="#828282">
          {" "}
          By clicking continue, you agree to our{" "}
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
  ThirdPartyLoginButtonsContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
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

import React, { useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import Input from "@/components/Input";
import PhoneInput from "@/components/PhoneCustomInput";
import Button from "@/components/Button";
import ThirdPartyLoginButton from "@/components/ThirdPartyLoginButton";
import Text from "@/components/Text";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "@/utils/firebase/userFunctions";
import firestore from "@react-native-firebase/firestore";
import { useSignInWithGoogle } from "@/hooks/useSignInWithGoogle";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import auth from "@react-native-firebase/auth";

const Register: React.FC = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const signInWithGoogle = useSignInWithGoogle();

  const formatPhoneNumber = (): string => {
    const cleanedNumber = phone.replace(/\s/g, ""); // Remove all spaces from number
    return `${countryCode ? `${countryCode}` : ""} ${cleanedNumber}`.trim();
  };

  const validateEmail = (email: string) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleRegister = async () => {
    const fullPhoneNumber = formatPhoneNumber();

    console.log("Full Name:", fullName);
    console.log("Email:", email);
    console.log("Country Code:", countryCode);
    console.log("Phone:", phone);
    console.log("Phone Number:", fullPhoneNumber);
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
      const userCredential = await createUserWithEmailAndPassword(
        email,
        password
      );

      const user = userCredential.user;
      await firestore().collection("Users").doc(user.uid).set({
        uid: user.uid,
        name: fullName,
        email: user.email,
        phoneNumber: fullPhoneNumber,
        profilePicture: "",
        followedArtists: [],
        likedTattoos: [],
        isArtist: false,
        createdAt: firestore.FieldValue.serverTimestamp(), // Add timestamp for user creation
      });

      await user.sendEmailVerification();
      await auth().signOut();
      router.replace({ pathname: "/(auth)/EmailVerification" });
    } catch (error: any) {
      if (error && error.code && error.message) {
        alert(error.message);
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.Container}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, flex: 1, alignItems: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          style={styles.Logo}
          source={require("../../assets/images/logo.png")}
        />
        <Text style={styles.PageTitle}>Register</Text>
        <View style={styles.Row}>
          <Text size="p" weight="normal" color="#A7A7A7">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace({ pathname: "/(auth)/Login" })}
          >
            <Text size="p" weight="semibold" color="#FBF6FA">
              Login here.
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.InputContainer}>
          <Input
            inputMode="text"
            placeholder="Full name"
            isNameField
            textInputProps={{ autoCorrect: false }}
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
            placeholder="Create password"
            value={password}
            onChangeText={setPassword}
          />
          <Input
            inputMode="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
        <Button title="Register" onPress={handleRegister} />
        <View style={styles.SpacerContainer}>
          <View style={styles.Spacer}></View>
          <Text size="p" weight="normal" color="#A7A7A7">
            Or continue with
          </Text>
          <View style={styles.Spacer}></View>
        </View>
        <View style={styles.ThirdPartyLoginButtonsContainer}>
          <ThirdPartyLoginButton
            title="Google"
            icon={require("../../assets/images/Google.png")}
            onPress={signInWithGoogle}
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
            By clicking continue, you agree to our
          </Text>
          <View style={styles.TermsOfServiceContainer}>
            <TouchableOpacity
              onPress={() => {
                router.push("/(auth)/TermsOfService");
              }}
            >
              <Text size="small" weight="normal" color="#FBF6FA">
                Terms of Service
              </Text>
            </TouchableOpacity>
            <Text size="small" weight="normal" color="#828282">
              {" "}
              and{" "}
            </Text>
            <TouchableOpacity
              onPress={() => {
                router.push("/(auth)/PrivacyPolicy");
              }}
            >
              <Text size="small" weight="normal" color="#FBF6FA">
                Privacy Policy.
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: "#000",
    alignItems: "center",
  },
  Logo: {
    height: 151,
    width: 175,
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
    flex: 1,
    height: 1,
    backgroundColor: "#454545",
  },
  ThirdPartyLoginButtonsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
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

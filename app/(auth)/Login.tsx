import React, { useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ThirdPartyButton from "@/components/ThirdPartyLoginButton";
import { router } from "expo-router";
import Text from "@/components/Text";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId:
    "828691216515-im3vbghoggs7g5oplhog6vkepnfg64pb.apps.googleusercontent.com",
});

const Login = () => {
  const [email, setEmail] = useState<string>(""); // State for email input
  const [password, setPassword] = useState<string>(""); // State for password input
  const [emailError, setEmailError] = useState<string>(""); // State for email error

  const validateEmail = (input: string): boolean => {
    // Basic email validation regex
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(input);
  };

  const handleEmailChange = (input: string) => {
    setEmail(input);
    if (!validateEmail(input)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handleLoginClick = async () => {
    if (emailError) return; // Prevent login if there's an email error

    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password
      ); // Use user input for login
      const user = userCredential.user;

      // Check if the email is verified
      if (user.emailVerified) {
        router.push({
          pathname: "/(bottomTabs)/Home",
        });
        console.log("User signed in!");
      } else {
        alert("Please verify your email before logging in.");
        console.log("Email is not verified.");
        await auth().signOut(); // Optionally sign out the user
      }
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        alert("No user found with this email!");
        console.log("No user found with this email!");
      } else if (error.code === "auth/wrong-password") {
        alert("Incorrect password!");
        console.log("Incorrect password!");
      } else {
        alert(error.message); // Display a general error message
        console.error(error);
      }
    }
  };
  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo: any = await GoogleSignin.signIn();
      console.log("User Info:", userInfo);

      const idToken: string = userInfo.data.idToken as string;
      if (!idToken) {
        const accessToken: string = userInfo.accessToken as string;
        const googleCredential = auth.GoogleAuthProvider.credential(
          null,
          accessToken
        );
        await auth().signInWithCredential(googleCredential);
      } else {
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        await auth().signInWithCredential(googleCredential);
      }

      console.log("User signed in!");
    } catch (error) {
      console.error("Google Sign-In error:", error);
    }
  };

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
        <Input
          inputMode="email"
          placeholder="Email address"
          value={email}
          onChangeText={handleEmailChange} // Update email state on change with validation
        />
        {emailError ? (
          <Text
            size="small"
            weight="medium"
            color="#FFD982"
            style={styles.errorText}
          >
            {emailError}
          </Text> // Show error message
        ) : null}
        <Input
          inputMode="password"
          placeholder="Password"
          value={password}
          onChangeText={setPassword} // Update password state on change
        />
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
          handleLoginClick();
          // router.push({
          //   pathname: "/(auth)/Register",
          // });
        }} // Call handleLoginClick directly
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
          onPress={() => {
            signInWithGoogle();
          }}
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
  errorText: {
    marginHorizontal: 20,
    marginTop: -10,
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

import React, { useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ThirdPartyLoginButton from "@/components/ThirdPartyLoginButton";
import { router } from "expo-router";
import Text from "@/components/Text";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  signInWithEmailAndPassword,
  // signInWithGoogle,
} from "@/utils/firebase/userFunctions";
import { setUser } from "@/redux/slices/userSlice";
import { useDispatch } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import firestore from "@react-native-firebase/firestore";
import { useSignInWithGoogle } from "@/hooks/useSignInWithGoogle";
GoogleSignin.configure({
  webClientId:
    "828691216515-im3vbghoggs7g5oplhog6vkepnfg64pb.apps.googleusercontent.com",
});
import { getFcmToken, saveFcmTokenToFirestore } from "@/hooks/useNotification";

const Login = () => {
  const [email, setEmail] = useState<string>(""); // State for email input
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState<string>(""); // State for password input
  const [emailError, setEmailError] = useState<string>(""); // State for email error
  const dispatch = useDispatch();
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
    if (!email || !password) {
      alert("Both email and password are required.");
      return;
    }
    if (emailError) return; // Prevent login if there's an email error

    try {
      const userCredential = await signInWithEmailAndPassword(email, password); // Use user input for login
      console.log("userCredential : ", userCredential);
      const user = userCredential.user;

      const userDocRef = firestore().collection("Users").doc(user.uid);
      const userDoc = await userDocRef.get();

      // Check if the email is verified
      if (user.emailVerified) {
        // router.push({
        //   pathname: "/(bottomTabs)/Home",
        // });
        dispatch(setUser(userDoc.data()));

        // ✅ Register and save FCM token if not already saved
        const token = await getFcmToken();
        if (token) {
          await saveFcmTokenToFirestore(user.uid, token);
        }

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
      } else if (error.code === "auth/invalid-credential") {
        alert("The supplied auth credential is malformed or Expired.");
        console.log(error);
      } else {
        alert(error.message);
        console.log(error);
      }
    }
  };

  const signInWithGoogle = useSignInWithGoogle();

  // const signInWithGoogle = async () => {
  //   try {
  //     await GoogleSignin.hasPlayServices();
  //     const userInfo: any = await GoogleSignin.signIn();
  //     console.log("User Info:", userInfo);

  //     const idToken: string = userInfo.data.idToken as string;
  //     if (!idToken) {
  //       const accessToken: string = userInfo.accessToken as string;
  //       const googleCredential = auth.GoogleAuthProvider.credential(
  //         null,
  //         accessToken,
  //       );
  //       await auth().signInWithCredential(googleCredential);
  //     } else {
  //       const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  //       await auth().signInWithCredential(googleCredential);
  //     }
  //     console.log("User signed in!");
  //   } catch (error) {
  //     alert(error);
  //     console.log("Google Sign-In error:", error);
  //   }
  // };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[styles.Container, { paddingTop: insets.top }]}
    >
      <Image
        style={styles.Logo}
        source={require("../../assets/images/logo.png")}
      />
      <Text size="h2" weight="medium" color="#FBF6FA" style={styles.PageTitle}>
        Login
      </Text>
      <View style={styles.Row}>
        <Text size="p" weight="normal" color="#A7A7A7">
          Don’t have an account?{" "}
        </Text>
        <TouchableOpacity
          onPress={() => {
            router.replace({
              pathname: "/(auth)/Register",
            });
          }}
        >
          <Text size="p" weight="semibold" color="#FBF6FA">
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
        <TouchableOpacity
          onPress={() => {
            router.push("/(auth)/ChangePassword");
          }}
        >
          <Text size="medium" weight="semibold" color="#FBF6FA">
            Forgot password?
          </Text>
        </TouchableOpacity>
      </View>
      <Button
        title="Login"
        onPress={() => {
          handleLoginClick();
        }}
      />
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
  );
};

export default Login;

const styles = StyleSheet.create({
  Container: {
    paddingHorizontal: 24,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
  },
  Logo: {
    height: 250,
    width: 250,
    resizeMode: "contain",
  },
  PageTitle: {
    marginTop: "2%",
  },
  Row: {
    paddingTop: 8,
    display: "flex",
    flexDirection: "row",
  },
  InputContainer: {
    paddingTop: 24,
    width: "100%",
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

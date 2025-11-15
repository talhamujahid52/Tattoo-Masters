import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
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
import { setUser, setUserFirestoreData } from "@/redux/slices/userSlice";
import { useDispatch } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import firestore from "@react-native-firebase/firestore";
import { useSignInWithGoogle } from "@/hooks/useSignInWithGoogle";
GoogleSignin.configure({
  webClientId:
    "828691216515-im3vbghoggs7g5oplhog6vkepnfg64pb.apps.googleusercontent.com",
});
import { getFcmToken, saveFcmTokenToFirestore } from "@/hooks/useNotification";
import {
  LoginManager,
  AccessToken,
  AuthenticationToken,
} from "react-native-fbsdk-next";
import { sha256 } from "react-native-sha256";
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
    setEmailError("");
    // if (!validateEmail(input)) {
    //   setEmailError("Can't verify email to login.");
    // } else {
    //   setEmailError("");
    // }
  };

  const handleLoginClick = async () => {
    if (!email || !password) {
      alert("Both email and password are required.");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Enter a Valid Email Address");
      return;
    }
    // if (emailError) return; // Prevent login if there's an email error

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
        alert(
          "Please verify your email by clicking the link we sent to your provided email address to continue."
        );
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
        alert("Incorrect email or password. Please try again.");
        console.log(error);
      } else {
        alert(error.message);
        console.log(error);
      }
    }
  };

  const signInWithGoogle = useSignInWithGoogle();
  const onFacebookButtonPress = async () => {
    try {
      console.log("🔵 Starting Facebook login");

      let facebookCredential;
      let androidAccessToken = null; // Store for reuse

      if (Platform.OS === "ios") {
        // iOS implementation with Limited Login
        const generateNonce = () => {
          return (
            Math.random().toString(36).substring(2) + Date.now().toString(36)
          );
        };

        const nonce = generateNonce();
        const nonceSha256 = await sha256(nonce);

        const result = await LoginManager.logInWithPermissions(
          ["public_profile", "email"],
          "limited",
          nonceSha256
        );

        if (result.isCancelled) {
          throw new Error("User cancelled the login process");
        }

        const data = await AuthenticationToken.getAuthenticationTokenIOS();
        if (!data) {
          throw new Error(
            "Something went wrong obtaining authentication token"
          );
        }

        facebookCredential = auth.FacebookAuthProvider.credential(
          data.authenticationToken,
          nonce
        );
      } else {
        // Android implementation with Classic Login
        const result = await LoginManager.logInWithPermissions([
          "public_profile",
          "email",
        ]);

        if (result.isCancelled) {
          throw new Error("User cancelled the login process");
        }

        const data = await AccessToken.getCurrentAccessToken();
        if (!data) {
          throw new Error("Something went wrong obtaining access token");
        }

        androidAccessToken = data.accessToken; // Store for reuse
        facebookCredential = auth.FacebookAuthProvider.credential(
          data.accessToken
        );
      }

      console.log("🔵 Signing in to Firebase...");
      const userCredential = await auth().signInWithCredential(
        facebookCredential
      );
      const user = userCredential.user;
      console.log("✅ Firebase sign-in complete. User:", user);

      // Check if user exists in Firestore
      const userDocRef = firestore().collection("Users").doc(user.uid);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        console.log("👤 New user. Creating user document...");

        let userData = {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          profilePicture: user.photoURL,
          followedArtists: [],
          likedTattoos: [],
          isArtist: false,
          createdAt: firestore.FieldValue.serverTimestamp(),
        };

        // For Android, fetch additional info from Graph API if needed
        if (Platform.OS === "android") {
          const getFacebookUserInfo = async (accessToken) => {
            try {
              const response = await fetch(
                `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
              );
              const userInfo = await response.json();
              console.log("📘 Facebook userInfo:", userInfo);
              return {
                email: userInfo.email || null,
                profilePicture: userInfo.picture?.data?.url || null,
              };
            } catch (error) {
              console.log("❌ Error fetching Facebook user info:", error);
              return { email: null, profilePicture: null };
            }
          };

          // Reuse the access token from Android flow
          const data = await AccessToken.getCurrentAccessToken();
          const facebookUserInfo = await getFacebookUserInfo(data.accessToken);

          userData = {
            ...userData,
            email: facebookUserInfo.email || user.email,
            profilePicture: facebookUserInfo.profilePicture || user.photoURL,
          };
        }

        await userDocRef.set(userData);
        dispatch(setUserFirestoreData(userData));
        console.log("✅ New user added to Firestore");
      } else {
        console.log("👤 Existing user found in Firestore");
        dispatch(setUser(userDoc.data()));
      }

      const fcmToken = await getFcmToken();
      if (fcmToken) {
        await saveFcmTokenToFirestore(user.uid, fcmToken);
        console.log("📲 FCM token saved to Firestore");
      }

      console.log("🎉 Facebook login flow complete!");
    } catch (error) {
      console.error("❌ Facebook login error:", error);
      alert(error?.message || error);
    }
  };

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
            router.push("/(auth)/ForgotPassword");
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
          onPress={async () => {
            await onFacebookButtonPress();
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
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Text
            size="p"
            weight="semibold"
            color="#DAB769"
            style={{ textAlign: "center", marginTop: 24 }}
          >
            Continue as guest
          </Text>
        </TouchableOpacity>
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

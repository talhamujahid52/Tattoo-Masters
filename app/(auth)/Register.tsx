import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
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
import { sha256 } from "react-native-sha256";
import {
  LoginManager,
  AccessToken,
  AuthenticationToken,
} from "react-native-fbsdk-next";
import { setUser, setUserFirestoreData } from "@/redux/slices/userSlice";
import { useDispatch } from "react-redux";
import { getFcmToken, saveFcmTokenToFirestore } from "@/hooks/useNotification";

const Register: React.FC = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const signInWithGoogle = useSignInWithGoogle();
  const dispatch = useDispatch();

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
      Alert.alert("Action Required", "Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Unsuccessful", "Passwords do not match.");
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
      console.log("error: ", error);
      if (error && error.code && error.message) {
        Alert.alert("Unsuccessful", "Something went wrong. Please try again.");
      } else {
        Alert.alert("Unsuccessful", "Something went wrong. Please try again.");
      }
    }
  };

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
          const facebookUserInfo = await getFacebookUserInfo(data?.accessToken);

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
      // alert(error?.message || error);
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
    marginTop: 14,
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

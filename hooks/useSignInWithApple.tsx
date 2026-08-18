import "react-native-get-random-values";
import { Alert, Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useDispatch } from "react-redux";
import { setUser, setUserFirestoreData } from "@/redux/slices/userSlice";
import { getFcmToken, saveFcmTokenToFirestore } from "@/hooks/useNotification";
import { sha256 } from "react-native-sha256";
import { clearLocalSession } from "@/utils/authSession";
import type { AppDispatch } from "@/redux/store";

const generateNonce = (length = 32) => {
  const charset =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._";
  const randomValues = new Uint8Array(length);
  globalThis.crypto.getRandomValues(randomValues);

  return Array.from(randomValues)
    .map((value) => charset[value % charset.length])
    .join("");
};

const getAppleDisplayName = (
  fullName: AppleAuthentication.AppleAuthenticationFullName | null
) => {
  if (!fullName) {
    return "";
  }

  return [fullName.givenName, fullName.familyName].filter(Boolean).join(" ");
};

export const useSignInWithApple = () => {
  const dispatch = useDispatch<AppDispatch>();

  const signInWithApple = async () => {
    try {
      if (Platform.OS !== "ios") {
        Alert.alert(
          "Unavailable",
          "Sign in with Apple is available on iOS devices."
        );
        return;
      }

      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Unavailable",
          "Sign in with Apple is not available on this device."
        );
        return;
      }

      const rawNonce = generateNonce();
      const hashedNonce = await sha256(rawNonce);

      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!appleCredential.identityToken) {
        throw new Error("Apple Sign-In failed - no identity token returned.");
      }

      const firebaseCredential = auth.AppleAuthProvider.credential(
        appleCredential.identityToken,
        rawNonce
      );
      const userCredential = await auth().signInWithCredential(
        firebaseCredential
      );
      const user = userCredential.user;

      const userDocRef = firestore().collection("Users").doc(user.uid);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        const appleDisplayName = getAppleDisplayName(
          appleCredential.fullName
        );
        const userData = {
          uid: user.uid,
          name: user.displayName || appleDisplayName,
          email: user.email || appleCredential.email,
          profilePicture: user.photoURL || "",
          followedArtists: [],
          likedTattoos: [],
          isArtist: false,
          createdAt: firestore.FieldValue.serverTimestamp(),
        };

        await userDocRef.set(userData, { merge: true });
        dispatch(setUserFirestoreData(userData));
      } else {
        dispatch(setUser(userDoc.data()));
      }

      const fcmToken = await getFcmToken();
      if (fcmToken) {
        await saveFcmTokenToFirestore(user.uid, fcmToken);
      }
    } catch (error: any) {
      if (error?.code === "ERR_REQUEST_CANCELED") {
        await clearLocalSession(dispatch);
        return;
      }

      console.log("Apple Sign-In error:", error);
      try {
        await auth().signOut();
      } catch (signOutError) {
        console.log("Apple Sign-In cleanup error:", signOutError);
      }
      await clearLocalSession(dispatch);
      Alert.alert("Unsuccessful", "Apple sign in failed. Please try again.");
    }
  };

  return signInWithApple;
};

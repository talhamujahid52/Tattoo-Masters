import { useDispatch } from "react-redux";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { setUser } from "@/redux/slices/userSlice";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { getFcmToken, saveFcmTokenToFirestore } from "@/hooks/useNotification";
import { router } from "expo-router";

export const useSignInWithGoogle = () => {
  const dispatch = useDispatch();

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo: any = await GoogleSignin.signIn();

      const idToken: string = userInfo.data.idToken as string;
      let userCredential;
      if (!idToken) {
        const accessToken: string = userInfo.accessToken as string;
        const googleCredential = auth.GoogleAuthProvider.credential(
          null,
          accessToken
        );
        userCredential = await auth().signInWithCredential(googleCredential);
      } else {
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        userCredential = await auth().signInWithCredential(googleCredential);
      }

      const user = userCredential.user;
      console.log("Signed In User : ", user);

      // Check if user exists in Firestore (in "users" collection)
      const userDocRef = firestore().collection("Users").doc(user.uid);
      const userDoc = await userDocRef.get();
      console.log("User Doc: ", userDoc.data());

      let userData;
      if (!userDoc.exists) {
        // User does not exist in Firestore, create a new user document
        await userDocRef.set({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          profilePicture: user.photoURL,
          followedArtists: [],
          likedTattoos: [],
          isArtist: false,
          createdAt: firestore.FieldValue.serverTimestamp(), // Add timestamp for user creation
        });
        console.log("User added to Firestore!");
      } else {
        console.log("User already exists in Firestore");
        dispatch(setUser(userDoc.data()));
      }

      // Dispatch the user data to Redux
      const token = await getFcmToken();
      if (token) {
        await saveFcmTokenToFirestore(user.uid, token);
      }

      console.log("User signed in and data saved to Firestore!");
      //   return userData;
    } catch (error) {
      alert(error);
      console.log("Google Sign-In error:", error);
    }
  };

  return signInWithGoogle;
};

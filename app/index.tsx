import { setUser } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { Redirect, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

SplashScreen.preventAutoHideAsync();
export default function Index() {
  const dispatch = useDispatch<AppDispatch>();
  const [initializing, setInitializing] = useState(true);
  const userId = useSelector((state: RootState) => state.user.user?.uid);
  // Handle user state changes
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    dispatch(setUser(user));
    // console.log("user", user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    if (!initializing) {
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 100);
    }
  }, [initializing]);

  if (initializing) {
    return null; // Show nothing while initializing
  }

  if (userId) {
    return <Redirect href={"/(bottomTabs)/Home"} />;
  }

  return <Redirect href={"/(auth)/Welcome"} />;
}

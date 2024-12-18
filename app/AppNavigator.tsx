import { setUser } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const AppNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [initializing, setInitializing] = useState(true);
  const userId = useSelector((state: RootState) => state.user.user?.uid);
  const router = useRouter();
  // Handle user state changes
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    dispatch(setUser(user));
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
      }, 200);
    }
  }, [initializing]);

  useEffect(() => {
    if (initializing) {
      return;
    }
    if (userId) {
      router.replace("/(bottomTabs)/Home");
    } else {
      router.replace("/(auth)/Welcome");
    }
  }, [userId, initializing]);

  if (initializing) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#000" },
      }}
    >
      <Stack.Screen name="(bottomTabs)" />
      <Stack.Screen options={{ animation: "fade" }} name="(auth)/Welcome" />
      <Stack.Screen name="(auth)/Login" />
      <Stack.Screen name="(auth)/Register" />
      <Stack.Screen
        name="(auth)/Verification"
        options={{
          headerShown: true,
          headerTitle: "Phone Verification",
          headerTitleStyle: { color: "#fff" },
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#000" },
          headerBackTitleVisible: false,
          headerBackButtonMenuEnabled: false,
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="(auth)/SetPassword"
        options={{
          headerShown: true,
          headerTitle: "Set Password",
          headerTitleStyle: { color: "#fff" },
          headerStyle: { backgroundColor: "#000" },
          headerBackTitleVisible: false,
          headerBackButtonMenuEnabled: false,
          headerTintColor: "#fff",
        }}
      />
    </Stack>
  );
};

export default AppNavigator;

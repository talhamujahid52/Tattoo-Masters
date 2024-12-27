import { setUser } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#000" },
          }}
        >
          <Stack.Screen options={{ animation: "fade" }} name="(auth)/Welcome" />
          <Stack.Screen name="(auth)/Login" />
          <Stack.Screen name="(auth)/Register" />

          <Stack.Screen
            name="(auth)/DeleteAccount"
            options={{
              headerShown: true,
              headerTitle: "Delete Account",
              headerTitleStyle: { color: "#fff" },
              headerTitleAlign: "center",
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
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

          <Stack.Screen
            name="(auth)/ChangePassword"
            options={{
              headerShown: true,
              headerTitle: "Choose new password",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="(auth)/ReviewPassword"
            options={{
              headerShown: true,
              headerTitle: "Change review password",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="(auth)/TermsOfService"
            options={{
              headerShown: true,
              headerTitle: "Terms of service",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="(auth)/PrivacyPolicy"
            options={{
              headerShown: true,
              headerTitle: "Privacy policy",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen name="(drawer)" />
          <Stack.Screen
            name="artist/MyProfile"
            options={{
              headerShown: true,
              headerTitle: "My Profile",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/EditProfile"
            options={{
              headerShown: true,
              headerTitle: "Edit Profile",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/RegisterArtist"
            options={{
              headerShown: true,
              headerTitle: "Register as artist",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    router.back();
                  }}
                >
                  <Image
                    source={require("../assets/images/close.png")}
                    resizeMode="cover"
                    style={{ height: 13, width: 13 }}
                  />
                </TouchableOpacity>
              ),
            }}
          />
          <Stack.Screen
            name="artist/SearchLocation"
            options={{
              headerShown: true,
              headerTitle: "Add location",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

export default AppNavigator;

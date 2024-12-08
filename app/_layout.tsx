import { Stack, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Image, TouchableOpacity } from "react-native";

import { StatusBar } from "expo-status-bar";
export default function RootLayout() {
  const router = useRouter();

  return (
    <>
      <StatusBar style="light" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)/Welcome" />
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
          </Stack>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}

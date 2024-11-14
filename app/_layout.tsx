import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import { StatusBar } from "expo-status-bar";
export default function RootLayout() {
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
            <Stack.Screen name="(bottomTabs)" />
          </Stack>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}

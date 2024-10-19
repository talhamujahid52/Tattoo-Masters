import { Stack } from "expo-router";

export default function RootLayout() {
  return (
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
    </Stack>
  );
}

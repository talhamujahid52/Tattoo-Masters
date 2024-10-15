import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(auth)/Welcome" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/Login" options={{ headerShown: false }} />
      <Stack.Screen
        name="(auth)/Registration"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

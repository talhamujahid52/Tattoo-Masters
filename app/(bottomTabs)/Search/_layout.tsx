import React from "react";
import { Stack } from "expo-router";

const SearchLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#000" },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          headerTitleStyle: { color: "#fff" },
          headerStyle: { backgroundColor: "#000" },
          headerBackButtonMenuEnabled: false,
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="SearchAll"
        options={{
          headerShown: false,
          headerTitleStyle: { color: "#fff" },
          headerStyle: { backgroundColor: "#000" },
          headerBackButtonMenuEnabled: false,
          headerTintColor: "#fff",
        }}
      />
    </Stack>
  );
};
export default SearchLayout;

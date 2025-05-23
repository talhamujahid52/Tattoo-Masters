import React from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import "react-native-get-random-values";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "@/redux/store";
import AppNavigator from "./AppNavigator";
import { FormProvider } from "../context/FormContext";
import { ErrorBoundaryProps, SplashScreen } from "expo-router";
import { View } from "react-native";
import Text from "@/components/Text";
import { Try } from "expo-router/build/views/Try";
// import { useRouter } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // const router = useRouter();

  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <StatusBar style="light" />
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <FormProvider>
                <AppNavigator />
              </FormProvider>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </PersistGate>
      </Provider>
    </>
  );
}

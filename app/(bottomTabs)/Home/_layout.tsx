import React from "react";
import { Stack, useRouter } from "expo-router";
import { Image, Platform, View } from "react-native";
import { TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useBottomSheet from "@/hooks/useBottomSheet";
import LoginBottomSheet from "@/components/BottomSheets/LoginBottomSheet";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useSelector } from "react-redux";

// iOS 26+ wraps native header items in a glass button capsule, which makes
// the logo look tappable. Render the header in JS there instead.
const usesGlassHeaderItems =
  Platform.OS === "ios" && parseInt(String(Platform.Version), 10) >= 26;

const HomeLayout = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user
  );
  const { BottomSheet, show, hide } = useBottomSheet();

  const logo = (
    <Image
      source={require("../../../assets/images/tattoo masters.png")}
      resizeMode="cover"
      style={{
        height: 27,
        marginTop: 10,
        width: 180,
      }}
    />
  );

  const menuButton = (
    <TouchableOpacity
      style={{
        left: 8,
        alignItems: "center",
        justifyContent: "center",
      }}
      hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      onPress={() => {
        loggedInUser ? router.push("/Menu") : show();
      }}
    >
      <Image
        source={require("../../../assets/images/menu.png")}
        resizeMode="cover"
        style={{
          alignSelf: "center",
          height: 13,
          width: 19,
        }}
      />
    </TouchableOpacity>
  );

  return (
    <>
      <BottomSheet
        InsideComponent={<LoginBottomSheet hideLoginBottomSheet={hide} />}
      />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#000" },
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "",
            headerStyle: {
              backgroundColor: "#000",
            },
            headerShadowVisible: false,
            headerLeft: () => logo,
            headerRight: () => menuButton,
            ...(usesGlassHeaderItems && {
              header: () => (
                <View
                  style={{
                    backgroundColor: "#000",
                    paddingTop: insets.top,
                  }}
                >
                  <View
                    style={{
                      height: 44,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingLeft: 16,
                      paddingRight: 24,
                    }}
                  >
                    {logo}
                    {menuButton}
                  </View>
                </View>
              ),
            }),
          }}
        />
        <Stack.Screen
          name="SearchAllHome"
          options={{
            headerShown: false,
            headerTitleStyle: { color: "#fff" },
            headerStyle: { backgroundColor: "#000" },
            headerBackButtonMenuEnabled: false,
            headerTintColor: "#fff",
          }}
        />
      </Stack>
    </>
  );
};
export default HomeLayout;

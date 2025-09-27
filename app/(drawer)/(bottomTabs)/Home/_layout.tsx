import React from "react";
import { Stack, useNavigation } from "expo-router";
import { Image } from "react-native";
import { TouchableOpacity } from "react-native";
import { DrawerActions } from "@react-navigation/native";
import useBottomSheet from "@/hooks/useBottomSheet";
import LoginBottomSheet from "@/components/BottomSheets/LoginBottomSheet";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useSelector } from "react-redux";

const HomeLayout = () => {
  const navigation = useNavigation();

  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user,
  );
  const { BottomSheet, show, hide } = useBottomSheet();
  return (
    <>
      <BottomSheet
        InsideComponent={<LoginBottomSheet hideLoginBottomSheet={hide} />}
      />
      <Stack screenOptions={{ contentStyle: { backgroundColor: "#000" } }}>
        <Stack.Screen
          name="index"
          options={{
            title: "",
            headerStyle: {
              backgroundColor: "#000",
              shadowOpacity: 0,
            },
            headerLeftContainerStyle: {
              paddingLeft: 16,
            },
            headerRightContainerStyle: {
              paddingRight: 16,
            },
            headerLeft: () => (
              <Image
                source={require("../../../../assets/images/tattoo masters.png")}
                resizeMode="cover"
                style={{
                  height: 27,
                  marginTop: 10,
                  width: 180,
                }}
              />
            ),
            headerRight: () => (
              <TouchableOpacity
                style={{
                  // padding: 10,
                  left: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                onPress={() => {
                  loggedInUser
                    ? navigation.dispatch(DrawerActions.toggleDrawer())
                    : show();
                }}
              >
                <Image
                  source={require("../../../../assets/images/menu.png")}
                  resizeMode="cover"
                  style={{
                    alignSelf: "center",

                    height: 13,
                    width: 19,
                  }}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="SearchAllHome"
          options={{
            headerShown: false,
            headerTitleStyle: { color: "#fff" },
            headerStyle: { backgroundColor: "#000" },
            headerBackTitleVisible: false,
            headerBackButtonMenuEnabled: false,
            headerTintColor: "#fff",
          }}
        />
      </Stack>
    </>
  );
};
export default HomeLayout;

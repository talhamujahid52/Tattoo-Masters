import React from "react";
import { Stack, useNavigation } from "expo-router";
import { Image } from "react-native";
import { TouchableOpacity } from "react-native";
import { DrawerActions } from "@react-navigation/native";

const HomeLayout = () => {
  const navigation = useNavigation();
  return (
    <Stack>
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
              hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
              onPress={() => {
                navigation.dispatch(DrawerActions.toggleDrawer());
              }}
            >
              <Image
                source={require("../../../../assets/images/menu.png")}
                resizeMode="cover"
                style={{ height: 13, width: 19 }}
              />
            </TouchableOpacity>
          ),
          // headerRight: () => <DrawerToggleButton tintColor="white" ></DrawerToggleButton>,
        }}
        // options={{
        //   // animation: "fade",
        //   headerShown: false,
        //   // gestureEnabled: true,
        //   // headerTitle: "Add location",
        //   headerTitleStyle: { color: "#fff" },
        //   headerStyle: { backgroundColor: "#000" },
        //   headerBackTitleVisible: false,
        //   headerBackButtonMenuEnabled: false,
        //   headerTintColor: "#fff",
        // }}
      />
      <Stack.Screen
        name="SearchAll"
        options={{
          // animation: "fade",
          headerShown: false,
          // gestureEnabled: true,
          // headerTitle: "Add location",
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
export default HomeLayout;

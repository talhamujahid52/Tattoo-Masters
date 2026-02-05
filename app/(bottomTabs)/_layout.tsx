import { Image, StatusBar, Pressable } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import useBottomSheet from "@/hooks/useBottomSheet";
import LoginBottomSheet from "@/components/BottomSheets/LoginBottomSheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

const BottomTabsLayout = () => {
  const { BottomSheet, show, hide } = useBottomSheet();
  const insets = useSafeAreaInsets();
  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user
  );

  const handleTabPress = (tab: string, defaultHandler?: () => void) => {
    if (!loggedInUser) {
      show();
    } else if (defaultHandler) {
      defaultHandler();
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <BottomSheet
        InsideComponent={<LoginBottomSheet hideLoginBottomSheet={hide} />}
      />
      <Tabs
        screenOptions={{
          sceneContainerStyle: { backgroundColor: "#000" },
          tabBarStyle: {
            backgroundColor: "#000000",
            borderTopColor: "#313232",
            borderTopWidth: 0.33,
            height: 54 + insets.bottom,
          },
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
            headerShown: false,
            title: "",
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Image
                  source={require("../../assets/images/home-filled.png")}
                  resizeMode="contain"
                  style={{ height: 28, width: 28 }}
                />
              ) : (
                <Image
                  source={require("../../assets/images/home.png")}
                  resizeMode="contain"
                  style={{ height: 28, width: 28 }}
                />
              ),
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
          }}
        />
        <Tabs.Screen
          name="Search"
          options={{
            title: "",
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Image
                  source={require("../../assets/images/search-filled.png")}
                  resizeMode="contain"
                  style={{ height: 28, width: 28 }}
                />
              ) : (
                <Image
                  source={require("../../assets/images/search.png")}
                  resizeMode="contain"
                  style={{ height: 28, width: 28 }}
                />
              ),
            headerStyle: {
              backgroundColor: "#000",
              height: 55,
              shadowOpacity: 0,
            },
          }}
        />
        <Tabs.Screen
          name="Maps"
          options={{
            title: "",
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Image
                  source={require("../../assets/images/map-filled.png")}
                  resizeMode="contain"
                  style={{ height: 28, width: 28 }}
                />
              ) : (
                <Image
                  source={require("../../assets/images/map.png")}
                  resizeMode="contain"
                  style={{ height: 28, width: 28 }}
                />
              ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="Likes"
          options={{
            title: "",
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Image
                  source={require("../../assets/images/favorite-filled.png")}
                  resizeMode="contain"
                  style={{ height: 28, width: 28 }}
                />
              ) : (
                <Image
                  source={require("../../assets/images/favorite-outline.png")}
                  resizeMode="contain"
                  style={{ height: 28, width: 28 }}
                />
              ),
            headerShown: false,
            tabBarButton: (props) => (
              <Pressable
                {...props}
                onPress={() => handleTabPress("Likes", props.onPress as () => void)}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Chat"
          options={{
            title: "",
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Image
                  source={require("../../assets/images/comment-filled.png")}
                  resizeMode="contain"
                  style={{ height: 28, width: 28 }}
                />
              ) : (
                <Image
                  source={require("../../assets/images/comment.png")}
                  resizeMode="contain"
                  style={{ height: 28, width: 28 }}
                />
              ),
            headerShown: false,
            tabBarButton: (props) => (
              <Pressable
                {...props}
                onPress={() => handleTabPress("Chat", props.onPress as () => void)}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default BottomTabsLayout;

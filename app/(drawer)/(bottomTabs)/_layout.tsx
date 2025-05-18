import { StyleSheet, Image, StatusBar, TouchableOpacity } from "react-native";
import Text from "@/components/Text";
import React, { useRef, useCallback, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import useBottomSheet from "@/hooks/useBottomSheet";
import LoginBottomSheet from "@/components/BottomSheets/LoginBottomSheet";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BottomTabsLayout = () => {
  const navigation = useNavigation();
  const { BottomSheet, show, hide } = useBottomSheet();
  const insets = useSafeAreaInsets();
  return (
    <>
      <StatusBar barStyle="light-content" />
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#000000",
            borderColor: "#333739",
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
                  source={require("../../../assets/images/home-filled.png")}
                  resizeMode="contain"
                  style={{ height: 24, width: 24 }}
                />
              ) : (
                <Image
                  source={require("../../../assets/images/home.png")}
                  resizeMode="contain"
                  style={{ height: 24, width: 24 }}
                />
              ),
          }}
        />
        <Tabs.Screen
          name="Search"
          options={{
            title: "",
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Image
                  source={require("../../../assets/images/search-filled.png")}
                  resizeMode="contain"
                  style={{ height: 26, width: 26 }}
                />
              ) : (
                <Image
                  source={require("../../../assets/images/search.png")}
                  resizeMode="contain"
                  style={{ height: 26, width: 26 }}
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
                  source={require("../../../assets/images/map-filled.png")}
                  resizeMode="contain"
                  style={{ height: 26, width: 26 }}
                />
              ) : (
                <Image
                  source={require("../../../assets/images/map.png")}
                  resizeMode="contain"
                  style={{ height: 26, width: 26 }}
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
                  source={require("../../../assets/images/favorite-filled.png")}
                  resizeMode="contain"
                  style={{ height: 26, width: 26 }}
                />
              ) : (
                <Image
                  source={require("../../../assets/images/favorite-outline.png")}
                  resizeMode="contain"
                  style={{ height: 26, width: 26 }}
                />
              ),
            headerShown: false,
            // headerStyle: {
            //   backgroundColor: "#000",
            //   // borderBottomWidth: 0,
            // },
          }}
        />
        <Tabs.Screen
          name="Chat"
          options={{
            title: "",
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Image
                  source={require("../../../assets/images/comment-filled.png")}
                  resizeMode="contain"
                  style={{ height: 26, width: 26 }}
                />
              ) : (
                <Image
                  source={require("../../../assets/images/comment.png")}
                  resizeMode="contain"
                  style={{ height: 26, width: 26 }}
                />
              ),
            headerShown: false,
          }}
        />
      </Tabs>
      <BottomSheet InsideComponent={<LoginBottomSheet />} />
    </>
  );
};

export default BottomTabsLayout;

const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    right: -2,
    top: -4,
    backgroundColor: "red",
    borderRadius: 10,
    height: 17,
    width: 17,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});

import {
  StyleSheet,
  View,
  Image,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import Text from "@/components/Text";
import React, { useRef, useCallback, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useBottomSheet from "@/hooks/useBottomSheet";
import LoginBottomSheet from "@/components/BottomSheets/LoginBottomSheet";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BottomTabsLayout = () => {
  const unreadMessages = 17;
  const router = useRouter();
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
            borderColor: "#FFFFFF26",
            borderTopWidth: 0,
            height: 54 + insets.bottom,
          },
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
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
            headerStyle: {
              backgroundColor: "#000",
              borderBottomWidth: 0,
            },
            headerLeftContainerStyle: {
              paddingLeft: 16,
            },
            headerRightContainerStyle: {
              paddingRight: 16,
            },
            headerLeft: () => (
              <Image
                source={require("../../../assets/images/tattoo masters.png")}
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
                onPress={() => {
                  navigation.dispatch(DrawerActions.toggleDrawer());
                }}
              >
                <Image
                  source={require("../../../assets/images/menu.png")}
                  resizeMode="cover"
                  style={{ height: 13, width: 19 }}
                />
              </TouchableOpacity>
            ),
            // headerRight: () => <DrawerToggleButton tintColor="white" ></DrawerToggleButton>,
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
            // <View style={styles.iconContainer}>
            //   <Ionicons
            //     name={focused ? "chatbubble-sharp" : "chatbubble-outline"}
            //     size={24}
            //     color={focused ? "#fff" : "#838383"}
            //   />
            //   {unreadMessages > 0 && (
            //     <View style={styles.badge}>
            //       <Text style={styles.badgeText}>{unreadMessages}</Text>
            //     </View>
            //   )}
            // </View>
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

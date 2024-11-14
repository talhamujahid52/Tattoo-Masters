import {
  StyleSheet,
  View,
  Image,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import Text from "@/components/Text";
import React, { useRef, useCallback, useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useBottomSheet from "@/hooks/useBottomSheet";
import LoginBottomSheet from "@/components/BottomSheets/LoginBottomSheet";
import { DrawerToggleButton } from "@react-navigation/drawer";

const BottomTabsLayout = () => {
  const unreadMessages = 17;
  const { BottomSheet, show, hide } = useBottomSheet();

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#000000",
            borderColor: "#FFFFFF26",
            height: 90,
          },
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
            title: "",
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="home-sharp" size={24} color="#fff" />
              ) : (
                <Ionicons name="home-outline" size={24} color="#838383" />
              ),
            headerStyle: {
              backgroundColor: "#000",
            },
            headerLeft: () => (
              <Image
                source={require("../../assets/images/tattoo masters.png")}
                resizeMode="cover"
                style={{ height: 27, width: 180 }}
              />
            ),
            headerRight: () => <Ionicons name="menu" size={25} color="#fff" />,
          }}
        />
        <Tabs.Screen
          name="Search"
          options={{
            title: "",
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="search-sharp" size={24} color="#fff" />
              ) : (
                <Ionicons name="search-outline" size={24} color="#838383" />
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
                <Ionicons name="map-sharp" size={24} color="#fff" />
              ) : (
                <Ionicons name="map-outline" size={24} color="#838383" />
              ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="Likes"
          options={{
            title: "",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                onPress={() => show()}
                name={focused ? "heart-sharp" : "heart-outline"}
                size={24}
                color={focused ? "#fff" : "#838383"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Chat"
          options={{
            title: "",
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={focused ? "chatbubble-sharp" : "chatbubble-outline"}
                  size={24}
                  color={focused ? "#fff" : "#838383"}
                />
                {unreadMessages > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadMessages}</Text>
                  </View>
                )}
              </View>
            ),
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

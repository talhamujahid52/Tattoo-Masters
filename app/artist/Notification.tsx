import { StyleSheet, View, Switch } from "react-native";
import Text from "@/components/Text";
import React, { useState } from "react";

const Notification = () => {
  const isArtist = false;
  const [allNotifications, setAllNotifications] = useState(true);
  const toggleSwitch = () => {
    setAllNotifications(!allNotifications);
  };
  return (
    <View style={{ padding: 16 }}>
      {isArtist && (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 24,
            borderBottomColor: "#262626",
            borderBottomWidth: 1,
          }}
        >
          <Text size="h4" weight="normal" color="#FBF6FA">
            All Notifications
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#44e52c" }}
            thumbColor={allNotifications ? "#fff" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={allNotifications}
          />
        </View>
      )}
      <View
        style={{
          display: "flex",
          rowGap: 24,
          paddingVertical: isArtist ? 24 : 0,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text size="h4" weight="normal" color="#FBF6FA">
            Messages
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#44e52c" }}
            thumbColor={allNotifications ? "#fff" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={allNotifications}
          />
        </View>
        {isArtist && (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text size="h4" weight="normal" color="#FBF6FA">
              Favorites
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: "#44e52c" }}
              thumbColor={allNotifications ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={allNotifications}
            />
          </View>
        )}
        {isArtist && (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text size="h4" weight="normal" color="#FBF6FA">
              Likes
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: "#44e52c" }}
              thumbColor={allNotifications ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={allNotifications}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({});

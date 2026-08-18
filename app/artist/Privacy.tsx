import Text from "@/components/Text";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

const Privacy = () => {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Blocked users"
        accessibilityHint="Opens the list of accounts you have blocked"
        onPress={() => router.push("/artist/BlockedUsers")}
        style={styles.row}
      >
        <MaterialCommunityIcons
          name="account-cancel-outline"
          size={24}
          color="#A7A7A7"
        />
        <View style={styles.textContainer}>
          <Text size="h4" weight="normal" color="#FBF6FA">
            Blocked users
          </Text>
          <Text size="p" weight="normal" color="#A7A7A7">
            Review and unblock accounts.
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#A7A7A7"
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  row: {
    minHeight: 76,
    alignItems: "center",
    borderBottomColor: "#2D2D2D",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 12,
    rowGap: 4,
  },
});

export default Privacy;

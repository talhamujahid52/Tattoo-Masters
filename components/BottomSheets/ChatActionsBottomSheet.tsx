import Text from "@/components/Text";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface ChatActionsBottomSheetProps {
  hideActionsSheet: () => void;
  showBlockSheet: () => void;
}

const ChatActionsBottomSheet = ({
  hideActionsSheet,
  showBlockSheet,
}: ChatActionsBottomSheetProps) => {
  const openBlockSheet = () => {
    hideActionsSheet();
    showBlockSheet();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Block user"
        onPress={openBlockSheet}
        style={styles.actionRow}
      >
        <MaterialCommunityIcons
          name="account-cancel-outline"
          size={24}
          color="#A7A7A7"
        />
        <Text size="h4" weight="normal" color="#FBF6FA">
          Block user
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#080808",
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 12,
  },
});

export default ChatActionsBottomSheet;

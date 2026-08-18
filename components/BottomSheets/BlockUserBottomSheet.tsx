import Button from "@/components/Button";
import RadioButton from "@/components/RadioButton";
import Text from "@/components/Text";
import useSafety from "@/hooks/useSafety";
import {
  BLOCK_REASON_OPTIONS,
  type BlockReason,
  type BlockSourceType,
} from "@/types/safety";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";

export interface BlockUserBottomSheetProps {
  hideBlockSheet: () => void;
  blockedUserId: string;
  sourceType: BlockSourceType;
  sourceId?: string | null;
  blockedUserName?: string;
  blockedUserProfilePicture?: string;
  onBlocked?: (blockedUserId: string) => void;
}

const BlockUserBottomSheet = ({
  hideBlockSheet,
  blockedUserId,
  sourceType,
  sourceId,
  blockedUserName,
  blockedUserProfilePicture,
  onBlocked,
}: BlockUserBottomSheetProps) => {
  const { blockUser, isUserBlocked } = useSafety();
  const [reason, setReason] = useState<BlockReason | "">("");
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    if (!reason || loading) return;

    if (isUserBlocked(blockedUserId)) {
      Alert.alert("Already blocked", "This user is already blocked.", [
        { text: "OK", onPress: hideBlockSheet },
      ]);
      return;
    }

    setLoading(true);
    try {
      const result = await blockUser({
        blockedUserId,
        reason,
        sourceType,
        sourceId,
        blockedUserSnapshot: {
          name: blockedUserName,
          profilePicture: blockedUserProfilePicture,
        },
      });

      if (result.status === "already_blocked") {
        Alert.alert("Already blocked", "This user is already blocked.", [
          { text: "OK", onPress: hideBlockSheet },
        ]);
        return;
      }

      onBlocked?.(blockedUserId);
      Alert.alert(
        "User blocked",
        "Their profile, content, and conversation have been hidden. You can unblock them in Settings.",
        [{ text: "OK", onPress: hideBlockSheet }],
      );
    } catch (error) {
      console.error("Failed to block user:", error);
      Alert.alert(
        "Unable to block user",
        error instanceof Error && error.message
          ? error.message
          : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          size="h4"
          weight="medium"
          color="#FFF"
          style={{ textAlign: "center" }}
        >
          Block user
        </Text>
      </View>

      <Text
        size="p"
        weight="normal"
        color="#A7A7A7"
        style={styles.explanation}
      >
        Blocking this user hides their profile, tattoos, reviews, and your
        conversation. Select a reason to continue.
      </Text>

      <View style={styles.content}>
        <RadioButton
          options={BLOCK_REASON_OPTIONS}
          selectedValue={reason}
          onSelect={(value) => setReason(value as BlockReason)}
        />
        <View style={styles.buttonContainer}>
          <Button
            title={
              loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                "Block user"
              )
            }
            disabled={!reason || loading}
            variant={reason ? "primary" : "secondary"}
            onPress={handleBlock}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#080808",
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 12,
    borderBottomColor: "#242424",
    borderBottomWidth: 1,
  },
  explanation: {
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 16,
  },
  content: {
    padding: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
});

export default BlockUserBottomSheet;

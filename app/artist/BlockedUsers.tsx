import Text from "@/components/Text";
import useSafety from "@/hooks/useSafety";
import type { BlockedUserRecord } from "@/types/safety";
import firestore from "@react-native-firebase/firestore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface BlockedUserProfile {
  name: string;
  profilePicture: string;
}

const BlockedUsers = () => {
  const { blockedUsersById, hydrated, unblockUser } = useSafety();
  const [profiles, setProfiles] = useState<Record<string, BlockedUserProfile>>(
    {},
  );
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [unblockingIds, setUnblockingIds] = useState<string[]>([]);

  const records = useMemo(
    () => Object.values(blockedUsersById),
    [blockedUsersById],
  );
  useEffect(() => {
    let active = true;

    const loadProfiles = async () => {
      if (!records.length) {
        setProfiles({});
        setLoadingProfiles(false);
        return;
      }

      setLoadingProfiles(true);
      const entries = await Promise.all(
        records.map(async (record) => {
          const fallback: BlockedUserProfile = {
            name: record.blockedUserSnapshot?.name || "Deleted account",
            profilePicture:
              record.blockedUserSnapshot?.profilePicture || "",
          };

          try {
            const document = await firestore()
              .collection("Users")
              .doc(record.blockedUserId)
              .get();
            const data = document.data();
            if (!data) return [record.blockedUserId, fallback] as const;

            return [
              record.blockedUserId,
              {
                name:
                  data.name?.trim() ||
                  data.fullName?.trim() ||
                  fallback.name,
                profilePicture:
                  data.profilePictureSmall ||
                  data.profilePicture ||
                  fallback.profilePicture,
              },
            ] as const;
          } catch (error) {
            console.log("Could not refresh blocked-user profile:", error);
            return [record.blockedUserId, fallback] as const;
          }
        }),
      );

      if (active) {
        setProfiles(Object.fromEntries(entries));
        setLoadingProfiles(false);
      }
    };

    void loadProfiles();
    return () => {
      active = false;
    };
  }, [records]);

  const confirmUnblock = (record: BlockedUserRecord) => {
    const profile = profiles[record.blockedUserId];
    const name =
      profile?.name || record.blockedUserSnapshot?.name || "this user";

    Alert.alert(
      "Unblock user?",
      `${name}'s profile, content, and conversation may become visible again. Separately reported content will remain hidden.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblock",
          onPress: async () => {
            setUnblockingIds((ids) => [...ids, record.blockedUserId]);
            try {
              await unblockUser(record.blockedUserId);
            } catch (error) {
              console.error("Failed to unblock user:", error);
              Alert.alert(
                "Unable to unblock user",
                "Please check your connection and try again.",
              );
            } finally {
              setUnblockingIds((ids) =>
                ids.filter((id) => id !== record.blockedUserId),
              );
            }
          },
        },
      ],
    );
  };

  if (!hydrated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#DAB769" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.blockedUserId}
        contentContainerStyle={
          records.length ? styles.listContent : styles.emptyListContent
        }
        renderItem={({ item }) => {
          const profile = profiles[item.blockedUserId] ?? {
            name: item.blockedUserSnapshot?.name || "Deleted account",
            profilePicture:
              item.blockedUserSnapshot?.profilePicture || "",
          };
          const isUnblocking = unblockingIds.includes(item.blockedUserId);

          return (
            <View style={styles.row}>
              <Image
                style={styles.avatar}
                source={
                  profile.profilePicture
                    ? { uri: profile.profilePicture }
                    : require("../../assets/images/placeholder.png")
                }
              />
              <Text
                size="h4"
                weight="normal"
                color="#FBF6FA"
                numberOfLines={1}
                style={styles.name}
              >
                {profile.name}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Unblock ${profile.name}`}
                disabled={isUnblocking}
                style={styles.unblockButton}
                onPress={() => confirmUnblock(item)}
              >
                {isUnblocking ? (
                  <ActivityIndicator size="small" color="#DAB769" />
                ) : (
                  <Text size="p" weight="semibold" color="#DAB769">
                    Unblock
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loadingProfiles ? (
              <ActivityIndicator color="#DAB769" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="account-cancel-outline"
                  size={48}
                  color="#A7A7A7"
                  style={styles.emptyIcon}
                />
                <Text size="h4" weight="medium" color="#FBF6FA">
                  No blocked users
                </Text>
                <Text
                  size="p"
                  weight="normal"
                  color="#A7A7A7"
                  style={styles.emptyText}
                >
                  Accounts you block will appear here.
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  listContent: {
    paddingHorizontal: 16,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#2D2D2D",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    resizeMode: "cover",
    backgroundColor: "#202020",
  },
  name: {
    flex: 1,
    marginRight: 12,
  },
  unblockButton: {
    minWidth: 84,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DAB769",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 8,
  },
});

export default BlockedUsers;

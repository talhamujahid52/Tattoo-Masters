import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import { Image as ExpoImage } from "expo-image";
import Text from "./Text";
import {
  SKELETON_DIM_COLOR,
  SkeletonReveal,
  useSkeletonPulse,
} from "./Skeleton";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";
interface ChatListCellProps {
  chat: any;
  // Changes after a pull-to-refresh, so the cell picks up the reloaded profile
  profilesVersion?: number;
}

// Profiles already looked up, so a cell that mounts again (scrolling, coming
// back to the tab) shows its name and picture straight away.
const USER_DETAILS_TTL_MS = 5 * 60 * 1000;
const userDetailsCache = new Map<
  string,
  { details: any; fetchedAt: number }
>();

const fetchUserDetails = async (userId: string) => {
  const userDoc = await firestore().collection("Users").doc(userId).get();
  const details = (userDoc.exists && userDoc.data()) || null;

  userDetailsCache.set(userId, { details, fetchedAt: Date.now() });
  return details;
};

// Reloads the names and pictures for these users, for pull-to-refresh.
// A lookup that fails keeps the profile it already had.
export const refreshUserDetails = (userIds: string[]) =>
  Promise.all(
    Array.from(new Set(userIds.filter(Boolean))).map((userId) =>
      fetchUserDetails(userId).catch((error) =>
        console.error("Error refreshing user from Firebase:", error)
      )
    )
  );

// Fetches only the users not yet cached, so the chat list can search the
// same names the cells display without re-requesting every profile.
export const ensureUserDetails = (userIds: string[]) =>
  Promise.all(
    Array.from(new Set(userIds.filter(Boolean)))
      .filter((userId) => !userDetailsCache.has(userId))
      .map((userId) =>
        fetchUserDetails(userId).catch((error) =>
          console.error("Error fetching user from Firebase:", error)
        )
      )
  );

// The name a cell would show for this user, or "" if it isn't known yet.
export const getCachedUserName = (userId: string | undefined): string =>
  (userId && userDetailsCache.get(userId)?.details?.name) || "";

// Enough rows to run past the bottom of the screen.
const SKELETON_ROWS = Array.from({ length: 8 }, (_, i) => i);

// One line of placeholder bars. The zero-width character gives it the exact
// height of a real line of text, so the bars sit where the text will.
const SkeletonLine = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.skeletonLine}>
    <Text size="p">{"\u200B"}</Text>
    <View style={styles.skeletonBars}>{children}</View>
  </View>
);

// Stands in for the name, date and last message of a cell.
const ChatTextSkeleton = () => (
  <View style={styles.messageText}>
    <SkeletonLine>
      <View style={[styles.skeletonBar, { width: "45%" }]} />
      <View style={[styles.skeletonBar, { width: 48 }]} />
    </SkeletonLine>
    <SkeletonLine>
      <View style={[styles.skeletonBar, { width: "70%" }]} />
    </SkeletonLine>
  </View>
);

const PulsingChatTextSkeleton = () => {
  const pulseStyle = useSkeletonPulse();

  return (
    <Animated.View style={pulseStyle}>
      <ChatTextSkeleton />
    </Animated.View>
  );
};

// Placeholder list built from the same styles as the real cells, so each chat
// lands exactly on the row that stood in for it.
export const ChatListSkeleton = () => {
  const pulseStyle = useSkeletonPulse();

  return (
    <Animated.View
      style={[styles.skeletonList, pulseStyle]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {SKELETON_ROWS.map((row) => (
        <View key={row} style={styles.skeletonRow}>
          <View style={styles.profileImage} />
          <View style={styles.messageContainer}>
            <ChatTextSkeleton />
          </View>
        </View>
      ))}
    </Animated.View>
  );
};

const getLastMessagePreview = (message: unknown) => {
  if (typeof message !== "string") return "";

  if (/^[^a-zA-Z]*image$/i.test(message.trim())) return "Image";

  // Line breaks would end the single-line preview at the first line.
  return message.replace(/\s+/g, " ").trim();
};

const ChatListCell = ({ chat, profilesVersion }: ChatListCellProps) => {
  const loggedInUser = useSelector((state: any) => state?.user?.user);
  const participants = chat?.participants;
  const otherUserId = participants?.find(
    (userId: string) => userId !== loggedInUser?.uid
  );
  const embeddedUserData = useMemo(
    () => (otherUserId ? chat?.[otherUserId] : undefined),
    [chat, otherUserId]
  );
  const [otherUserDetails, setOtherUserDetails] = useState<any>(
    () => (otherUserId && userDetailsCache.get(otherUserId)?.details) || null
  );
  const [hasCheckedUser, setHasCheckedUser] = useState(
    () => !otherUserId || userDetailsCache.has(otherUserId)
  );

  // Keyed on the user alone: the chat document changes with every message,
  // and that must not send the cell back to its loading state.
  useEffect(() => {
    const cached = otherUserId ? userDetailsCache.get(otherUserId) : undefined;
    setOtherUserDetails(cached?.details ?? null);
    setHasCheckedUser(!otherUserId || !!cached);

    if (!otherUserId) return;
    if (cached && Date.now() - cached.fetchedAt < USER_DETAILS_TTL_MS) return;

    let isActive = true;

    const fetchUserFromFirebase = async () => {
      try {
        const details = await fetchUserDetails(otherUserId);
        if (isActive) {
          setOtherUserDetails(details);
          setHasCheckedUser(true);
        }
      } catch (error) {
        console.error("Error fetching user from Firebase:", error);
        if (isActive) setHasCheckedUser(true);
      }
    };

    fetchUserFromFirebase();

    return () => {
      isActive = false;
    };
  }, [otherUserId, profilesVersion]);

  const otherUserName =
    otherUserDetails?.name ||
    embeddedUserData?.name ||
    (hasCheckedUser ? "Deleted account" : "");
  const otherUserProfilePicture =
    otherUserDetails?.profilePictureSmall ||
    otherUserDetails?.profilePicture ||
    embeddedUserData?.profilePictureSmall ||
    embeddedUserData?.profilePicture ||
    null;
  // The avatar waits for the profile lookup, so the full-size picture stored
  // with the chat isn't shown first and then swapped for the small one.
  const avatarSource = !hasCheckedUser
    ? null
    : otherUserProfilePicture
    ? { uri: otherUserProfilePicture }
    : require("../assets/images/placeholder.png");

  const lastMessage = chat?.lastMessage;
  const lastMessagePreview = getLastMessagePreview(lastMessage);
  const lastMessageTime = chat?.lastMessageTime;
  const date = new Date(
    lastMessageTime?.seconds * 1000 + lastMessageTime?.nanoseconds / 1000000
  );

  function formatMessageDate(dateString: string | Date): string {
    const messageDate = new Date(dateString);
    const today = new Date();

    // Zero out time parts
    messageDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const msInDay = 1000 * 60 * 60 * 24;
    const dayDiff = Math.round(
      (today.getTime() - messageDate.getTime()) / msInDay
    );

    if (dayDiff === 0) return "Today";
    if (dayDiff === 1) return "Yesterday";
    if (dayDiff < 7) {
      return messageDate.toLocaleDateString("en-US", { weekday: "long" }); // e.g. "Monday"
    }

    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }); // e.g. "June 3"
  }

  return (
    <TouchableOpacity
      onPress={() => {
        if (!loggedInUser?.uid || !chat?.id) return;
        router.push({
          pathname: "/artist/IndividualChat",
          params: {
            existingChatId: chat.id,
            otherUserName,
            otherUserId,
            otherUserProfilePicture,
            otherUser: otherUserId,
          },
        });
      }}
      style={styles.chatListCellFlexBox}
    >
      <View style={styles.profileImage}>
        {avatarSource && (
          <ExpoImage
            source={avatarSource}
            style={styles.avatar}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
        )}
      </View>
      <View style={styles.messageContainer}>
        <SkeletonReveal
          loading={!otherUserName}
          skeleton={<PulsingChatTextSkeleton />}
          fill
        >
          <View style={styles.messageText}>
            <View style={styles.row1}>
              <Text
                size="p"
                weight="semibold"
                color="#ffffff"
                numberOfLines={1}
                style={styles.name}
              >
                {otherUserName ? otherUserName : ""}
              </Text>
              <Text size="p" weight="normal" color="#B2B2B2">
                {date ? formatMessageDate(date) : ""}
              </Text>
            </View>
            <Text size="p" weight="normal" color="#B2B2B2" numberOfLines={1}>
              {lastMessagePreview}
            </Text>
          </View>
        </SkeletonReveal>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatListCellFlexBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileImage: {
    marginVertical: 16,
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: SKELETON_DIM_COLOR,
    overflow: "hidden",
  },
  avatar: {
    height: "100%",
    width: "100%",
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "stretch",
    borderBottomColor: "#525252",
    borderBottomWidth: 0.33,
  },
  messageText: {
    gap: 4,
  },
  skeletonList: {
    flex: 1,
    overflow: "hidden",
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  skeletonLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonBars: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skeletonBar: {
    height: 12,
    borderRadius: 4,
    backgroundColor: SKELETON_DIM_COLOR,
  },
  row1: {
    justifyContent: "space-between",
    flexDirection: "row",
    gap: 8,
  },
  name: {
    flexShrink: 1,
  },
  divider: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    height: 0.5,
  },
});

export default ChatListCell;

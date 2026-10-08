import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import Text from "@/components/Text";
import ArtistSearchCard from "@/components/ArtistSearchCard";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  selectBlockedUserIds,
  selectSafetyHydrated,
} from "@/redux/slices/safetySlice";
import { filterBlockedArtists } from "@/utils/safetyFilters";
import { useRealtimeDocsByIds } from "@/hooks/useRealtimeDocsByIds";

const FavouriteArtists = () => {
  const { width } = Dimensions.get("window");
  const adjustedWidth = width - 42;

  const userFirestore = useSelector((state: any) => state.user.userFirestore);
  const currentUserId = useSelector(
    (state: RootState) => state.user.user?.uid,
  );
  const blockedUserIds = useSelector(selectBlockedUserIds);
  const safetyHydrated = useSelector(selectSafetyHydrated);

  // Followed artists are loaded by ID, so they show up whether or not
  // the Home / Search lists happen to have them
  const {
    docs: followedArtists,
    loading: artistsLoading,
    refresh,
  } = useRealtimeDocsByIds("Users", userFirestore?.followedArtists);

  const favoritedArtists = useMemo(() => {
    if (currentUserId && !safetyHydrated) return [];

    return filterBlockedArtists(followedArtists, blockedUserIds);
  }, [blockedUserIds, currentUserId, followedArtists, safetyHydrated]);

  const loading =
    favoritedArtists.length === 0 &&
    (artistsLoading || (!!currentUserId && !safetyHydrated));
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          paddingBottom: 16,
        }}
      >
        <Text size="p" weight="normal" color="#A7A7A7">
          {loading
            ? " "
            : `${favoritedArtists.length} favorite ${
                favoritedArtists.length === 1 ? "artist" : "artists"
              }`}
        </Text>
      </View>
      <FlatList
        showsVerticalScrollIndicator={Platform.OS !== "ios"}
        data={favoritedArtists}
        renderItem={({ item, index }) => (
          <View
            style={{
              width: adjustedWidth / 3,
              marginRight: index % 3 === 0 ? 5 : 0, // Right margin for the 1st column
              marginLeft: index % 3 === 2 ? 5 : 0, // Left margin for the 3rd column
            }}
          >
            <ArtistSearchCard artist={item} />
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={["#fff"]}
            progressBackgroundColor="#1C1C1C"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator color="#DAB769" />
            ) : (
              <Text size="h4" weight="medium" color="#A7A7A7">
                You have no favorite artists yet
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
};

export default FavouriteArtists;

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    textAlign: "center",
  },
});

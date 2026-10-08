import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import Text from "@/components/Text";
import ImageGallery from "@/components/ImageGallery";
import React, { useMemo, useState } from "react";
import { useRealtimeUserLikedPublications } from "@/hooks/useRealtimeLikedPublications";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useSelector } from "react-redux";
import { Publication, TypesenseResult } from "@/hooks/useTypesense";
import {
  selectBlockedUserIds,
  selectReportedPublicationIds,
  selectSafetyHydrated,
} from "@/redux/slices/safetySlice";
import { filterHiddenPublications } from "@/utils/safetyFilters";

const FavouriteTattoos = () => {
  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user
  );
  const currentUserId = loggedInUser?.uid;
  const likedPublicationsData = useRealtimeUserLikedPublications(currentUserId);
  const blockedUserIds = useSelector(selectBlockedUserIds);
  const reportedPublicationIds = useSelector(selectReportedPublicationIds);
  const safetyHydrated = useSelector(selectSafetyHydrated);
  const visibleLikedPublications = useMemo(() => {
    if (currentUserId && !safetyHydrated) return [];

    return filterHiddenPublications(
      likedPublicationsData?.likedPublications ?? [],
      blockedUserIds,
      reportedPublicationIds,
    );
  }, [
    blockedUserIds,
    currentUserId,
    likedPublicationsData?.likedPublications,
    reportedPublicationIds,
    safetyHydrated,
  ]);
  const totalLiked = visibleLikedPublications.length;
  const loading =
    likedPublicationsData.loading && visibleLikedPublications.length === 0;
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await likedPublicationsData.refresh();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, paddingVertical: 16 }}>
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
            : `${totalLiked} liked tattoo${totalLiked !== 1 ? "s" : ""}`}
        </Text>
      </View>
      {visibleLikedPublications.length > 0 || loading ? (
        <ImageGallery
          images={
            visibleLikedPublications.map((item) => ({
              document: item,
            })) as TypesenseResult<Publication>[]
          }
          loading={loading}
          onRefresh={onRefresh}
          refreshing={refreshing}
        ></ImageGallery>
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
              colors={["#fff"]}
              progressBackgroundColor="#1C1C1C"
            />
          }
        >
          <Text size="h4" weight="medium" color="#A7A7A7">
            You have no liked tattoos yet
          </Text>
          {/* <Text
            size="p"
            weight="normal"
            color="#A7A7A7"
            style={styles.emptyText}
          >
            Your favorited tattoos will appear here
          </Text> */}
        </ScrollView>
      )}
    </View>
  );
};

export default FavouriteTattoos;

const styles = StyleSheet.create({
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    textAlign: "center",
  },
});

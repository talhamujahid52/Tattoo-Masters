import {
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  Pressable,
} from "react-native";
import Input from "@/components/Input";
import Text from "@/components/Text";
import React, { useState, useEffect, useMemo, useRef } from "react";
import ArtistProfileCard, {
  ArtistProfileCardSkeletonRow,
} from "@/components/ArtistProfileCard";
import { SkeletonReveal } from "@/components/Skeleton";
import ImageGallery from "@/components/ImageGallery";
import { useDispatch, useSelector } from "react-redux";
import { setAllArtists } from "@/redux/slices/artistSlice";
import { useRouter } from "expo-router";
import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { getCurrentChatId } from "@/utils/NavState";
import useTypesense from "@/hooks/useTypesense";
import { UserFirestore } from "@/types/user";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { addSearch } from "@/redux/slices/recentSearchesSlice";
import useBackgroundUpload from "@/hooks/useBackgroundUpload";
import type { RootState } from "@/redux/store";
import {
  selectBlockedUserIds,
  selectSafetyHydrated,
} from "@/redux/slices/safetySlice";
import { filterBlockedArtists } from "@/utils/safetyFilters";

const ARTIST_CARD_GAP = 10;

const Home = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastCompletedCount, setLastCompletedCount] = useState(0);
  const artistsTs = useTypesense();
  const publicationsTs = useTypesense();
  const [page, setPage] = useState(1);
  // Flip once the first request settles, so an empty section can be told
  // apart from one that is still loading.
  const [artistsFetched, setArtistsFetched] = useState(false);
  const [publicationsFetched, setPublicationsFetched] = useState(false);
  const initialNotificationHandledRef = useRef(false);
  const { queue: uploadQueue, completedUploads } = useBackgroundUpload();

  const artists: any[] = useSelector(
    (state: any) => state.artist.allArtists,
  );
  const currentUserId = useSelector(
    (state: RootState) => state.user.user?.uid,
  );
  const blockedUserIds = useSelector(selectBlockedUserIds);
  const safetyHydrated = useSelector(selectSafetyHydrated);
  // Content stays hidden until the signed-in user's block list has loaded
  const awaitingSafety = !!currentUserId && !safetyHydrated;
  const visibleArtists: any[] = useMemo(
    () =>
      currentUserId && !safetyHydrated
        ? []
        : filterBlockedArtists(artists, blockedUserIds),
    [artists, blockedUserIds, currentUserId, safetyHydrated],
  );
  const showArtistsSkeleton =
    visibleArtists.length === 0 && (!artistsFetched || awaitingSafety);

  // Upload tracking for auto-refresh
  const { queue, completedCount, failedCount, pendingCount, uploadingCount } =
    useBackgroundUpload();

  // Shared values for the animation of the popular artists section
  const artistsOpacity = useSharedValue(1);
  const artistsTranslateY = useSharedValue(0);
  const artistsHeight = useSharedValue(280); // initial height for the FlatList container

  const animatedArtistsStyle = useAnimatedStyle(() => {
    return {
      opacity: artistsOpacity.value,
      transform: [{ translateY: artistsTranslateY.value }],
      height: artistsHeight.value,
    };
  });

  // Fetch artists and update Redux state
  const fetchUsers = async () => {
    try {
      const hits = await artistsTs.search({
        collection: "Users",
        query: "*",
        queryBy: "name",
        filterBy: "isArtist:=true",
      });
      const fetchedArtists = hits.map((hit) => hit.document) as UserFirestore[];

      dispatch(
        setAllArtists(
          fetchedArtists.map(({ id, ...data }) => ({
            data,
            id,
          }))
        )
      );
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setArtistsFetched(true);
    }
  };

  // Handler for when the user submits the search
  const handleSearchSubmit = async () => {
    router.push({
      pathname: "/(bottomTabs)/Home/SearchAllHome",
      params: { query: searchText, type: "tattoos" },
    });

    dispatch(addSearch({ text: searchText, type: "tattoos" }));
    setSearchText("");
  };

  // Initial publications search on mount
  useEffect(() => {
    publicationsTs
      .search({
        collection: "publications",
        page: 1,
        per_page: 21,
      })
      // The hook already logs the failure
      .catch(() => {})
      .finally(() => setPublicationsFetched(true));
  }, [publicationsTs.search]);

  const handleLoadMore = () => {
    if (publicationsTs.loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    publicationsTs.search({
      collection: "publications",
      page: nextPage,
      per_page: 21,
      append: true,
    });
  };

  // Fetch artists on mount or when typesense dependency changes
  useEffect(() => {
    fetchUsers();
  }, [artistsTs.search]);

  // Cold-start notification handling when arriving to Home
  useEffect(() => {
    if (initialNotificationHandledRef.current) {
      return;
    }
    initialNotificationHandledRef.current = true;

    let handled = false;
    const navigateFromData = async (data: any) => {
      if (!data) return;
      const incomingChatId = String(data?.chatId || "");
      const incomingSenderId = String(data?.senderId || "");
      if (incomingSenderId && blockedUserIds.includes(incomingSenderId)) return;
      // No server-side access check before navigating: the chat screen
      // verifies the thread itself and backs out if it is unavailable.
      if (incomingChatId && !currentUserId) return;
      const url = typeof data?.url === "string" ? data.url : "";
      const currentChatId = getCurrentChatId();
      if (url) {
        router.push(url);
        return;
      }
      if (incomingChatId && incomingSenderId) {
        // If we're already in this chat, do nothing
        if (currentChatId && currentChatId === incomingChatId) return;
        router.push({
          pathname: "/artist/IndividualChat",
          params: {
            existingChatId: incomingChatId,
            otherUserId: incomingSenderId,
          },
        });
      }
    };

    (async () => {
      try {
        // Prefer native FCM cold-start
        const rm = await messaging().getInitialNotification();
        if (rm?.data && !handled) {
          handled = true;
          const raw: any = rm.data || {};
          const data = raw?.data ? raw.data : raw;
          await navigateFromData(data);
          return;
        }
      } catch {}

      try {
        // Fallback to Expo last response
        const resp = await Notifications.getLastNotificationResponseAsync();
        if (resp?.notification && !handled) {
          handled = true;
          const raw: any = resp.notification.request.content.data || {};
          const data = raw?.data ? raw.data : raw;
          await navigateFromData(data);
        }
      } catch {}
    })();
  }, [blockedUserIds, currentUserId, router]);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setPage(1);
    publicationsTs.search({
      collection: "publications",
      page: 1,
      per_page: 21,
    });
    setRefreshing(false);
  };

  // Header component for the ImageGallery
  const ListHeader = (
    <View style={styles.headerContainer}>
      <View style={{ position: "relative", paddingHorizontal: 16 }}>
        <Input
          value={searchText}
          inputMode="text"
          placeholder="Search for ideas"
          leftIcon={"search"}
          onChangeText={(text) => setSearchText(text)}
          onSubmitEditing={handleSearchSubmit}
          rightIcon={searchText !== "" && "cancel"}
          rightIconOnPress={() => setSearchText("")}
          backgroundColour="#151515"
        />
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/Search",
              params: { focusSearch: String(Date.now()) },
            })
          }
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
          }}
        />
      </View>

      {/* Animated container for the popular artists section */}
      <Animated.View style={[animatedArtistsStyle, { overflow: "hidden" }]}>
        <View style={styles.flatlistHeadingContainer}>
          <Text size="h4" weight="semibold" color="#FBF6FA">
            Popular artists near you
          </Text>
          <TouchableOpacity
            onPress={() => {
              router.push("/(bottomTabs)/Search");
            }}
          >
            <Text size="h4" weight="normal" color="#DAB769">
              See more
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ paddingLeft: 16 }}>
          <SkeletonReveal
            loading={showArtistsSkeleton}
            skeleton={<ArtistProfileCardSkeletonRow gap={ARTIST_CARD_GAP} />}
          >
            <FlatList
              data={visibleArtists}
              renderItem={({ item }) => <ArtistProfileCard artist={item} />}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: ARTIST_CARD_GAP }}
              ListFooterComponent={
                <TouchableOpacity
                  onPress={() => {
                    router.push("/(bottomTabs)/Search");
                  }}
                  style={{
                    width: 170,
                    height: 170,
                    borderRadius: 16,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Image
                    source={require("../../../assets/images/searchMoreArtists.png")}
                    style={{
                      width: "100%",
                      height: "100%",
                      resizeMode: "cover",
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: 40,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      paddingHorizontal: 16,
                    }}
                  >
                    <Text
                      size="h4"
                      weight="semibold"
                      color="#FBF6FA"
                      style={{ textAlign: "center" }}
                    >
                      Wanna find more artists?
                    </Text>
                  </View>
                </TouchableOpacity>
              }
            />
          </SkeletonReveal>
        </View>
      </Animated.View>

      <Text
        size="h4"
        weight="semibold"
        color="#FBF6FA"
        style={{ marginTop: 24, marginBottom: 8, paddingLeft: 16 }}
      >
        Find your inspiration
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ImageGallery
        images={publicationsTs.results}
        onEndReached={handleLoadMore}
        onRefresh={onRefresh}
        refreshing={refreshing}
        loading={!publicationsFetched || awaitingSafety}
        ListHeaderComponent={ListHeader}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 15,
  },
  headerContainer: {
    backgroundColor: "#000",
  },
  flatlistHeadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 24,
    paddingHorizontal: 16,
  },
});

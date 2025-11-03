import {
  StyleSheet,
  View,
  Image,
  // Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { Zoomable, ZoomableRef } from "@likashefqet/react-native-image-zoom";
import Text from "@/components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useBottomSheet from "@/hooks/useBottomSheet";
import ImageActionsBottomSheet from "@/components/BottomSheets/ImageActionsBottomSheet";
import LoginBottomSheet from "@/components/BottomSheets/LoginBottomSheet";
import ReportBottomSheet from "@/components/BottomSheets/ReportBottomSheet";
import useTypesense from "@/hooks/useTypesense"; // TypesenseResult, // Publication,
// import { doc } from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { UserFirestore } from "@/types/user";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { toggleLikePublication } from "@/utils/firebase/userFunctions";
import { useSelector } from "react-redux";
import { useIsPublicationLiked } from "@/hooks/useIsPublicationLiked";
import usePublicationLikes from "@/hooks/usePublicationLikes";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";

type TattooDetailContent = {
  id: string;
  caption: string;
  photoUrlVeryHigh?: string;
  photoUrlHigh?: string;
  styles: string[];
  stylesJson: string;
  userId?: string;
  deleteUrls: Record<string, string>;
  deleteUrlsJson: string;
};

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;
// const ZOOM_IN_X = 146;
// const ZOOM_IN_Y = 491;

const ReportImageOptions = [
  { label: "Nudity or sexual content", value: "Nudity or sexual content" },
  { label: "Inappropriate content", value: "Inappropriate content" },
  { label: "Image theft", value: "Image theft" },
  { label: "Other", value: "Other" },
];

const TattooDetail: React.FC = () => {
  const zoomableRef = useRef<ZoomableRef>(null);

  const scale = useSharedValue(1);

  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user
  );
  const currentUserId = loggedInUser?.uid;

  // const [isZoomed, setIsZoomed] = useState(false);

  // const zoomIn = () => {
  //   zoomableRef?.current?.zoom({ scale: 5, x: ZOOM_IN_X, y: ZOOM_IN_Y });
  // };
  // const zoomOut = () => {
  //   zoomableRef?.current?.reset();
  // };
  //
  // const getInfo = () => {
  //   const info = zoomableRef?.current?.getInfo();
  //   Alert.alert("Info", JSON.stringify(info, null, 2));
  // };

  const animatedStyle = useAnimatedStyle(
    () => ({
      borderRadius: 30 / scale.value,
    }),
    [scale]
  );
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Record<string, string | string[]>>();

  const toSingle = (value: string | string[] | undefined): string | undefined => {
    if (Array.isArray(value)) return value[0];
    return value;
  };

  const idFromParams = toSingle(params.id) ?? "";
  const captionFromParams = toSingle(params.caption) ?? "";
  const photoUrlVeryHighFromParams = toSingle(params.photoUrlVeryHigh);
  const photoUrlHighFromParams = toSingle(params.photoUrlHigh);
  const userIdFromParams = toSingle(params.userId);
  const stylesJsonParam = toSingle(params.stylesJson);
  const deleteUrlsJsonParam = toSingle(params.deleteUrlsJson);

  const initialStyles = React.useMemo(() => {
    if (stylesJsonParam) {
      try {
        const parsed = JSON.parse(stylesJsonParam);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item));
        }
      } catch (error) {
        // ignore parse errors and fall back to empty array
      }
    }
    return [] as string[];
  }, [stylesJsonParam]);

  const initialDeleteUrls = React.useMemo(() => {
    if (deleteUrlsJsonParam) {
      try {
        const parsed = JSON.parse(deleteUrlsJsonParam);
        if (parsed && typeof parsed === "object") {
          return parsed as Record<string, string>;
        }
      } catch (error) {
        // ignore parse errors and fall back to empty object
      }
    }
    return {} as Record<string, string>;
  }, [deleteUrlsJsonParam]);

  const initialDetail = React.useMemo<TattooDetailContent>(() => ({
    id: idFromParams,
    caption: captionFromParams,
    photoUrlVeryHigh: photoUrlVeryHighFromParams,
    photoUrlHigh: photoUrlHighFromParams,
    userId: userIdFromParams,
    styles: initialStyles,
    stylesJson: stylesJsonParam ?? JSON.stringify(initialStyles),
    deleteUrls: initialDeleteUrls,
    deleteUrlsJson: deleteUrlsJsonParam ?? JSON.stringify(initialDeleteUrls),
  }), [
    idFromParams,
    captionFromParams,
    photoUrlVeryHighFromParams,
    photoUrlHighFromParams,
    userIdFromParams,
    initialStyles,
    stylesJsonParam,
    initialDeleteUrls,
    deleteUrlsJsonParam,
  ]);

  const [fetchedDetail, setFetchedDetail] = useState<TattooDetailContent | null>(
    null,
  );
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const detail = fetchedDetail ?? initialDetail;
  const id = detail.id;
  const caption = detail.caption;
  const deleteUrls = detail.deleteUrls ?? {};
  const deleteUrlsJson = detail.deleteUrlsJson ?? "{}";
  const existingStylesJson = detail.stylesJson ?? "[]";
  const userId = detail.userId;
  const photoUrlVeryHigh = detail.photoUrlVeryHigh || detail.photoUrlHigh;

  // const { width, height } = Dimensions.get("window");

  const {
    BottomSheet: ImageActionsSheet,
    show: showImageActionsSheet,
    hide: hideImageActionsSheet,
  } = useBottomSheet();
  const {
    BottomSheet: ReportSheet,
    show: showReportSheet,
    hide: hideReportSheet,
  } = useBottomSheet();
  const {
    BottomSheet: LoggingInBottomSheet,
    show: showLoggingInBottomSheet,
    hide: hideLoggingInBottomSheet,
  } = useBottomSheet();

  useEffect(() => {
    if (!initialDetail.id) return;
    if (initialDetail.photoUrlVeryHigh) return;
    if (fetchedDetail) return;

    let cancelled = false;

    const loadDetail = async () => {
      setIsFetchingDetail(true);
      try {
        const snap = await firestore()
          .collection("publications")
          .doc(initialDetail.id)
          .get();
        if (!snap.exists || cancelled) return;
        const data = snap.data() as any;
        const styles = Array.isArray(data?.styles)
          ? data.styles.map((item: any) => String(item))
          : [];
        const downloadUrls = data?.downloadUrls || {};
        const deleteUrlsResult =
          data?.deleteUrls && typeof data.deleteUrls === "object"
            ? (data.deleteUrls as Record<string, string>)
            : {};
        setFetchedDetail({
          id: snap.id,
          caption: data?.caption || "",
          photoUrlVeryHigh: downloadUrls?.veryHigh,
          photoUrlHigh: downloadUrls?.high,
          userId: data?.userId,
          styles,
          stylesJson: JSON.stringify(styles),
          deleteUrls: deleteUrlsResult,
          deleteUrlsJson: JSON.stringify(deleteUrlsResult),
        });
      } catch (error) {
        console.error("Failed to load tattoo details", error);
      } finally {
        if (!cancelled) {
          setIsFetchingDetail(false);
        }
      }
    };

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [initialDetail, fetchedDetail]);

  // Use the Typesense hook to fetch the user details from the "Users" collection.
  const { getDocument } = useTypesense();
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<UserFirestore | undefined>();
  const isLikedFromHook = useIsPublicationLiked(id, currentUserId);
  const totalLikesFromHook = usePublicationLikes(id);

  const [liked, setLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);

  useEffect(() => {
    setLiked(isLikedFromHook);
  }, [isLikedFromHook]);

  useEffect(() => {
    setLikesCount(totalLikesFromHook ?? 0);
  }, [totalLikesFromHook]);

  const toggleLikePublicationOnHandle = async () => {
    try {
      if (!loggedInUser) {
        showLoggingInBottomSheet();
        return;
      }

      // Optimistic update
      const nextLiked = !liked;
      setLiked(nextLiked);
      setLikesCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));

      setLoading(true);
      await toggleLikePublication(id, currentUserId);
    } catch (e) {
      // Revert optimistic update on failure
      setLiked((prev) => !prev);
      setLikesCount((prev) => Math.max(0, prev + (liked ? -1 : 1)));
      console.log("failed to like unlike photo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      getDocument({ collection: "Users", documentId: userId })
        .then((doc) => {
          // console.log("user details", doc);
          setUserDetails(doc);
        })
        .catch((err) =>
          console.error("Error fetching user details from Typesense:", err)
        );
    }
  }, [userId, getDocument]);

  return (
    <View
      style={{
        flex: 1,
        borderWidth: 2,
        position: "relative",
      }}
    >
      <ImageActionsSheet
        InsideComponent={
          <ImageActionsBottomSheet
            hideImageActionsSheet={hideImageActionsSheet}
            showReportSheet={showReportSheet}
            showLoggingInBottomSheet={showLoggingInBottomSheet}
            isOwner={Boolean(currentUserId && userId && currentUserId === userId)}
            onEditTattoo={() => {
              router.push({
                pathname: "/artist/UploadTattoo",
                params: {
                  mode: "edit",
                  docId: id,
                  existingCaption: caption,
                  existingStylesJson: existingStylesJson,
                  existingImageUrl: photoUrlVeryHigh
                    ? encodeURIComponent(photoUrlVeryHigh)
                    : undefined,
                  existingDeleteUrlsJson: deleteUrlsJson,
                },
              });
            }}
            onDeleteTattoo={async () => {
              Alert.alert(
                "Delete Tattoo",
                "Are you sure you want to delete this tattoo? This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        setLoading(true);
                        const paths: string[] = [
                          deleteUrls?.small,
                          deleteUrls?.medium,
                          deleteUrls?.high,
                          deleteUrls?.veryHigh,
                        ].filter(Boolean);
                        // Attempt to delete each stored file; ignore missing ones
                        await Promise.all(
                          paths.map(async (p) => {
                            try {
                              await storage().ref(p).delete();
                            } catch (e) {
                              // ignore errors for missing files
                            }
                          }),
                        );
                        // Delete the Firestore document
                        await firestore().collection("publications").doc(String(id)).delete();
                        router.back();
                      } catch (e) {
                        Alert.alert(
                          "Delete Failed",
                          "We couldn't delete this tattoo. Please try again.",
                        );
                      } finally {
                        setLoading(false);
                      }
                    },
                  },
                ],
              );
            }}
          />
        }
      />
      <ReportSheet
        InsideComponent={
          <ReportBottomSheet
            hideReportSheet={hideReportSheet}
            title="Image"
            options={ReportImageOptions}
            reportItem={id}
          />
        }
      />
      <LoggingInBottomSheet
        InsideComponent={
          <LoginBottomSheet hideLoginBottomSheet={hideLoggingInBottomSheet} />
        }
      />

      <View
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <Zoomable
          ref={zoomableRef}
          scale={scale}
          minScale={MIN_SCALE}
          maxScale={MAX_SCALE}
          style={animatedStyle}
        >
          {photoUrlVeryHigh ? (
            <ExpoImage
              style={{
                height: "100%",
                bottom: insets.bottom,
                width: "100%",
              }}
              contentFit="contain"
              source={{ uri: photoUrlVeryHigh }}
            />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#000",
              }}
            >
              {isFetchingDetail ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Text size="p" weight="normal" color="#FBF6FA">
                  Image unavailable
                </Text>
              )}
            </View>
          )}
        </Zoomable>
      </View>
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.98)", "transparent"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        id="bottom-container"
        style={{
          width: "100%",
          padding: 16,
          paddingBottom: insets.bottom + 10,
          position: "absolute",
          bottom: 0,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              if (!userDetails?.uid) return;
              router.push({
                pathname: "/artist/ArtistProfile",
                params: { artistId: userDetails.uid },
              });
            }}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Image
              style={{
                width: 42,
                height: 42,
                borderRadius: 50,
                backgroundColor: "white",
                marginRight: 8,
              }}
              source={
                userDetails?.profilePictureSmall || userDetails?.profilePicture
                  ? {
                      uri:
                        userDetails.profilePictureSmall ??
                        userDetails.profilePicture,
                    }
                  : require("../../assets/images/placeholder.png")
              }
            />

            <View />
            <Text size="p" weight="semibold" color="#FFF">
              {userDetails?.name}
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity
              onPress={toggleLikePublicationOnHandle}
              disabled={loading}
              hitSlop={{ top: 8, left: 8, right: 4, bottom: 8 }}
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              {liked ? (
                <Ionicons name="heart" size={24} color="#fff" />
              ) : (
                <Ionicons name="heart-outline" size={24} color="#fff" />
              )}
              <Text
                size="medium"
                weight="normal"
                style={{ minWidth: 10 }}
                color="#fff"
              >
                {likesCount ?? 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                showImageActionsSheet();
              }}
            >
              <Image
                style={{ height: 26, width: 26 }}
                source={require("../../assets/images/more_vert_white.png")}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text size="p" weight="normal" color="#FBF6FA">
          {caption}
        </Text>
      </LinearGradient>
    </View>
  );
};

export default TattooDetail;

const styles = StyleSheet.create({});

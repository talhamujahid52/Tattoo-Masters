import {
  StyleSheet,
  View,
  Image,
  // Dimensions,
  TouchableOpacity,
  // Alert,
} from "react-native";
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
    (state: any) => state?.user?.user,
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
  const {
    photoUrlVeryHigh,
    // photoUrlHigh,
    id,
    caption,
    // styles,
    userId,
    // timestamp,
  } = useLocalSearchParams<any>();

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

  // Use the Typesense hook to fetch the user details from the "Users" collection.
  const { getDocument } = useTypesense();
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<UserFirestore | undefined>();
  const isLiked = useIsPublicationLiked(id, currentUserId);
  const totalLikes = usePublicationLikes(id);
  const toggleLikePublicationOnHandle = async () => {
    try {
      loggedInUser
        ? (setLoading(true), await toggleLikePublication(id, currentUserId))
        : showLoggingInBottomSheet();
    } catch {
      console.log("failed to like unlike photo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      getDocument({ collection: "Users", documentId: userId })
        .then((doc) => {
          console.log("user details", doc);
          setUserDetails(doc);
        })
        .catch((err) =>
          console.error("Error fetching user details from Typesense:", err),
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
          <Image
            style={{
              height: "100%",
              bottom: insets.bottom,
              width: "100%",
              resizeMode: "contain",
            }}
            source={{ uri: photoUrlVeryHigh }}
          />
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
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              style={{
                width: 42,
                height: 42,
                borderRadius: 50,
                backgroundColor: "white",
                marginRight: 8,
              }}
              source={{
                uri:
                  userDetails?.profilePictureSmall ??
                  userDetails?.profilePicture,
              }}
            />
            <View />
            <Text size="p" weight="semibold" color="#FFF">
              {userDetails?.name}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity
              onPress={toggleLikePublicationOnHandle}
              disabled={loading}
              hitSlop={{ top: 8, left: 8, right: 4, bottom: 8 }}
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              {isLiked ? (
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
                {totalLikes ?? 0}
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

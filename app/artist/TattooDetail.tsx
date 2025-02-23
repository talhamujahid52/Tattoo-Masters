import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import Text from "@/components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useBottomSheet from "@/hooks/useBottomSheet";
import ImageActionsBottomSheet from "@/components/BottomSheets/ImageActionsBottomSheet";
import useTypesense, {
  Publication,
  TypesenseResult,
} from "@/hooks/useTypesense";
import { doc } from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { UserFirestore } from "@/types/user";

const TattooDetail: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    photoUrlVeryHigh,
    photoUrlHigh,
    id,
    caption,
    styles,
    userId,
    timestamp,
  } = useLocalSearchParams<any>();

  const { width, height } = Dimensions.get("window");
  const { BottomSheet, show, hide } = useBottomSheet();
  // Use the Typesense hook to fetch the user details from the "Users" collection.
  const { getDocument } = useTypesense();
  const [userDetails, setUserDetails] = useState<UserFirestore | undefined>();

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
      <BottomSheet InsideComponent={<ImageActionsBottomSheet hide1={hide} />} />

      <View
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <Image
          style={{
            height: "100%",
            width: "100%",
            resizeMode: "contain",
          }}
          source={{ uri: photoUrlVeryHigh }}
        />
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Image
              style={{ height: 26, width: 26 }}
              source={require("../../assets/images/favorite-outline-white.png")}
            />
            <Text size="medium" weight="normal" color="#fff">
              0
            </Text>
            <TouchableOpacity
              onPress={() => {
                show();
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

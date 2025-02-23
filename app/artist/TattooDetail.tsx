import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import Text from "@/components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useBottomSheet from "@/hooks/useBottomSheet";
import ImageActionsBottomSheet from "@/components/BottomSheets/ImageActionsBottomSheet";
import { Publication, TypesenseResult } from "@/hooks/useTypesense";
import { doc } from "@react-native-firebase/firestore";

const TattooDetail: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    photoUrlVeryHigh,
    photoUrlHigh,
    id,
    caption,
    styles,
    user,
    timestamp,
  } = useLocalSearchParams<any>();

  const { width, height } = Dimensions.get("window");
  const { BottomSheet, show, hide } = useBottomSheet();
  //
  //

  // const { document }: TypesenseResult<Publication> = JSON.parse(tattoo);
  // console.log("document", document.downloadUrls.small);

  return (
    <View
      style={{
        flex: 1,
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
      <View
        style={{
          height: 100,
          width: width - 32,
          position: "absolute",
          bottom: insets.bottom,
          left: 16,
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
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 50,
                backgroundColor: "green",
                marginRight: 8,
              }}
            />
            <Text size="p" weight="semibold" color="#FFF">
              Abid Iqbal
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Image
              style={{ height: 26, width: 26 }}
              source={require("../../assets/images/favorite-outline-white.png")}
            />
            <Text size="medium" weight="normal" color="#fff">
              245
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
          Lorem ipsum dolor sit amet, contetur adipiscing elit, sed do eiusmod
          tempor incididunt.
        </Text>
      </View>
    </View>
  );
};

export default TattooDetail;

const styles = StyleSheet.create({});

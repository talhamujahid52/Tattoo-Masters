import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { ResponsiveGrid } from "react-native-flexible-grid";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { Publication, TypesenseResult } from "@/hooks/useTypesense";

interface DataProp {
  id: number;
  widthRatio?: number;
  heightRatio?: number;
  imageUrl: string;
}
const originalData = [
  {
    imageUrl: "https://picsum.photos/200/300?random=1",
  },
  {
    imageUrl: "https://picsum.photos/200/300?random=2",
  },
  {
    imageUrl: "https://picsum.photos/200/300?random=3",
    widthRatio: 1,
    heightRatio: 2,
  },
  {
    imageUrl: "https://picsum.photos/200/300?random=4",
  },
  {
    imageUrl: "https://picsum.photos/200/300?random=5",
  },
  {
    imageUrl: "https://picsum.photos/200/300?random=6",
    widthRatio: 1,
    heightRatio: 2,
  },
  {
    imageUrl: "https://picsum.photos/200/300?random=7",
  },
  {
    imageUrl: "https://picsum.photos/200/300?random=8",
  },
  {
    imageUrl: "https://picsum.photos/200/300?random=9",
  },
  {
    imageUrl: "https://picsum.photos/200/300?random=10",
  },
];

interface Props {
  images: TypesenseResult<Publication>[];
}
const ImageGallery = ({ images }: Props) => {
  const router = useRouter();
  const loggedInUser = useSelector((state: any) => state?.user?.user);

  const renderItem = ({ item }: { item: TypesenseResult<Publication> }) => {
    return (
      <TouchableOpacity
        style={styles.boxContainer}
        onPress={() => {
          router.push({
            pathname: "/artist/TattooDetail",
            params: { tattoo: item.document.downloadUrls.veryHigh },
          });
        }}
      >
        <Image
          source={{ uri: item.document.downloadUrls.small }}
          style={styles.box}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <ResponsiveGrid
        maxItemsPerColumn={3}
        data={images}
        renderItem={renderItem}
        showScrollIndicator={false}
      />
    </View>
  );
};

export default ImageGallery;

const styles = StyleSheet.create({
  boxContainer: {
    flex: 1,
    margin: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  image: {
    width: 100,
    height: 100,
  },
  box: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  text: {
    color: "white",
    fontSize: 10,
    position: "absolute",
    bottom: 10,
  },
});

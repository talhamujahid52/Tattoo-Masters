import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import { ResponsiveGrid } from "react-native-flexible-grid";

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

const ImageGallery = () => {
  const renderItem = ({ item }: { item: DataProp }) => {
    return (
      <View style={styles.boxContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.box}
          resizeMode="cover"
        />
      </View>
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
        data={originalData}
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
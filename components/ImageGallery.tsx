import React, { useCallback } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { ResponsiveGrid } from "react-native-flexible-grid";
import { useRouter } from "expo-router";
import { TypesenseResult, Publication } from "@/hooks/useTypesense";

interface Props {
  images: TypesenseResult<Publication>[];
}

const ImageGallery = ({ images }: Props) => {
  const router = useRouter();
  const renderItem = useCallback(({ item }: { item: TypesenseResult<any> }) => {
    const doc = item.document;
    return (
      <TouchableOpacity
        style={styles.boxContainer}
        onPress={() => {
          router.push({
            pathname: "/artist/TattooDetail",
            params: {
              photoUrlVeryHigh: encodeURIComponent(doc?.downloadUrls?.veryHigh),
              photoUrlHigh: encodeURIComponent(doc?.downloadUrls?.high),
              id: doc.id,
              caption: doc.caption,
              styles: doc.styles,
              userId: doc.userId,
              timestamp: doc.timestamp,
            },
          });
        }}
      >
        <Image
          source={{ uri: item?.document?.downloadUrls?.small }}
          style={styles.box}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }, []);
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <ResponsiveGrid
        maxItemsPerColumn={3}
        data={images ?? []}
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

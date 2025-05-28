import React, { useCallback } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { ResponsiveGrid } from "react-native-flexible-grid";
import { useRouter } from "expo-router";
import { TypesenseResult, Publication } from "@/hooks/useTypesense";

interface Props {
  images?: TypesenseResult<Publication>[];
  imageUris?: {
    uri: string;
    name: string;
    caption: string;
    styles: string[];
  }[];
}

const ImageGallery = ({ images = [], imageUris = [] }: Props) => {
  const router = useRouter();
  const renderTypesenseItem = useCallback(
    ({ item }: { item: TypesenseResult<any> }) => {
      const doc = item.document;
      return (
        <TouchableOpacity
          style={styles.boxContainer}
          onPress={() => {
            router.push({
              pathname: "/artist/TattooDetail",
              params: {
                photoUrlVeryHigh: encodeURIComponent(
                  doc?.downloadUrls?.veryHigh,
                ),
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
            key={item?.document?.downloadUrls?.small}
            style={styles.box}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    },
    [],
  );

  const renderUriItem = useCallback(({ item }: { item: { uri: string } }) => {
    return (
      <View style={styles.boxContainer}>
        <Image
          source={{ uri: item.uri }}
          key={item?.uri}
          style={styles.box}
          resizeMode="cover"
        />
      </View>
    );
  }, []);

  const isTypesense = images.length > 0;
  const data = isTypesense
    ? images.map((item) => ({ ...item, widthRatio: 1, heightRatio: 1 }))
    : imageUris.map((item) => ({
        uri: item?.uri,
        widthRatio: 1,
        heightRatio: 1,
      }));
  const renderItem = isTypesense ? renderTypesenseItem : renderUriItem;

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <ResponsiveGrid
        maxItemsPerColumn={3}
        data={data}
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
    backgroundColor: "#202020",
  },
  text: {
    color: "white",
    fontSize: 10,
    position: "absolute",
    bottom: 10,
  },
});

import React, { useCallback } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { TypesenseResult, Publication } from "@/hooks/useTypesense";

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 3;
const ITEM_MARGIN = 2;
const ITEM_SIZE = (SCREEN_WIDTH - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

interface Props {
  images?: TypesenseResult<Publication>[];
  imageUris?: {
    uri: string;
    name: string;
    caption: string;
    styles: string[];
  }[];
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: React.ReactElement | null;
  contentContainerStyle?: object;
}

const ImageGallery = ({
  images = [],
  imageUris = [],
  onEndReached,
  onRefresh,
  refreshing = false,
  ListHeaderComponent,
  contentContainerStyle,
}: Props) => {
  const router = useRouter();

  const renderTypesenseItem = useCallback(
    ({ item }: { item: TypesenseResult<Publication> }) => {
      const doc = item.document;
      return (
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => {
            router.push({
              pathname: "/artist/TattooDetail",
              params: {
                photoUrlVeryHigh: encodeURIComponent(
                  doc?.downloadUrls?.veryHigh
                ),
                photoUrlHigh: encodeURIComponent(doc?.downloadUrls?.high),
                id: doc.id,
                caption: doc.caption,
                styles: doc.styles,
                stylesJson: JSON.stringify(doc?.styles || []),
                userId: doc.userId,
                timestamp: doc.timestamp,
                deleteUrlsJson: JSON.stringify(doc?.deleteUrls || {}),
              },
            });
          }}
        >
          <ExpoImage
            source={{ uri: doc?.downloadUrls?.small }}
            cachePolicy="disk"
            style={styles.image}
            contentFit="cover"
          />
        </TouchableOpacity>
      );
    },
    [router]
  );

  const renderUriItem = useCallback(
    ({ item }: { item: { uri: string } }) => {
      return (
        <View style={styles.itemContainer}>
          <Image
            source={{ uri: item.uri }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      );
    },
    []
  );

  const isTypesense = images.length > 0;
  const data = isTypesense ? images : imageUris;
  const renderItem = isTypesense ? renderTypesenseItem : renderUriItem;
  const keyExtractor = isTypesense
    ? (item: TypesenseResult<Publication>) => item.document?.id || String(Math.random())
    : (item: { uri: string }, index: number) => item.uri || String(index);

  return (
    <FlatList
      data={data}
      renderItem={renderItem as any}
      keyExtractor={keyExtractor as any}
      numColumns={NUM_COLUMNS}
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={ListHeaderComponent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={["#fff"]}
          />
        ) : undefined
      }
    />
  );
};

export default ImageGallery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  contentContainer: {
    paddingBottom: 30,
  },
  itemContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: ITEM_MARGIN,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#202020",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

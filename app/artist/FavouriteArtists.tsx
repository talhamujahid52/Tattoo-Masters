import { StyleSheet, View, FlatList, Dimensions } from "react-native";
import Text from "@/components/Text";
import ArtistSearchCard from "@/components/ArtistSearchCard";
import React from "react";
import { useSelector } from "react-redux";

const FavouriteArtists = () => {
  const { width } = Dimensions.get("window");
  const adjustedWidth = width - 42;

  const artists = useSelector((state: any) => state.artist.allArtists);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          paddingBottom: 16,
        }}
      >
        <Text size="p" weight="normal" color="#A7A7A7">
          8 Favourite Artists
        </Text>
      </View>
      <FlatList
        data={artists}
        renderItem={({ item, index }) => (
          <View
            style={{
              width: adjustedWidth / 3,
              marginRight: index % 3 === 0 ? 5 : 0, // Right margin for the 1st column
              marginLeft: index % 3 === 2 ? 5 : 0, // Left margin for the 3rd column
            }}
          >
            <ArtistSearchCard artist={item} />
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16 }}
      />
    </View>
  );
};

export default FavouriteArtists;

const styles = StyleSheet.create({});

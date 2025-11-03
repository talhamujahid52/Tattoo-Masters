import { StyleSheet, View, FlatList, Dimensions } from "react-native";
import Text from "@/components/Text";
import ArtistSearchCard from "@/components/ArtistSearchCard";
import React from "react";
import { useSelector } from "react-redux";

const FavouriteArtists = () => {
  const { width } = Dimensions.get("window");
  const adjustedWidth = width - 42;

  const allArtists = useSelector((state: any) => state.artist.allArtists);
  const userFirestore = useSelector((state: any) => state.user.userFirestore);

  // Filter artists to only show favorited ones
  const favoritedArtists = allArtists.filter((artist: any) =>
    userFirestore?.followedArtists?.includes(artist.id)
  );

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
          {favoritedArtists.length} favorite{" "}
          {favoritedArtists.length === 1 ? "artist" : "artists"}
        </Text>
      </View>
      {favoritedArtists.length > 0 ? (
        <FlatList
          data={favoritedArtists}
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
      ) : (
        <View style={styles.emptyContainer}>
          <Text size="h4" weight="medium" color="#A7A7A7">
            You have no favorite artists yet
          </Text>
          {/* <Text
            size="p"
            weight="normal"
            color="#A7A7A7"
            style={styles.emptyText}
          >
            Artists you favorite will appear here
          </Text> */}
        </View>
      )}
    </View>
  );
};

export default FavouriteArtists;

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    textAlign: "center",
  },
});

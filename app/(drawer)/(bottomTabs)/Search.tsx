import React, { useState } from "react";
import { StyleSheet, View, FlatList, Dimensions } from "react-native";
import Input from "@/components/Input";
import Text from "@/components/Text";
import ArtistSearchCard from "@/components/ArtistSearchCard";
import { useDispatch, useSelector } from "react-redux";

interface Artist {
  id: string;
  name: string;
  isActive: boolean;
}

const Search: React.FC = () => {
  const [searchText, setSearchText] = useState("");

  const { width } = Dimensions.get("window");
  const adjustedWidth = width - 42;

  const artists = useSelector((state: any) => state.artist.allArtists);

  // const artists: Artist[] = Array.from({ length: 20 }, (_, index) => ({
  //   id: index.toString(),
  //   name: `Artist ${index + 1}`,
  //   isActive: Math.random() < 0.5, // Randomly assign active status
  // }));

  return (
    <View style={styles.container}>
      <View style={styles.inputHeaderContainer}>
        <Input
          value={searchText}
          inputMode="text"
          placeholder="Search for artists and studios"
          leftIcon={"search"}
          onChangeText={(text) => setSearchText(text)}
          rightIcon={searchText !== "" && "cancel"}
          rightIconOnPress={() => setSearchText("")}
        />
      </View>
      <View style={styles.searchView}>
        <Text
          size="h4"
          weight="semibold"
          color="#A7A7A7"
          style={styles.Heading}
        >
          Artists near you
        </Text>
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
          contentContainerStyle={{ paddingBottom: 150, gap: 16 }}
        />
      </View>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  inputHeaderContainer: {
    paddingHorizontal: 16,
    borderBottomWidth: 0.33,
    paddingBottom: 11,
    borderColor: "#FFFFFF56",
  },
  searchView: {
    paddingHorizontal: 16,
  },
  Heading: {
    marginVertical: 16,
  },
});

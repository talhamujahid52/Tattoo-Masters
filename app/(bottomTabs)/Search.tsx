import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
} from "react-native";
import Input from "@/components/Input";
import ArtistSearchCard from "@/components/ArtistSearchCard";

interface Artist {
  id: string;
  name: string;
  isActive: boolean;
}

const Search: React.FC = () => {
  const { width } = Dimensions.get("window");
  const adjustedWidth = width - 42;

  const artists: Artist[] = Array.from({ length: 20 }, (_, index) => ({
    id: index.toString(),
    name: `Artist ${index + 1}`,
    isActive: Math.random() < 0.5, // Randomly assign active status
  }));

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <View
        style={{
          paddingHorizontal: 16,
          borderBottomWidth: 0.33,
          paddingBottom: 11,
          borderColor: "#FFFFFF56",
        }}
      >
        <Input
          inputMode="text"
          placeholder="Search for artists and studios"
          leftIcon={"search"}
          rightIcon={"cancel"}
        />
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={styles.Heading}>Artists near you</Text>
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
              <ArtistSearchCard isActive={item.isActive} />
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
  Heading: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 20.29,
    color: "#A7A7A7",
    marginVertical: 16,
  },
  separator: {
    backgroundColor: "#256728",
    height: 10,
    width: 10,
  },
});

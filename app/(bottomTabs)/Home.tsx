import { StyleSheet, TouchableOpacity, View, FlatList } from "react-native";
import Input from "@/components/Input";
import Text from "@/components/Text";
import React from "react";
import ArtistProfileCard from "@/components/ArtistProfileCard";

const Home = () => {
  return (
    <View style={styles.container}>
      <Input
        inputMode="text"
        placeholder="Search for ideas"
        leftIcon={"search"}
        rightIcon={"cancel"}
      ></Input>
      <View style={styles.flatlistHeadingContainer}>
        <Text size="h4" weight="semibold" color="#FBF6FA">
          Popular artists near you
        </Text>
        <TouchableOpacity>
          <Text size="h4" weight="normal" color="#DAB769">
            See more
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={Array.from({ length: 5 }, (_, index) => ({
          id: index.toString(),
          name: `Artist ${index + 1}`,
        }))}
        renderItem={({ item }) => <ArtistProfileCard />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16 }}
      />
      <Text
        size="h4"
        weight="semibold"
        color="#FBF6FA"
        style={{ marginTop: 24, marginBottom: 8 }}
      >
        Find Tattoo Inspiration
      </Text>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingTop: 15,
  },
  flatlistHeadingContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 24,
  },
});
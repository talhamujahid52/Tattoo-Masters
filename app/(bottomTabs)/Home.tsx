import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import Input from "@/components/Input";
import React from "react";
import ArtistProfileCard from "@/components/ArtistProfileCard";

const Home = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 15 }}>
        <Input
          inputMode="text"
          placeholder="Search for ideas"
          leftIcon={"search"}
          rightIcon={"cancel"}
        ></Input>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
            marginTop: 24,
          }}
        >
          <Text style={styles.Heading}>Popular artists near you</Text>
          <TouchableOpacity>
            <Text style={styles.SeeMoreButton}>See more</Text>
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
        <Text style={[styles.Heading, { marginTop: 24, marginBottom: 8 }]}>
          Find Tattoo Inspiration
        </Text>
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  Heading: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 20.29,
    color: "#FBF6FA",
  },
  SeeMoreButton: {
    fontSize: 17,
    fontWeight: "400",
    lineHeight: 22.1,
    color: "#DAB769",
  },
});

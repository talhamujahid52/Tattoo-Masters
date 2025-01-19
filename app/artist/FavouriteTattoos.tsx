import { StyleSheet, View, FlatList, Dimensions } from "react-native";
import Text from "@/components/Text";
import ArtistSearchCard from "@/components/ArtistSearchCard";
import ImageGallery from "@/components/ImageGallery";
import React from "react";

const FavouriteTattoos = () => {
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
          48 liked tattoos
        </Text>
      </View>
      <ImageGallery></ImageGallery>
    </View>
  );
};

export default FavouriteTattoos;

const styles = StyleSheet.create({});

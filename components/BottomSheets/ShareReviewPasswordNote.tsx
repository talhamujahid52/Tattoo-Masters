import { Image, StyleSheet, View } from "react-native";
import Text from "../Text";
import React from "react";

const ShareReviewPasswordNote = () => {
  return (
    <View style={{ paddingHorizontal: 16, minHeight: 120 }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 16,
          padding: 16,
          backgroundColor: "#2A1F06",
          borderRadius: 12,
        }}
      >
        <Image
          style={{ height: 27, width: 27, resizeMode: "contain" }}
          source={require("../../assets/images/infoBulb.png")}
        />
        <Text size="p" weight="normal" color="#A7A7A7">
          You can share your review password to{"\n"}your old clients and have
          them review{"\n"}their tattoos helping you grow your profile.
        </Text>
      </View>
    </View>
  );
};

export default ShareReviewPasswordNote;

const styles = StyleSheet.create({});

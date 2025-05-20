import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import React, { useState } from "react";
import Input from "@/components/Input";
import Text from "@/components/Text";
import Button from "@/components/Button";
import { useRouter, useLocalSearchParams } from "expo-router";
import useGetArtist from "@/hooks/useGetArtist";

const VerifyReviewPassword = () => {
  const router = useRouter();
  const { artistId } = useLocalSearchParams();
  const artist = useGetArtist(artistId);
  const [inputReviewPassword, setInputReviewPassword] = useState("");

  const checkReviewPasswordClick = () => {
    if (!inputReviewPassword) {
      return;
    } else {
      if (inputReviewPassword === artist?.data?.reviewPassword) {
        router.replace({
          pathname: "/artist/AddReview",
          params: { artistId: artistId },
        });
      } else {
        alert("Wrong Password");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ height: 44, width: 44 }}>
        <Image
          style={styles.image}
          source={require("../../assets/images/edit_note.png")}
        />
      </View>
      <Text size="h3" weight="medium" color="#FBF6FA" style={styles.title}>
        Enter Password to review {artist?.data?.name}
      </Text>
      <Text
        size="p"
        weight="normal"
        color="#A7A7A7"
        style={styles.description1}
      >
        Get the review password from {artist?.data?.name} to leave a review.
        This is to ensure authenticity of reviews.
      </Text>
      <View style={styles.passwordFieldsContainer}>
        <Input
          inputMode="password"
          placeholder="Enter review password"
          value={inputReviewPassword}
          onChangeText={setInputReviewPassword}
        />
      </View>
      <Button
        title="Continue"
        onPress={checkReviewPasswordClick}
        disabled={!inputReviewPassword}
      />
    </View>
  );
};

export default VerifyReviewPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 24,
  },
  image: { height: "100%", width: "100%" },
  title: {
    marginBottom: 10,
    marginTop: 24,
    textAlign: "center",
  },
  description1: {
    textAlign: "center",
    paddingHorizontal: 20,
  },
  passwordFieldsContainer: {
    rowGap: 16,
    marginVertical: 24,
  },
});

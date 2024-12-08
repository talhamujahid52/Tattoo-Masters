import { StyleSheet, View, ScrollView } from "react-native";
import React from "react";
import Text from "@/components/Text";

const TermsOfService = () => {
  return (
    <ScrollView style={styles.container}>
      <Text size="h1" weight="medium" color="#FBF6FA" style={styles.title}>
        Terms of service
      </Text>
      <Text size="p" weight="normal" color="#FBF6FA">
        readable content of a page when looking at its layout. The point of
        using Lorem Ipsum is that it has a more-or-less normal distribution of
        letters, as opposed to using 'Content here, content here', making it
        look like readable English. Many desktop publishing packages and web
        page editors now use Lorem Ipsum as their default model text, and a
        search for 'lorem ipsum' will uncover many web sites still in their
        infancy. Various versions have evolved over the years, sometimes by
        accident
      </Text>
      <Text size="h3" weight="medium" color="#FBF6FA" style={styles.title}>
        Subheading 1
      </Text>
      <Text size="p" weight="normal" color="#FBF6FA">
        It is a long established fact that a reader will be distracted by the
        readable content of a page when looking at its layout. The point of
        using Lorem Ipsum is that it has a more-or-less normal distribution of
        letters, as opposed to using 'Content here, content here', making it
        look like readable English. Many desktop publishing packages and web
        page editors now use Lorem Ipsum as their default model text, and a
        search for 'lorem ipsum' will uncover many web sites still in their
        infancy. Various versions have evolved over the years, sometimes by
        accident
      </Text>
    </ScrollView>
  );
};

export default TermsOfService;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#000",
    padding: 24,
  },
  image: { height: 35, width: 40, resizeMode: "contain" },
  title: {
    marginBottom: 10,
    marginTop: 24,
  },
});

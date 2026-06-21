import React from "react";
import { Image, StyleSheet, View } from "react-native";
import Text from "../Text";

const OriginalArtistNote = () => {
  return (
    <View style={styles.container}>
      <View style={styles.noteCard}>
        <Image
          source={require("../../assets/images/originalArtist.png")}
          style={styles.badge}
        />

        <Text size="p" weight="normal" color="#A7A7A7" style={styles.text}>
          The Original Artist badge is an exclusive award to our first 250
          artists who joined Tattoo Masters. This limited badge is reserved for
          our earliest members.
        </Text>
      </View>
    </View>
  );
};

export default OriginalArtistNote;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },

  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#2A1F06",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },

  badge: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    marginRight: 12,
    marginTop: 2,
  },

  text: {
    flex: 1,
    lineHeight: 20,
  },
});

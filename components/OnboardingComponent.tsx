import React from "react";
import { Text, Dimensions, StyleSheet, View } from "react-native";
import { SwiperFlatList } from "react-native-swiper-flatlist";

const colors = ["tomato", "thistle", "skyblue", "teal"];

const App = () => (
  <View style={styles.container}>
    <SwiperFlatList
      index={0}
      showPagination
      paginationStyle={{ paddingTop: 20 }}
      paginationStyleItemActive={{
        width: 17,
        height: 7,
        backgroundColor: "#ecc775",
      }}
      paginationStyleItemInactive={{
        width: 7,
        height: 7,
        backgroundColor: "#ecc775",
      }}
    >
      <View style={styles.textContainer}>
        <View style={styles.alignmentContainer}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Text style={styles.whiteText}>Find the best </Text>
            <Text style={styles.coloredText}>tattoo artist</Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Text style={styles.whiteText}>for your next </Text>
            <Text style={styles.coloredText}>tattoo!</Text>
          </View>
          <Text style={[styles.searchArtistsWorldwide,{paddingHorizontal:5}]}>
            Search artists worldwide and find the one who can fulfill your
            wildest idea.
          </Text>
        </View>
      </View>
      <View style={styles.textContainer}>
        <View style={styles.alignmentContainer}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Text style={styles.whiteText}>Search for </Text>
            <Text style={styles.coloredText}>ideas,</Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Text style={styles.coloredText}>tattoos</Text>
            <Text style={styles.whiteText}> and </Text>
            <Text style={styles.coloredText}>styles!</Text>
          </View>
          <Text style={styles.searchArtistsWorldwide}>
            Scroll through artists and their portfolios. Get ideas, get inspired
            and get inked!
          </Text>
          <Text style={styles.searchArtistsWorldwide}>
            Contact your favorite artist directly on the app.
          </Text>
        </View>
      </View>
      <View style={styles.textContainer}>
        <View style={styles.alignmentContainer}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Text style={styles.whiteText}>Are you an </Text>
            <Text style={styles.coloredText}>artist?</Text>
          </View>
          <Text style={styles.searchArtistsWorldwide}>
            Make your own profile, publish your work and let customers find you.
          </Text>
          <Text style={styles.searchArtistsWorldwide}>
            Join and become a{" "}
            <Text style={{ color: "#FFD982" }}>Tattoo Master!</Text>
          </Text>
        </View>
      </View>
    </SwiperFlatList>
  </View>
);

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  //   container: {
  //     backgroundColor: "transparent",
  //     height: 220,
  //     position: "absolute",
  //     top: "59%",
  //     right: "auto",
  //     zIndex: 1,
  //   },
  container: {
    backgroundColor: "transparent",
    height: "85%",
    position: "absolute",
    top: 0,
    zIndex: 1,
  },
  alignmentContainer: {
    height: 220,
    paddingHorizontal:25,
    display: "flex",
    justifyContent: "center",
  },
  textContainer: {
    width,
    justifyContent: "flex-end",
  },
  whiteText: {
    color: "#fbf6fa",
    fontSize: 32,
    fontWeight: "300",
  },
  coloredText: {
    color: "#FFD982",
    fontSize: 32,
    fontWeight: "300",
  },
  searchArtistsWorldwide: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "400",
    color: "#d0d0d0",
    textAlign: "center",
    marginTop: 16,
  },
});

export default App;

import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import Text from "./Text";

const { width } = Dimensions.get("window");

const OnboardingComponent = () => (
  <View style={styles.container}>
    <SwiperFlatList
      index={0}
      showPagination
      paginationStyle={{ paddingTop: 20 }}
      paginationStyleItemActive={{
        width: 17,
        height: 7,
        backgroundColor: "#ECC775",
      }}
      paginationStyleItemInactive={{
        width: 7,
        height: 7,
        backgroundColor: "#5A4E34",
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
            <Text size="h1" weight="light" color="#fbf6fa">
              Find the best{" "}
            </Text>
            <Text size="h1" weight="light" color="#FFD982">
              tattoo artist{" "}
            </Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Text size="h1" weight="light" color="#fbf6fa">
              for your next{" "}
            </Text>
            <Text size="h1" weight="light" color="#FFD982">
              tattoo!
            </Text>
          </View>
          <Text
            size="p"
            weight="normal"
            color="#d0d0d0"
            style={styles.paragraphStyle}
          >
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
            <Text size="h1" weight="light" color="#fbf6fa">
              Search for{" "}
            </Text>
            <Text size="h1" weight="light" color="#FFD982">
              ideas,
            </Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Text size="h1" weight="light" color="#FFD982">
              tattoos
            </Text>
            <Text size="h1" weight="light" color="#fbf6fa">
              {" "}
              and{" "}
            </Text>
            <Text size="h1" weight="light" color="#FFD982">
              styles!
            </Text>
          </View>
          <Text
            size="p"
            weight="normal"
            color="#d0d0d0"
            style={{
              textAlign: "center",
              marginTop: 16,
              paddingHorizontal: 16,
            }}
          >
            Scroll through artists and their portfolios. Get ideas, get inspired
            and get inked!
          </Text>
          <Text
            size="p"
            weight="normal"
            color="#d0d0d0"
            style={{ textAlign: "center", marginTop: 16 }}
          >
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
            <Text size="h1" weight="light" color="#fbf6fa">
              Are you an{" "}
            </Text>
            <Text size="h1" weight="light" color="#FFD982">
              artist?
            </Text>
          </View>
          <Text
            size="p"
            weight="normal"
            color="#d0d0d0"
            style={styles.paragraphStyle}
          >
            Make your own profile, publish your work and let customers find you.
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text
              size="p"
              weight="normal"
              color="#d0d0d0"
              style={styles.paragraphStyle}
            >
              Join and become a
            </Text>
            <Text
              size="p"
              weight="normal"
              color="#FFD982"
              style={styles.paragraphStyle}
            >
              Tattoo Master!
            </Text>
          </View>
        </View>
      </View>
    </SwiperFlatList>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    height: "85%",
    position: "absolute",
    top: 0,
    zIndex: 1,
  },
  alignmentContainer: {
    height: 220,
    paddingHorizontal: 25,
    display: "flex",
    justifyContent: "center",
  },
  textContainer: {
    width,
    justifyContent: "flex-end",
  },
  paragraphStyle: {
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 5,
  },
});

export default OnboardingComponent;

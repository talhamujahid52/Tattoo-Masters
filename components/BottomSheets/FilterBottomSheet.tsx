import { StyleSheet, View, TouchableOpacity, Switch } from "react-native";
import Slider from "@react-native-community/slider";
import Text from "../Text";
import React, { useState } from "react";
import Button from "../Button";

const FilterBottomSheet = () => {
  const [isEnabledRadius, setIsEnabledRadius] = useState(false);
  const [radiusValue, setRadiusValue] = useState(50);

  const [ratings, setRatings] = useState([
    { title: "1 star", value: 1, selected: true },
    { title: "2 stars", value: 2, selected: false },
    { title: "3 stars", value: 3, selected: false },
    { title: "4 stars", value: 4, selected: false },
    { title: "5 stars", value: 5, selected: false },
  ]);

  const [studio, setStudio] = useState([
    { title: "Studio", value: 1, selected: false },
    { title: "Freelancer", value: 2, selected: false },
    { title: "Home Artist", value: 3, selected: false },
  ]);

  const [tattooStyles, setTattooStyles] = useState([
    { title: "Tribal", value: 1, selected: false },
    { title: "Geometric", value: 2, selected: false },
    { title: "Black and White", value: 3, selected: false },
  ]);

  const toggleSwitch = () =>
    setIsEnabledRadius((previousState) => !previousState);
  const toggleRating = (value: number) => {
    const updatedRatings = ratings.map(
      (item) =>
        item.value === value
          ? { ...item, selected: true } // Set clicked item to selected
          : { ...item, selected: false }, // Deselect all other items
    );
    setRatings(updatedRatings);
  };
  const toggleStudio = (value: number) => {
    const updatedstudio = studio.map((item) =>
      item.value === value ? { ...item, selected: !item.selected } : item,
    );

    setStudio(updatedstudio);
  };
  const toggleTattooStyles = (value: number) => {
    const updatedTattooStyles = tattooStyles.map((item) =>
      item.value === value ? { ...item, selected: !item.selected } : item,
    );

    setTattooStyles(updatedTattooStyles);
  };
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={{ width: 70, height: 2 }}></View>
        <Text size="h4" weight="medium" color="#FFF">
          Filters
        </Text>
        <TouchableOpacity style={{ width: 70 }}>
          <Text size="h4" weight="normal" color="#DAB769">
            Clear all
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.toggleButtonRow}>
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Within your radius
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#44e52c" }}
            thumbColor={isEnabledRadius ? "#fff" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabledRadius}
          />
        </View>

        <View style={styles.sliderRow}>
          <Slider
            style={{ width: "80%", height: 40 }}
            value={radiusValue}
            onValueChange={(value) => {
              setRadiusValue(value);
            }}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#F2D189"
            maximumTrackTintColor="#FFFFFF26"
            thumbTintColor="#F2D189"
            disabled={!isEnabledRadius}
          />
          <Text size="p" weight="normal" color="#A7A7A7">
            {radiusValue.toFixed()} Km
          </Text>
        </View>
        <View>
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Rating
          </Text>
          <View style={styles.ratingButtonsRow}>
            {ratings.map((item, idx) => {
              return (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={1}
                  style={{
                    padding: 6,
                    borderRadius: 6,
                    backgroundColor: item.selected ? "#DAB769" : "#262526",
                  }}
                  onPress={() => toggleRating(item.value)}
                >
                  <Text
                    size="p"
                    weight="normal"
                    color={item.selected ? "#22221F" : "#A7A7A7"}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={styles.studioRow}>
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Studio
          </Text>
          <View style={styles.ratingButtonsRow}>
            {studio.map((item, idx) => {
              return (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={1}
                  style={{
                    padding: 6,
                    borderRadius: 6,
                    backgroundColor: item.selected ? "#DAB769" : "#262526",
                  }}
                  onPress={() => toggleStudio(item.value)}
                >
                  <Text
                    size="p"
                    weight="normal"
                    color={item.selected ? "#22221F" : "#A7A7A7"}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={styles.tattooStylesRow}>
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Styles
          </Text>
          <View style={styles.ratingButtonsRow}>
            {tattooStyles.map((item, idx) => {
              return (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={1}
                  style={{
                    padding: 6,
                    borderRadius: 6,
                    backgroundColor: item.selected ? "#DAB769" : "#262526",
                  }}
                  onPress={() => toggleTattooStyles(item.value)}
                >
                  <Text
                    size="p"
                    weight="normal"
                    color={item.selected ? "#22221F" : "#A7A7A7"}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={{ marginVertical: 32 }}>
          <Button title="Apply"></Button>
        </View>
      </View>
    </View>
  );
};

export default FilterBottomSheet;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    // paddingHorizontal: 16,
    // height: 400,
  },
  titleRow: {
    height: 46,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF26",
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  toggleButtonRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  sliderRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 32,
  },
  ratingButtonsRow: {
    marginTop: 16,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  studioRow: {
    marginVertical: 32,
  },
  tattooStylesRow: {
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF26",
  },
});

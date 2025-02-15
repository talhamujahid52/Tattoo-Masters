import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import Text from "./Text";

interface RatingProps {
  title?: string;
  selectedStar: number | null; // State value passed from the parent
  setSelectedStar: (star: number) => void; // Function to update state passed from the parent
}

const Rating: React.FC<RatingProps> = ({
  title = "Overall",
  selectedStar,
  setSelectedStar,
}) => {
  const handleStarPress = (idx: number) => {
    setSelectedStar(idx); // Update the state in the parent when a star is selected
  };

  return (
    <View>
      <Text size="h4" weight="semibold" color="#A7A7A7">
        {title}
      </Text>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          columnGap: 8,
          marginTop: 10,
        }}
      >
        {Array(5)
          .fill(0)
          .map((_, idx) => {
            const tintColor =
              idx <= (selectedStar ?? -1) ? "#DAB769" : "#2D2D2D"; // Use the selectedStar prop to determine color
            return (
              <TouchableOpacity
                style={{ height: 42, width: 42 }}
                key={idx}
                onPress={() => handleStarPress(idx)} // Use the handleStarPress function to update the state in parent
              >
                <Image
                  style={{
                    width: "100%",
                    height: "100%",
                    tintColor: tintColor,
                  }}
                  source={require("../assets/images/star.png")}
                />
              </TouchableOpacity>
            );
          })}
      </View>
    </View>
  );
};

export default Rating;

const styles = StyleSheet.create({});

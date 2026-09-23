import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Text from "../Text";
import Button from "../Button";
import Input from "../Input";

interface StyleItem {
  title: string;
  selected: boolean;
}

interface StylesBottomSheetProps {
  tattooStyles: StyleItem[];
  setSelectedTattooStyles: (styles: StyleItem[]) => void;
  hideTattooStylesSheet: () => void;
}

const StylesBottomSheet: React.FC<StylesBottomSheetProps> = ({
  tattooStyles,
  setSelectedTattooStyles,
  hideTattooStylesSheet,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [localStyles, setLocalStyles] = useState<StyleItem[]>([]);

  // Clone tattooStyles on mount to allow isolated editing
  useEffect(() => {
    setLocalStyles([...tattooStyles.map((style) => ({ ...style }))]);
  }, [tattooStyles]);

  const toggleStyleSelection = (selectedStyle: StyleItem) => {
    setLocalStyles((prev) =>
      prev.map((style) =>
        style.title === selectedStyle.title
          ? { ...style, selected: !style.selected }
          : style
      )
    );
  };

  const handleSave = () => {
    setSelectedTattooStyles(localStyles);
    hideTattooStylesSheet();
  };

  const filteredStyles = useMemo(() => {
    return localStyles.filter((style) =>
      style.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, localStyles]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text size="h4" weight="medium" color="#FFF" style={styles.headerText}>
          Select styles
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          value={searchQuery}
          inputMode="text"
          placeholder="Search style"
          leftIcon="search"
          onChangeText={setSearchQuery}
          rightIcon={searchQuery ? "cancel" : undefined}
          rightIconOnPress={() => setSearchQuery("")}
        />
      </View>

      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.stylesGrid}
        showsVerticalScrollIndicator={false}
      >
        {filteredStyles.map((style, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => toggleStyleSelection(style)}
            style={[
              styles.styleButton,
              {
                backgroundColor: style.selected ? "#DAB769" : "#262526",
              },
            ]}
          >
            <Text
              size="p"
              weight="normal"
              color={style.selected ? "#22221F" : "#A7A7A7"}
            >
              {style.title}
            </Text>
          </TouchableOpacity>
        ))}
      </BottomSheetScrollView>

      <Button title="Save" onPress={handleSave} />
    </View>
  );
};

export default StylesBottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
    paddingHorizontal: 16,
    paddingBottom: 20,
    maxHeight: "85%",
  },
  header: {
    paddingBottom: 12,
    borderBottomWidth: 0.33,
    borderBottomColor: "#2D2D2D",
  },
  headerText: {
    textAlign: "center",
  },
  searchContainer: {
    marginVertical: 16,
  },
  scrollView: {
    flex: 1,
    marginBottom: 16,
  },
  stylesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  styleButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
});

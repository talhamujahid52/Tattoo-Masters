import React, { useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import Input from "@/components/Input";
import Text from "@/components/Text";

const SearchArtistProfiles: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  // Handle adding a search term
  const addSearchTerm = () => {
    if (searchText && !recentSearches.includes(searchText)) {
      setRecentSearches([searchText, ...recentSearches]);
    }
    setSearchText(""); // Clear input after adding search term
  };

  // Handle clearing all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Handle retry (could be customized based on use case)
  const retrySearch = (searchTerm: string) => {
    setSearchText(searchTerm); // Set the input to the selected search term
  };

  // Handle submit when the "Enter" key is pressed
  const handleSubmitEditing = () => {
    addSearchTerm(); // Add search term on submit
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <View style={styles.inputHeaderContainer}>
          <Input
            value={searchText}
            inputMode="text"
            placeholder="Search for artists and studios"
            leftIcon={"search"}
            onChangeText={(text) => setSearchText(text)}
            rightIcon={searchText !== "" && "cancel"}
            rightIconOnPress={() =>
              searchText !== "" ? setSearchText("") : addSearchTerm()
            }
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={handleSubmitEditing}
          />
        </View>

        {/* Show recent searches when input is focused */}
        {isFocused && recentSearches.length > 0 && (
          <View style={styles.recentSearchContainer}>
            <View style={styles.recentSearchHeader}>
              <Text size="h4" weight="semibold" color="#A7A7A7">
                Recent Searches
              </Text>
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text size="h4" weight="normal" color="#DAB769">
                  Clear all
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentSearches}
              renderItem={({ item }) => (
                <View style={styles.searchItem}>
                  <TouchableOpacity onPress={() => retrySearch(item)}>
                    <Image
                      source={require("@/assets/images/retry.png")}
                      style={styles.retryIcon}
                    />
                  </TouchableOpacity>
                  <Text color="#FBF6FA">{item}</Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchArtistProfiles;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  inputHeaderContainer: {
    paddingHorizontal: 16,
    borderBottomWidth: 0.33,
    paddingBottom: 10,
    borderColor: "#2D2D2D",
  },
  recentSearchContainer: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  recentSearchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  retryIcon: {
    width: 12,
    height: 12,
    marginRight: 10,
  },
});

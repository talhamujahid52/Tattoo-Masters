import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Input from "./Input";
import Text from "./Text";

interface Option {
  label: string;
  value: string;
}

interface RadioButtonProps {
  title: string;
  options: Option[];
  selectedValue: string;
  inputValue?: string;
  onSelect: (value: string) => void;
  onStudioNameChange?: (name: string) => void;
}

const RadioButton = ({
  title = "Studio",
  options,
  selectedValue,
  inputValue = "",
  onSelect,
  onStudioNameChange,
}: RadioButtonProps) => {
  const handleSelect = (value: string) => {
    onSelect(value);
    if (value !== "studio" && onStudioNameChange) {
      onStudioNameChange("");
    }
  };

  const handleInputChange = (text: string) => {
    if (onStudioNameChange) {
      onStudioNameChange(text);
    }
  };

  return (
    <View style={styles.container}>
      <Text size="h4" weight="semibold" color="#A7A7A7" style={{ marginBottom: 10 }}>
        {title}
      </Text>
      {options.map((option, index) => (
        <View key={option.value}>
          <TouchableOpacity
            style={styles.optionContainer}
            onPress={() => handleSelect(option.value)}
          >
            <View
              style={[
                styles.radioButton,
                selectedValue === option.value && styles.selectedRadioButton,
              ]}
            ></View>
            <Text size="p" weight="normal" color="#FBF6FA">
              {option.label}
            </Text>
          </TouchableOpacity>

          {selectedValue === "studio" && index === 0 && (
            <View style={{ marginBottom: 10 }}>
              <Input
                inputMode="text"
                placeholder="Studio name"
                value={inputValue}
                onChangeText={handleInputChange}
              ></Input>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#757575",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#20201E",
  },
  selectedRadioButton: {
    borderWidth: 3,
    borderColor: "#DAB769",
  },
});

export default RadioButton;

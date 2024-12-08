import React, { useState } from "react";
import { View, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import Input from "./Input";
import Text from "./Text";

interface Option {
  label: string;
  value: string;
}

interface RadioButtonProps {
  title: string;
  options: Option[];
  onSelect: (value: string) => void;
}

const RadioButton = ({
  title = "Studio",
  options,
  onSelect,
}: RadioButtonProps) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onSelect(value);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
  };

  return (
    <View style={styles.container}>
      <Text
        size="h4"
        weight="semibold"
        color="#A7A7A7"
        style={{ marginBottom: 10 }}
      >
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

          {selectedValue === "option1" && index === 0 && (
            <View style={{ marginBottom: 10 }}>
              <Input inputMode="text" placeholder="Studio name"></Input>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

// Styles
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
  inputContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});

export default RadioButton;

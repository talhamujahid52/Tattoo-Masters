import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import React, { useMemo, useState } from "react";
import { MaterialIcons, Ionicons } from "@expo/vector-icons"; // Example icon library
import { normalize } from "@/utils/helperFunctions";

interface InputProps {
  placeholder?: string;
  value?: string; // Added value prop
  onChangeText?: (text: string) => void;
  leftIcon?: any;
  rightIcon?: any;
  inputMode: "text" | "email" | "password" | "tel";
  isNameField?: boolean;
  textInputProps?: TextInputProps;
  backgroundColour?: string;
  rightIconOnPress?: () => void;
  editable?: boolean;
  onPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
}

const Input = ({
  placeholder = "Type here...", // Default placeholder
  value = "", // Default value
  onChangeText,
  leftIcon,
  rightIcon,
  rightIconOnPress,
  inputMode = "text", // Default input mode
  backgroundColour = "#FFFFFF1A",
  textInputProps,
  isNameField,
  editable = true,
  onPress,
  onFocus,
  onBlur,
  onSubmitEditing,
}: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const shouldAutoCap = useMemo(() => {
    switch (inputMode) {
      case "email":
      case "tel":
      case "password":
        return "none";
      case "text":
        if (isNameField) {
          return "words";
        }
        return undefined;
    }
  }, [inputMode]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <View style={[styles.container, { backgroundColor: backgroundColour }]}>
      {leftIcon && (
        <Ionicons name={leftIcon} size={24} color="white" style={styles.icon} />
      )}
      <TextInput
        {...textInputProps}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#A29F93"
        value={value} // Set the value prop
        onChangeText={onChangeText}
        selectionColor="#A29F93"
        secureTextEntry={inputMode === "password" && !isPasswordVisible}
        inputMode={inputMode === "email" ? "email" : "text"}
        autoCapitalize={shouldAutoCap}
        keyboardType={
          inputMode === "email"
            ? "email-address"
            : inputMode === "tel"
            ? "phone-pad"
            : "default"
        }
        editable={editable}
        onPress={onPress}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={onSubmitEditing}
      />
      {inputMode === "password" ? (
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <MaterialIcons
            name={isPasswordVisible ? "visibility" : "visibility-off"}
            size={24}
            color="#B1AFA1"
            style={styles.icon}
          />
        </TouchableOpacity>
      ) : (
        rightIcon && (
          <TouchableOpacity onPress={rightIconOnPress}>
            <MaterialIcons
              name={rightIcon}
              size={24}
              color="#B1AFA1"
              style={styles.icon}
            />
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    width: "100%",
    borderRadius: 50,
    backgroundColor: "#FFFFFF1A",
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: normalize(16),
    fontWeight: "400",
    lineHeight: normalize(20.28),
    padding: 10,
    color: "white",
  },
  icon: {
    marginHorizontal: 5,
  },
});

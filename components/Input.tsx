import { StyleSheet, View, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons"; // Example icon library

interface InputProps {
  placeholder?: string;
  onChangeText?: (text: string) => void;
  leftIcon?: any;
  rightIcon?: any;
  inputMode: "text" | "email" | "password" | "tel";
}

const Input = ({
  placeholder = "Type here...", // Default placeholder
  onChangeText,
  leftIcon,
  rightIcon,
  inputMode = "text", // Default input mode
}: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };
  return (
    <View style={styles.container}>
      {leftIcon && (
        <MaterialIcons
          name={leftIcon}
          size={24}
          color="white"
          style={styles.icon}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#A29F93"
        onChangeText={onChangeText}
        selectionColor="#A29F93"
        secureTextEntry={inputMode === "password" && !isPasswordVisible}
        keyboardType={
          inputMode === "email"
            ? "email-address"
            : inputMode === "tel"
            ? "phone-pad"
            : "default"
        }
      />
      {inputMode === "password" ? (
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <MaterialIcons
            name={isPasswordVisible ? "visibility" : "visibility-off"}
            size={24}
            color="white"
            style={styles.icon}
          />
        </TouchableOpacity>
      ) : (
        rightIcon && (
          <MaterialIcons
            name={rightIcon}
            size={24}
            color="white"
            style={styles.icon}
          />
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
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 20.28,
    padding: 10,
    color: "white",
  },
  icon: {
    marginHorizontal: 5,
  },
});

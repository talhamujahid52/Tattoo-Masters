import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import React, { useMemo, useState, useRef, forwardRef } from "react";
import { MaterialIcons, Ionicons } from "@expo/vector-icons"; // Example icon library
import { normalize } from "@/utils/helperFunctions";

interface InputProps extends TextInputProps {
  placeholder?: string;
  value?: string; // Added value prop
  onChangeText?: (text: string) => void;
  leftIcon?: any;
  leftIconCustom?: any;
  rightIcon?: any;
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

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      placeholder = "Type here...", // Default placeholder
      value = "", // Default value
      onChangeText,
      leftIcon,
      leftIconCustom,
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
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const internalRef = useRef<TextInput>(null);
    const inputRef = (ref as React.RefObject<TextInput>) || internalRef;
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
      <TouchableWithoutFeedback
        onPress={() => {
          if (editable !== false && inputRef.current) {
            inputRef.current.focus();
          }
          if (onPress) onPress();
        }}
        disabled={editable === false}
      >
        <View style={[styles.container, { backgroundColor: backgroundColour }]}>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={24}
              color="white"
              style={styles.icon}
            />
          )}
          {leftIconCustom && (
            <Image source={leftIconCustom} style={{ width: 24, height: 24 }} />
          )}
          <TextInput
            ref={inputRef}
            {...textInputProps}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#A29F93"
            value={value}
            onChangeText={onChangeText}
            selectionColor="#A29F93"
            secureTextEntry={inputMode === "password" && !isPasswordVisible}
            inputMode={inputMode === "email" ? "email" : "text"}
            autoCapitalize={shouldAutoCap}
            onSubmitEditing={onSubmitEditing}
            keyboardType={
              inputMode === "email"
                ? "email-address"
                : inputMode === "tel"
                ? "phone-pad"
                : "default"
            }
            editable={editable}
            onFocus={onFocus}
            onBlur={onBlur}
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
      </TouchableWithoutFeedback>
    );
  }
);

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    // flex: 1,
    height: 48, // ensure at least 48 high
    borderRadius: 50,
    backgroundColor: "#FFFFFF1A",
    paddingHorizontal: 10,
    paddingVertical: 6, // adjust vertical space instead of fixed height
  },
  input: {
    flex: 1, // take up all remaining horizontal space
    fontSize: normalize(16),
    color: "white",
    paddingVertical: 0, // vertical padding is on container
    marginLeft: 4, // a little breathing room after the icon
  },
  icon: {
    marginHorizontal: 4,
  },
});

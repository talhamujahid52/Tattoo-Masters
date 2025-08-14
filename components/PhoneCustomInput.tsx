import { StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import PhoneInput, { ICountry } from "react-native-international-phone-number";

interface PhoneCustomInputProps {
  value: string;
  onChange: (phoneNumber: string, countryCode: string) => void; // Change to accept country code
}

const PhoneCustomInput: React.FC<PhoneCustomInputProps> = ({
  value,
  onChange,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [inputValue, setInputValue] = useState<string>("");

  // Update input value when parent changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputValue = (phoneNumber: string) => {
    setInputValue(phoneNumber);
    const countryCode = selectedCountry ? selectedCountry.callingCode : ""; // Get the country code
    onChange(phoneNumber, countryCode); // Pass both phone number and country code
  };

  const handleSelectedCountry = (country: ICountry) => {
    setSelectedCountry(country);
  };

  return (
    <PhoneInput
      phoneInputStyles={{
        container: {
          backgroundColor: "#FFFFFF1A",
          borderRadius: 50,
          height: 48,
          borderWidth: 0,
        },
        flagContainer: {
          borderTopLeftRadius: 50,
          borderBottomLeftRadius: 50,
          backgroundColor: "transparent",
          justifyContent: "center",
        },
        caret: {
          color: "#DAB769",
          fontSize: 16,
        },
        divider: {
          backgroundColor: "#A29F93",
        },
        callingCode: {
          fontSize: 16,
          fontWeight: "400",
          color: "#FBF6FA",
        },
        input: {
          color: "white",
        },
      }}
      modalStyles={{
        modal: {
          backgroundColor: "#333333",
        },
        backdrop: {},
        divider: {
          backgroundColor: "#FFFFFF1A",
        },
        countriesList: {},
        searchInput: {
          borderWidth: 0,
          color: "white",
          fontSize: 16,
          fontWeight: "400",
          lineHeight: 20.28,
          paddingHorizontal: 12,
          height: 48,
        },
        countryButton: {
          // marginHorizontal: 20,
          borderWidth: 0,
          // borderBottomWidth: 1,
          borderColor: "#F3F3F3",
          backgroundColor: "transparent",
          marginVertical: 4,
          paddingVertical: 0,
        },
        noCountryText: {},
        noCountryContainer: {},
        flag: {
          color: "#FFFFFF",
          fontSize: 20,
        },
        callingCode: {
          fontSize: 16,
          fontWeight: "400",
          color: "#FBF6FA",
          lineHeight: 20.28,
        },
        countryName: {
          fontSize: 16,
          fontWeight: "400",
          color: "#FBF6FA",
          lineHeight: 20.28,
        },
      }}
      theme="dark"
      keyboardType="phone-pad"
      placeholder="Phone number"
      placeholderTextColor="#A29F93"
      selectionColor="#A29F93"
      value={inputValue}
      onChangePhoneNumber={handleInputValue}
      selectedCountry={selectedCountry}
      onChangeSelectedCountry={handleSelectedCountry}
    />
  );
};

export default PhoneCustomInput;

const styles = StyleSheet.create({});

import { StyleSheet } from "react-native";
import React, { useState } from "react";
import PhoneInput, { ICountry } from "react-native-international-phone-number";

const PhoneCustomInput = () => {
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [inputValue, setInputValue] = useState<string>("");

  function handleInputValue(phoneNumber: string) {
    setInputValue(phoneNumber);
  }

  function handleSelectedCountry(country: ICountry) {
    setSelectedCountry(country);
  }
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
          borderRadius: 50,
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
          marginHorizontal: 20,
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

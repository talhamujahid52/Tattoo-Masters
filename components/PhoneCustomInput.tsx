import { StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import PhoneInput, {
  ICountry,
  getAllCountries,
} from "react-native-international-phone-number";
import * as Location from "expo-location";

interface PhoneCustomInputProps {
  value: string;
  onChange: (phoneNumber: string, countryCode: string) => void;
}

const PhoneCustomInput: React.FC<PhoneCustomInputProps> = ({
  value,
  onChange,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Step 1: Get current coordinates
  const getCurrentCoordinates = async (): Promise<[number, number] | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission denied");
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      return [location.coords.latitude, location.coords.longitude];
    } catch (error) {
      console.error("Failed to get coordinates:", error);
      return null;
    }
  };
  const GOOGLE_API_KEY = "AIzaSyCYsCsuGy8EFd8S8SG4xyU4oPi-0P_yu9k";

  // Step 2: Get country from lat/lng
  const getCountryFromCoordinates = async ([lat, lng]: [number, number]) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        const countryComponent = data.results[0].address_components.find(
          (component) => component.types.includes("country")
        );
        console.log(
          "countryComponent?.short_name ",
          countryComponent?.short_name
        );
        return countryComponent?.short_name || null; // e.g., "US"
      } else {
        console.error("Geocoding API error:", data.status);
        return null;
      }
    } catch (error) {
      console.error("Error fetching country from coordinates:", error);
      return null;
    }
  };

  // Step 3: Detect and set initial country
  useEffect(() => {
    const detectCountry = async () => {
      const coords = await getCurrentCoordinates();
      console.log("coords : ", coords);
      if (!coords) return;

      const countryCode = await getCountryFromCoordinates(coords);
      if (!countryCode) return;

      const countries = getAllCountries();
      console.log("countries : ", countries);
      const matchedCountry = countries.find(
        (country) => country.cca2 === countryCode.toUpperCase()
      );

      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        onChange(inputValue, matchedCountry.callingCode);
      }
    };

    detectCountry();
  }, []);

  // Handle phone input value change
  const handleInputValue = (phoneNumber: string) => {
    setInputValue(phoneNumber);
    const countryCode = selectedCountry ? selectedCountry.callingCode : "";
    onChange(phoneNumber, countryCode);
  };

  const handleSelectedCountry = (country: ICountry) => {
    setSelectedCountry(country);
    onChange(inputValue, country.callingCode);
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

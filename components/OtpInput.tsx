import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  Button,
  ActivityIndicator,
  StyleSheet,
  Text,
  Alert,
} from "react-native";

const OtpInput: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(5).fill(""));
  const [loading, setLoading] = useState<boolean>(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];

    // Handle deletion of a digit
    if (text === "") {
      newOtp[index] = "";
      setOtp(newOtp);
      if (index > 0) {
        inputRefs.current[index - 1]?.focus(); // Focus the previous input if current is cleared
      }
    } else {
      newOtp[index] = text;
      setOtp(newOtp);

      // Move to the next input if text is entered
      if (text && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Submit OTP if it's the last input
      if (index === otp.length - 1 && text.length) {
        submitOtp(newOtp.join(""));
      }
    }
  };

  const submitOtp = (otp: string) => {
    setLoading(true);
    // Simulate an API call
    setTimeout(() => {
      setLoading(false);
      // Check if the OTP is correct
      if (otp === "12345") {
        // Example condition for success
        Alert.alert("Success", "OTP verified successfully!");
      } else {
        Alert.alert("Failure", "Invalid OTP. Please try again.");
        // Clear the OTP inputs
        setOtp(Array(5).fill(""));
        inputRefs.current[0]?.focus(); // Focus the first input again
      }
    }, 2000);
  };

  return (
    <View>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.input}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            selectionColor="#DAB769"
          />
        ))}
      </View>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    width: 58,
    height: 74,
    borderRadius: 10,
    backgroundColor: "#FFFFFF1A",
    color: "white",
    textAlign: "center",
    fontWeight: "500",
    fontSize: 26,
  },
});

export default OtpInput;

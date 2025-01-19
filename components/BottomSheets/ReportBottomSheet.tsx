import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import Text from "../Text";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import RadioButton from "@/components/RadioButton";
import Button from "../Button";

interface Option {
  label: string;
  value: string;
}

interface bottomSheetProps {
  hide: () => void;
  title?: string;
  options: Option[];
}

const ReportBottomSheet = ({ hide, title, options }: bottomSheetProps) => {
  const [reasonForReport, setReasonForReport] = useState("1");
  console.log("reasonForReport ", reasonForReport);

  return (
    <View style={styles.container}>
      <View
        style={{
          paddingVertical: 12,
          borderBottomColor: "#242424",
          borderBottomWidth: 1,
        }}
      >
        <Text
          size="h4"
          weight="medium"
          color="#FFF"
          style={{ textAlign: "center" }}
        >
          {title}
        </Text>
      </View>
      <Text
        size="p"
        weight="normal"
        color="#A7A7A7"
        style={{ textAlign: "center", marginTop: 24 }}
      >
        Select reason for report
      </Text>
      <View style={{ padding: 16 }}>
        <RadioButton
          options={options}
          selectedValue={reasonForReport}
          onSelect={(value) => setReasonForReport(value)}
        />
        <View style={{ marginTop: 24 }}>
          <Button title="Report"></Button>
        </View>
      </View>
    </View>
  );
};

export default ReportBottomSheet;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    paddingBottom: 20,
  },
  drawerItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  icon: {
    height: 24,
    width: 24,
    resizeMode: "contain",
  },
});

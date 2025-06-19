import {
  StyleSheet,
  View,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Text from "../Text";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import RadioButton from "@/components/RadioButton";
import Button from "../Button";
import firestore from "@react-native-firebase/firestore";
import { firebase } from "@react-native-firebase/firestore";

interface Option {
  label: string;
  value: string;
}

interface bottomSheetProps {
  hideReportSheet: () => void;
  title?: string;
  options: Option[];
  reportItem: any;
}

const ReportBottomSheet = ({
  hideReportSheet,
  title,
  options,
  reportItem,
}: bottomSheetProps) => {
  const [reasonForReport, setReasonForReport] = useState("");
  const [loading, setLoading] = useState(false);
  const currentUserId = firebase?.auth()?.currentUser?.uid;

  const handleReportClick = async () => {
    setLoading(true);
    console.log("reportedBy:", currentUserId);
    console.log("type:", title);
    console.log("targetId:", reportItem);
    console.log("reason:", reasonForReport);
    console.log("createdAt:", firestore.FieldValue.serverTimestamp());
    try {
      await firestore().collection("ReportedItems").add({
        reportedBy: currentUserId,
        type: title,
        targetId: reportItem,
        reason: reasonForReport,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert("Success", "Your Request has been submitted successfully.", [
        {
          text: "OK",
          onPress: () => {
            hideReportSheet();
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Failure", "An error occurs while submitting request.", [
        {
          text: "OK",
          onPress: () => {
            hideReportSheet();
          },
        },
      ]);
      console.error("Failed to submit report:", error);
    }
    setLoading(false);
  };

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
          Report {title?.toLocaleLowerCase()}
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
          <Button
            title={
              loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                "Report"
              )
            }
            onPress={handleReportClick}
          ></Button>
        </View>
      </View>
    </View>
  );
};

export default ReportBottomSheet;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#080808",
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

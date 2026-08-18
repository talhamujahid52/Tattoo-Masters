import {
  StyleSheet,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import Text from "../Text";
import React, { useState } from "react";
import RadioButton from "@/components/RadioButton";
import Button from "../Button";
import useSafety, { normalizeReportTargetType } from "@/hooks/useSafety";
import type { ReportTargetType } from "@/types/safety";

interface Option {
  label: string;
  value: string;
}

export interface ReportBottomSheetProps {
  hideReportSheet: () => void;
  title?: string;
  options: Option[];
  reportItem: any;
  type?: ReportTargetType;
  targetOwnerId?: string;
  onReported?: (type: ReportTargetType, targetId: string) => void;
}

const ReportBottomSheet = ({
  hideReportSheet,
  title,
  options,
  reportItem,
  type,
  targetOwnerId,
  onReported,
}: ReportBottomSheetProps) => {
  const [reasonForReport, setReasonForReport] = useState("");
  const [loading, setLoading] = useState(false);
  const { submitReport } = useSafety();

  const reportType = type ?? normalizeReportTargetType(title);
  const targetId = String(
    typeof reportItem === "object"
      ? (reportItem?.id ?? reportItem?.targetId ?? "")
      : (reportItem ?? ""),
  );
  const resolvedOwnerId =
    targetOwnerId ??
    (typeof reportItem === "object"
      ? (reportItem?.targetOwnerId ??
        reportItem?.userId ??
        reportItem?.user ??
        "")
      : reportType === "user"
        ? targetId
        : "");

  const handleReportClick = async () => {
    if (!reasonForReport) {
      Alert.alert("Select a reason", "Choose a reason before submitting.");
      return;
    }

    setLoading(true);
    try {
      await submitReport({
        type: reportType,
        targetId,
        targetOwnerId: resolvedOwnerId,
        reason: reasonForReport,
      });

      onReported?.(reportType, targetId);

      Alert.alert(
        "Report submitted",
        reportType === "user"
          ? "Your report has been submitted successfully."
          : "Your report has been submitted and this content is now hidden.",
        [
          {
            text: "OK",
            onPress: hideReportSheet,
          },
        ],
      );
    } catch (error) {
      console.error("Failed to submit report:", error);
      Alert.alert(
        "Unable to submit report",
        "There was a problem submitting your report. Please try again.",
      );
    } finally {
      setLoading(false);
    }
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
            disabled={!reasonForReport || loading}
            variant={reasonForReport ? "primary" : "secondary"}
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

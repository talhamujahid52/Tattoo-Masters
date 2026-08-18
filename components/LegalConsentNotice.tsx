import Text from "@/components/Text";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface LegalConsentNoticeProps {
  onOpenTerms: () => void;
  onOpenPrivacyPolicy: () => void;
}

const LegalConsentNotice = ({
  onOpenTerms,
  onOpenPrivacyPolicy,
}: LegalConsentNoticeProps) => (
  <View
    accessibilityLabel="By continuing, you agree to our Terms of Service and Privacy Policy"
    style={styles.container}
  >
    <Text size="small" weight="normal" color="#828282">
      By continuing, you agree to our
    </Text>
    <View style={styles.linksRow}>
      <Pressable accessibilityRole="link" hitSlop={6} onPress={onOpenTerms}>
        <Text size="small" weight="normal" color="#FBF6FA">
          Terms of Service
        </Text>
      </Pressable>
      <Text size="small" weight="normal" color="#828282">
        {" "}and{" "}
      </Text>
      <Pressable
        accessibilityRole="link"
        hitSlop={6}
        onPress={onOpenPrivacyPolicy}
      >
        <Text size="small" weight="normal" color="#FBF6FA">
          Privacy Policy.
        </Text>
      </Pressable>
    </View>
  </View>
);

export default LegalConsentNotice;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 24,
  },
  linksRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
});

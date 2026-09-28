import { StyleSheet, View, ScrollView } from "react-native";
import React from "react";
import Text from "@/components/Text";

interface Section {
  id: string;
  title: string;
  content: string;
  bulletPoints?: string[];
  additionalContent?: string;
}

interface PrivacyData {
  title: string;
  sections: Section[];
  thankyouNote?: string;
}

const privacyData: PrivacyData = {
  title: "Privacy Policy",
  sections: [
    {
      id: "introduction",
      title: "",
      content:
        "Tattoo Masters values the privacy of our users. This Privacy Policy outlines how we collect, use and safeguard your personal information.",
    },
    {
      id: "information_collect",
      title: "1. Information We Collect",
      content: "",
      bulletPoints: [
        "Account data: name, email address, profile photo, login credentials",
        "Tattoo artist data: business info, photos, location",
        "User content: messages, reviews, likes, follows, uploaded content",
        "Device data: IP address, device type, OS, language, access times",
        "Location data: collected with your permission to enhance local discovery of tattoo artists",
        "Analytics: to understand usage patterns and improve performance",
      ],
    },
    {
      id: "how_we_use",
      title: "2. How We Use Your Data",
      content: "We use your information to:",
      bulletPoints: [
        "Operate and personalize the platform",
        "Recommend artists based on location and preferences",
        "Enable communication and reviews",
        "Prevent misuse and fraud",
        "Provide relevant ads and subscription features",
        "Improve performance and user experience",
      ],
    },
    {
      id: "data_sharing",
      title: "3. Data Sharing",
      content: "We may share data with:",
      bulletPoints: [
        "Service providers (e.g., hosting, analytics, messaging)",
        "Legal authorities if required",
        "Affiliates and successors in case of merger or acquisition",
      ],
    },
    {
      id: "cookies",
      title: "4. Cookies and Tracking",
      content:
        "We use cookies and similar technologies to remember user preferences, track engagement and deliver relevant content. You may manage cookies through your device or browser settings.",
    },
    {
      id: "children",
      title: "5. Children’s Privacy",
      content:
        "Tattoo Masters does not knowingly collect information from children under 13 years of age. If we become aware of such data we will delete it promptly.",
    },
    {
      id: "your_rights",
      title: "6. Your Rights",
      content: "Depending on your location, you may have the right to:",
      bulletPoints: [
        "Access, correct or delete your personal information",
        "Object to or restrict processing",
        "Withdraw consent at any time",
      ],
    },
    {
      id: "international_transfers",
      title: "7. International Data Transfers",
      content:
        "Data may be processed or stored in countries outside your own. We use appropriate safeguards to protect your data in accordance with this policy.",
    },
    {
      id: "data_retention",
      title: "8. Data Retention",
      content:
        "We retain your data as long as your account is active or as necessary to comply with legal obligations. Users may delete their accounts at any time.",
    },
    {
      id: "changes",
      title: "9. Changes to this Policy",
      content:
        "We may update the Privacy Policy at times. We will notify users of significant changes within the app.",
    },
  ],
  thankyouNote:
    "We hope you enjoy the Tattoo Masters application and use it in a friendly and respectful manner!",
};

const PrivacyPolicy = () => {
  return (
    <ScrollView style={styles.container}>
      <Text size="h1" weight="medium" color="#FBF6FA" style={styles.heading}>
        {privacyData.title}
      </Text>

      {privacyData.sections.map((section) => (
        <View key={section.id} style={styles.section}>
          {section.title ? (
            <Text
              size="h3"
              weight="medium"
              color="#FBF6FA"
              style={styles.title}
            >
              {section.title}
            </Text>
          ) : null}

          {section.content ? (
            <Text size="p" weight="normal" color="#FBF6FA">
              {section.content}
            </Text>
          ) : null}

          {section.bulletPoints && section.bulletPoints.length > 0 && (
            <View style={styles.bulletContainer}>
              {section.bulletPoints.map((point, index) => (
                <View key={index} style={styles.bulletItem}>
                  <Text size="p" weight="normal" color="#FBF6FA">
                    •{" "}
                  </Text>
                  <Text
                    size="p"
                    weight="normal"
                    color="#FBF6FA"
                    style={styles.bulletText}
                  >
                    {point}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {section.additionalContent && (
            <Text size="p" weight="normal" color="#FBF6FA">
              {section.additionalContent}
            </Text>
          )}
        </View>
      ))}

      {privacyData.thankyouNote && (
        <Text
          size="p"
          weight="normal"
          color="#DAB769"
          style={{ marginBottom: 60 }}
        >
          {privacyData.thankyouNote}
        </Text>
      )}
    </ScrollView>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 24,
    borderTopColor: "#282828",
    borderTopWidth: 0.5,
  },
  heading: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 10,
  },
  section: {
    marginBottom: 24,
  },
  bulletContainer: {
    marginLeft: 16,
    marginVertical: 8,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bulletText: {
    flex: 1,
  },
});

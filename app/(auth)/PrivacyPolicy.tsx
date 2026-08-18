import { StyleSheet, View, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import Text from "@/components/Text";
import firestore from "@react-native-firebase/firestore";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import {
  LEGAL_LAST_UPDATED_ISO,
  LEGAL_LAST_UPDATED_LABEL,
  LEGAL_PRIVACY_POLICY_VERSION,
} from "@/utils/legalConsent";

interface Section {
  id: string;
  title: string;
  content: string;
  bulletPoints?: string[];
  additionalContent?: string;
}

interface PrivacyContent {
  title: string;
  sections: Section[];
}

interface PrivacyData {
  version: string;
  lastUpdated: FirebaseFirestoreTypes.Timestamp;
  content: PrivacyContent;
  isActive: boolean;
  thankyouNote?: string;
}

const privacyData: PrivacyData = {
  version: LEGAL_PRIVACY_POLICY_VERSION,
  lastUpdated: firestore.Timestamp.fromDate(
    new Date(LEGAL_LAST_UPDATED_ISO)
  ),
  content: {
    title: "Privacy Policy",
    sections: [
      {
        id: "introduction",
        title: "",
        content:
          "Tattoo Masters values your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.",
      },
      {
        id: "information_collect",
        title: "Information We Collect",
        content: "We may collect the following types of information:",
        bulletPoints: [
          "Account Information: Name, email address, profile photo, login credentials",
          "Tattoo Artist Data: Business information, portfolio photos, location",
          "User Content: Messages, reviews, likes, follows, uploaded media",
          "Safety and Moderation Data: Reports, blocks, selected reasons, and related account or content identifiers",
          "Device Information: IP address, device type, operating system, language, access times",
          "Location Data: With user permission, used to improve local search and discovery",
          "Analytics Data: To understand usage trends and optimize performance",
        ],
      },
      {
        id: "how_we_use",
        title: "How We Use Your Data",
        content: "Your data may be used to:",
        bulletPoints: [
          "Operate and customize the platform",
          "Recommend artists based on your location and preferences",
          "Facilitate communication and reviews between users and artists",
          "Detect and prevent fraudulent or inappropriate behavior",
          "Investigate reports, enforce our zero-tolerance safety policy, and administer user blocks",
          "Serve relevant ads and subscription options",
          "Improve platform performance and user experience",
        ],
      },
      {
        id: "data_sharing",
        title: "Data Sharing",
        content: "We may share your data with:",
        bulletPoints: [
          "Service Providers: Hosting, analytics, messaging services",
          "Legal Authorities: If required by law or to protect rights and safety",
          "Affiliates and Successors: In the event of a business merger or acquisition",
        ],
      },
      {
        id: "safety_controls",
        title: "Reports, Blocks, and Safety Moderation",
        content:
          "Tattoo Masters has zero tolerance for objectionable content and abusive behavior. A tattoo or review report hides that item from your view; an account report submits the account for moderation without automatically blocking it. Blocking hides the account and its content from your view, prevents unwanted contact, creates a moderation record, and alerts our moderation team. Blocking and reporting records may be retained as needed to protect users, investigate issues, and document enforcement decisions.",
      },
      {
        id: "cookies_tracking",
        title: "Cookies and Tracking",
        content:
          "We use cookies and similar technologies to remember preferences, track engagement, and serve relevant content. You can manage cookie settings through your browser or device preferences.",
      },
      {
        id: "children_privacy",
        title: "Children's Privacy",
        content:
          "Tattoo Masters does not knowingly collect data from children under the age of 13. If we become aware of such data, it will be promptly deleted in compliance with applicable laws.",
      },
      {
        id: "your_rights",
        title: "Your Rights",
        content: "Depending on your jurisdiction, you may have the right to:",
        bulletPoints: [
          "Access, update, or delete your personal information",
          "Object to or restrict processing of your data",
          "Withdraw consent at any time",
        ],
        additionalContent:
          "To exercise these rights, please contact us through the app or website.",
      },
      {
        id: "international_transfers",
        title: "International Data Transfers",
        content:
          "Your data may be stored or processed in countries outside your own. We take appropriate measures to ensure your information remains secure and in line with this Privacy Policy.",
      },
      {
        id: "data_retention",
        title: "Data Retention",
        content:
          "We retain your data for as long as your account remains active or as necessary to comply with legal obligations. You may delete your account and associated data at any time.",
      },
      {
        id: "security",
        title: "Data Security",
        content:
          "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.",
      },
      {
        id: "third_party_services",
        title: "Third-Party Services",
        content:
          "Our platform may integrate with third-party services such as analytics providers, cloud storage, and payment processors. These services have their own privacy policies, and we encourage you to review them.",
      },
      {
        id: "updates",
        title: "Updates to Privacy Policy",
        content:
          "We may update this Privacy Policy from time to time. We will notify you of any significant changes through the app or by other appropriate means. Your continued use of the platform after such changes constitutes acceptance of the updated policy.",
      },
      {
        id: "contact",
        title: "Contact Us",
        content:
          "If you have any questions about this Privacy Policy or our data practices, please contact us through the app or website. We are committed to addressing your concerns promptly.",
      },
    ],
  },
  isActive: true,
  thankyouNote:
    "Thank you for using Tattoo Masters. We hope you enjoy the platform and use it in a friendly and respectful manner!",
};

const isValidPrivacyData = (value: unknown): value is PrivacyData => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PrivacyData>;
  if (
    candidate.isActive !== true ||
    candidate.version !== LEGAL_PRIVACY_POLICY_VERSION ||
    !candidate.content ||
    typeof candidate.content.title !== "string" ||
    candidate.content.title.trim().length === 0 ||
    !Array.isArray(candidate.content.sections) ||
    candidate.content.sections.length === 0
  ) {
    return false;
  }

  const hasValidSections = candidate.content.sections.every(
    (section) =>
      !!section &&
      typeof section.id === "string" &&
      typeof section.title === "string" &&
      typeof section.content === "string" &&
      section.content.trim().length > 0 &&
      (section.bulletPoints === undefined ||
        (Array.isArray(section.bulletPoints) &&
          section.bulletPoints.every(
            (point) => typeof point === "string" && point.trim().length > 0,
          ))) &&
      (section.additionalContent === undefined ||
        typeof section.additionalContent === "string")
  );

  return (
    hasValidSections &&
    (candidate.thankyouNote === undefined ||
      typeof candidate.thankyouNote === "string") &&
    candidate.content.sections.some(
      (section) => section.id === "safety_controls"
    )
  );
};

const PrivacyPolicy = () => {
  const [privacy, setPrivacy] = useState<PrivacyData>(privacyData);

  // const uploadPrivacyToFirebase = async () => {
  //   try {
  //     await firestore()
  //       .collection("app_content")
  //       .doc("privacy_policy")
  //       .set(privacyData);

  //     console.log("Privacy Policy uploaded successfully!");
  //     return { success: true };
  //   } catch (error: any) {
  //     console.error("Error uploading privacy policy:", error);
  //     return { success: false, error: error.message };
  //   }
  // };

  // useEffect(() => {
  //   uploadPrivacyToFirebase();
  // }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPrivacy = async () => {
      try {
        const doc = await firestore()
          .collection("app_content")
          .doc("privacy_policy")
          .get();

        const remotePrivacy = doc.data();
        if (isMounted && doc.exists && isValidPrivacyData(remotePrivacy)) {
          setPrivacy(remotePrivacy);
        }
      } catch (error) {
        console.error("Using bundled privacy policy after fetch failed:", error);
      }
    };

    void fetchPrivacy();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text size="h1" weight="medium" color="#FBF6FA" style={styles.title}>
        {privacy.content.title}
      </Text>
      <Text
        size="small"
        weight="normal"
        color="#A7A7A7"
        style={styles.metadata}
      >
        Version {privacy.version} · Last updated {LEGAL_LAST_UPDATED_LABEL}
      </Text>

      {privacy.content.sections.map((section) => (
        <View key={section.id} style={styles.section}>
          <Text size="h3" weight="medium" color="#FBF6FA" style={styles.title}>
            {section.title}
          </Text>

          {section.content && (
            <Text size="p" weight="normal" color="#FBF6FA">
              {section.content}
            </Text>
          )}

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

      {privacy.thankyouNote && (
        <Text
          size="p"
          weight="normal"
          color="#DAB769"
          style={{ marginBottom: 60 }}
        >
          {privacy.thankyouNote}
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
  title: {
    marginBottom: 10,
  },
  metadata: {
    marginBottom: 24,
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

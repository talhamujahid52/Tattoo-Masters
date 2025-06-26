import { StyleSheet, View, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import Text from "@/components/Text";
import firestore from "@react-native-firebase/firestore";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

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
  version: "1.0.0",
  lastUpdated: firestore.Timestamp.fromDate(new Date()),
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

const PrivacyPolicy = () => {
  const [privacy, setPrivacy] = useState<PrivacyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
    const fetchPrivacy = async () => {
      try {
        const doc = await firestore()
          .collection("app_content")
          .doc("privacy_policy")
          .get();

        if (doc.exists) {
          setPrivacy(doc.data() as PrivacyData);
        }
      } catch (error) {
        console.error("Error fetching privacy policy:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacy();
  }, []);

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        <Text size="h1" weight="medium" color="#FBF6FA" style={styles.title}>
          Privacy Policy
        </Text>
        <Text size="p" weight="normal" color="#FBF6FA">
          Loading...
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text size="h1" weight="medium" color="#FBF6FA" style={styles.title}>
        Privacy Policy
      </Text>

      {privacy?.content?.sections.map((section) => (
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

      {privacy?.thankyouNote && (
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

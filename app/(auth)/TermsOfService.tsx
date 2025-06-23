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

interface TermsContent {
  title: string;
  sections: Section[];
}

interface TermsData {
  version: string;
  lastUpdated: FirebaseFirestoreTypes.Timestamp;
  content: TermsContent;
  isActive: boolean;
  thankyouNote?: string;
}

const termsData: TermsData = {
  version: "1.0.0",
  lastUpdated: firestore.Timestamp.fromDate(new Date()),
  content: {
    title: "Terms of Service",
    sections: [
      {
        id: "welcome",
        title: "",
        content:
          'Welcome to Tattoo Masters. These Terms of Service ("Terms") govern your use of the Tattoo Masters mobile application and platform ("App," "Service," or "Platform"), provided by Tattoo Masters ("Company," "we," "us," or "our"). By accessing or using Tattoo Masters, you agree to be bound by these Terms.',
      },
      {
        id: "overview",
        title: "Overview of Service",
        content:
          "Tattoo Masters is a platform designed to connect users with tattoo artists. Tattoo artists can create public profiles, upload photos of their work, share general information, and receive likes, follows, and reviews from other users. Non-artist users can search for artists, follow artists, like content, send messages, search for ideas, and post reviews with photo uploads.",
      },
      {
        id: "eligibility",
        title: "Eligibility",
        content:
          "Tattoo Masters is available worldwide and does not impose an age restriction. However, individuals under 13 years of age must use the platform only with parental or guardian supervision, subject to local laws.",
      },
      {
        id: "user_accounts",
        title: "User Accounts",
        content:
          "Users are responsible for maintaining the confidentiality of their login credentials and agree to provide accurate and updated information. Account misuse may result in suspension or termination without advance notice. Tattoo Masters does not guarantee the accuracy of user accounts and is not liable for any interactions or transactions between users and artists.",
      },
      {
        id: "artist_profiles",
        title: "Tattoo Artist Profiles",
        content:
          "Tattoo artists may create professional profiles that include:",
        bulletPoints: [
          "Name, location, contact, and general information",
          "Portfolio photos",
          "Preferred styles",
          "Ratings and reviews from platform users",
        ],
        additionalContent:
          "Tattoo Masters does not guarantee the accuracy of artist profiles and is not liable for any interactions or transactions between users and artists.",
      },
      {
        id: "content_guidelines",
        title: "Content Guidelines",
        content: "Users agree not to upload, post, or share content that is:",
        bulletPoints: [
          "Illegal, hateful, discriminatory, or violent",
          "Pornographic or sexually explicit",
          "Misleading, spammy, or fraudulent",
          "In violation of intellectual property rights",
        ],
        additionalContent:
          "Content may include tattoos showcasing nudity but must be respectful. Tattoo Masters reserves the right to remove any content that violates these terms and to suspend or terminate accounts as needed without notice. Tattoo Masters is not liable for any user- or artist-uploaded content.",
      },
      {
        id: "reviews_messaging",
        title: "User Reviews and Messaging",
        content:
          "Users may review tattoo artists and upload related photos. Reviews must be based on genuine experiences. Messaging should be respectful and appropriate.",
      },
      {
        id: "content_license",
        title: "License to Use Content",
        content:
          "By uploading content, you grant Tattoo Masters a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content on the platform and for promotional purposes. You retain ownership of your content.",
      },
      {
        id: "payments",
        title: "Subscriptions and Payments",
        content:
          "Premium features are available through optional subscriptions. Payments are processed via app stores and renew automatically unless canceled. Tattoo Masters does not process tattoo service payments nor take commissions. We are not liable for transactions between users and artists.",
      },
      {
        id: "intellectual_property",
        title: "Intellectual Property",
        content:
          "All branding, names, logos, interface designs, texts, and proprietary content created by Tattoo Masters are the property of the Company. Users may not copy, reuse, or distribute platform content without permission. The functions and general idea of the platform are also the property of the Company.",
      },
      {
        id: "third_party",
        title: "Third-Party Integrations",
        content:
          "Tattoo Masters may include third-party services like maps, analytics, or advertising. We are not responsible for the content or privacy practices of third parties.",
      },
      {
        id: "termination",
        title: "Termination",
        content:
          "We reserve the right to suspend or terminate any account at our discretion, particularly in cases of content abuse or legal violations, without notice. Subscriptions and payments are non-refundable in such cases.",
      },
      {
        id: "liability",
        title: "Limitation of Liability",
        content:
          'Tattoo Masters is provided "as is" and "as available." We do not guarantee uninterrupted access or error-free operation. Our liability is limited to the fullest extent permitted by law.',
      },
      {
        id: "governing_law",
        title: "Governing Law",
        content:
          "These Terms are governed by and construed in accordance with the laws of Finland, unless international law is applicable.",
      },
      {
        id: "updates",
        title: "Updates to Terms",
        content:
          "We may update these Terms periodically. Users will be notified of significant changes within the app.",
      },
    ],
  },
  isActive: true,
};

const TermsOfService = () => {
  const [terms, setTerms] = useState<TermsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // const uploadTermsToFirebase = async () => {
  //   try {
  //     await firestore()
  //       .collection("app_content")
  //       .doc("terms_of_service")
  //       .set(termsData);

  //     console.log("Terms uploaded successfully!");
  //     return { success: true };
  //   } catch (error: any) {
  //     console.error("Error uploading terms:", error);
  //     return { success: false, error: error.message };
  //   }
  // };

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const doc = await firestore()
          .collection("app_content")
          .doc("terms_of_service")
          .get();

        if (doc.exists) {
          setTerms(doc.data() as TermsData);
        }
      } catch (error) {
        console.error("Error fetching terms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        <Text size="h1" weight="medium" color="#FBF6FA" style={styles.title}>
          Terms of service
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
        Terms of service
      </Text>

      {terms?.content?.sections.map((section) => (
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

      {terms?.thankyouNote && (
        <Text
          size="p"
          weight="normal"
          color="#DAB769"
          style={{ marginBottom: 60 }}
        >
          {terms.thankyouNote}
        </Text>
      )}
    </ScrollView>
  );
};

export default TermsOfService;

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

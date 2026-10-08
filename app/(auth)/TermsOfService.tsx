import { StyleSheet, View, ScrollView, Platform } from "react-native";
import React from "react";
import Text from "@/components/Text";

interface Section {
  id: string;
  title: string;
  content: string;
  bulletPoints?: string[];
  additionalContent?: string;
}

interface TermsData {
  title: string;
  sections: Section[];
  thankyouNote?: string;
}

const termsData: TermsData = {
  title: "Terms of Service",
  sections: [
    {
      id: "welcome",
      title: "",
      content:
        'Welcome to Tattoo Masters. These Terms of Service ("Terms") govern your use of the Tattoo Masters mobile application and platform ("App", "Service" or "Platform"), provided by Purple Moon Productions ("Company", "we", "us" or "our"). By accessing or using Tattoo Masters you agree to be bound by these Terms.',
    },
    {
      id: "overview",
      title: "1. Overview of Service",
      content:
        "Tattoo Masters is a platform designed to connect users with tattoo artists. Tattoo artists can create public profiles, upload photos of their work, share general information and receive likes, follows and reviews from other users. Non-artist users can search for artists, follow artists, like content, send messages, search for ideas and post reviews with photo uploads.",
    },
    {
      id: "eligibility",
      title: "2. Eligibility",
      content:
        "Tattoo Masters is available worldwide and is not intended for children under 13 years of age. Users must comply with the minimum age requirements applicable in their country.",
    },
    {
      id: "user_accounts",
      title: "3. User Accounts",
      content:
        "Users are responsible for maintaining the confidentiality of their login credentials. Users agree to provide accurate and updated information. Account misuse may result in suspension or termination without advance notice. Tattoo Masters does not guarantee the accuracy of user accounts and is not liable for any interactions or transactions between users and artists.",
    },
    {
      id: "artist_profiles",
      title: "4. Tattoo Artist Profiles",
      content:
        "Tattoo artists may create professional profiles that include, but is not limited to:",
      bulletPoints: [
        "Name, location, contact and general information",
        "Portfolio photos",
        "Preferred styles",
        "Ratings and reviews from platform users",
      ],
      additionalContent:
        "Account misuse may result in suspension or termination without advance notice. Tattoo Masters does not guarantee the accuracy of artist profiles and is not liable for any interactions or transactions between users and artists.",
    },
    {
      id: "content_guidelines",
      title: "5. Content Guidelines",
      content: "Users agree not to upload, post or share content that is:",
      bulletPoints: [
        "Illegal, hateful, discriminatory or violent",
        "Pornographic or sexually explicit",
        "Misleading, spammy or fraudulent",
        "Violating intellectual property rights",
      ],
      additionalContent:
        "Content of tattoos may and will contain showcasing nudity within reason but is to follow respectful manners. Respectful manners are to be followed uploading, posting or sharing any borderline content. Users must ensure that uploaded content complies with these Terms. Tattoo Masters reserves the right to remove content that is considered violating these Terms and to suspend or terminate accounts as needed without advance notice. Tattoo Masters is not liable of any content uploaded by users or artists.",
    },
    {
      id: "reviews_messaging",
      title: "6. User Reviews and Messaging",
      content:
        "Users may review tattoo artists and upload related photos. Reviews must be based on genuine experiences and should not contain false, misleading, abusive or defamatory content. Messaging is intended for respectful communication only.",
    },
    {
      id: "reporting_safety",
      title: "7. Reporting and Safety",
      content:
        "Users may report content, profiles or reviews that violates these Terms or community standards. Tattoo Masters may review reported content and take appropriate actions, including removing content or restricting accounts. Users are responsible for using the platform respectfully and safely.",
    },
    {
      id: "license",
      title: "8. License to Use Content",
      content:
        "By uploading content, you grant Tattoo Masters a worldwide, non-exclusive, royalty-free license to use, display and distribute your content on the platform and for promotional purposes. You retain ownership of your content.",
    },
    {
      id: "subscriptions",
      title: "9. Subscriptions and Payments",
      content:
        "Premium features are offered through optional subscriptions. All payments are processed via the respective app stores. Subscriptions renew automatically unless canceled. Subscription prices and available features may change from time to time. Payments of tattoos are not processed via the Tattoo Masters platform nor does Tattoo Masters receive commissions. Tattoo Masters is not liable for any transactions between users and artists.",
    },
    {
      id: "intellectual_property",
      title: "10. Intellectual Property",
      content:
        "All branding, names, logos, interface designs, texts and proprietary content created by Purple Moon Productions are the property of the Company. Users may not copy, reuse or distribute platform content without permission. The functions and general idea of the platform is considered property of the Company and may not be copied or applied without permission.",
    },
    {
      id: "third_party",
      title: "11. Third-Party Integrations",
      content:
        "Tattoo Masters may include third-party links or integrate services such as maps, analytics or advertising. We are not responsible for third-party content or privacy practices.",
    },
    {
      id: "termination",
      title: "12. Termination",
      content:
        "We reserve the right to terminate or suspend any account at our discretion, especially in cases of content abuse or legal violations, without advance notice. In the case of termination, subscriptions and other payments will not be refunded.",
    },
    {
      id: "liability",
      title: "13. Limitation of Liability",
      content:
        'Tattoo Masters is provided "as is" and "as available." We do not guarantee uninterrupted access or error-free operation. Our liability is limited to the fullest extent permitted by law.',
    },
    {
      id: "governing_law",
      title: "14. Governing Law",
      content:
        "These Terms shall be governed by and construed in accordance with the laws of Finland when international law is not applicable.",
    },
    {
      id: "updates",
      title: "15. Updates to Terms",
      content:
        "We may update the Terms periodically. We will notify users of significant changes within the app.",
    },
  ],
  thankyouNote:
    "We hope you enjoy the Tattoo Masters application and use it in a friendly and respectful manner!",
};

const TermsOfService = () => {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={Platform.OS !== "ios"}
    >
      <Text size="h1" weight="medium" color="#FBF6FA" style={styles.heading}>
        {termsData.title}
      </Text>

      {termsData.sections.map((section) => (
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

      {termsData.thankyouNote && (
        <Text
          size="p"
          weight="normal"
          color="#DAB769"
          style={{ marginBottom: 60 }}
        >
          {termsData.thankyouNote}
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

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import Collapsible from "react-native-collapsible";
import Text from "@/components/Text";
import { router } from "expo-router";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";

const FAQScreen = () => {
  const [faqData, setFaqData] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const doc = await firestore()
          .collection("app_content")
          .doc("faqs")
          .get();

        if (doc.exists) {
          setFaqData(doc.data());
        }
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const toggleFAQ = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // 🔄 Upload FAQs to Firebase (Run Once Then Comment Out)
  const uploadFAQsToFirebase = async () => {
    const data = {
      version: "1.0.0",
      lastUpdated: firestore.Timestamp.fromDate(new Date()),
      isActive: true,
      faqs: [
        {
          id: "what_is_tm",
          question: "What is Tattoo Masters?",
          answer:
            "Tattoo Masters is a global social platform where tattoo artists and enthusiasts connect. Artists can build professional profiles, showcase their work, receive reviews, share their location and build their reputation to be found by customers and hence have a platform to sell their skills, while users can discover ideas and styles, find and follow artists and connect with tattoo talent worldwide. It is a platform where all artists have an equal chance to be found, no matter they work in well known studios, freelance or make tattoos in the comfort of their own homes. For tattoo enthusiasts, it’s the easiest way to explore authentic artist profiles, see real customer reviews with pictures and find the right artist, in the right place, for your next tattoo. On Tattoo Masters you will find the perfect artist to match your desire. You can message the artist directly on the app.",
        },
        {
          id: "is_free",
          question: "Is Tattoo Masters free to use?",
          answer:
            "Yes! Tattoo Masters is free to download and use. We also offer optional features for tattoo artists to build professional profiles for a reasonable monthly subscription, with campaigns and offers, such as first year for free!",
        },
        {
          id: "available_countries",
          question: "Which countries is Tattoo Masters available in?",
          answer:
            "Tattoo Masters is available worldwide, with a growing community across Europe, Asia, Australia and the USA.",
        },
        {
          id: "find_artists",
          question: "How do I find tattoo artists near me?",
          answer:
            "Simply use the search function to discover artists in your area. You will find all artists nicely pinned on our map. You may also search for artists worldwide to connect with, ready for your next trip!",
        },
        {
          id: "review_artist",
          question: "How can I review an artist?",
          answer:
            "To review an artist you will need to get the artist’s review password. With this password you may leave your review with a mandatory picture of the tattoo. This is to ensure authenticity of reviews. As an artist, you may also provide your review password to former customers and ask them to give you great reviews!",
        },
        {
          id: "create_profile",
          question: "How do I create a professional profile?",
          answer:
            "Go to Settings > Register as an artist to upgrade your account from enthusiast to professional and build your own profile. Fill your personal information, connect your social media accounts, pin your location, upload your portfolio, create your review password and start your free trial as a professional tattoo artist!",
        },
        {
          id: "artist_verification",
          question: "How can I be sure the artist is who they say they are?",
          answer:
            "Tattoo Masters provides a great platform for you to do your research and to get to know the artist in question. Check out their profile, have a look at their linked social media accounts, read their reviews and chat with the artist directly on the app. In case you do not find an artist trustworthy or suspect impersonating or other inappropriate use of the application, please report the account so we can keep Tattoo Masters a clean, safe, professional and friendly environment for all us who love tattoos. Do not set up a meeting in person if you do not feel safe or suspect the artist is not who they claim to be. We take your safety seriously. Tattoo Masters does not guarantee the accuracy of user accounts and is not liable for any interactions or transactions between users and artists.",
        },
        {
          id: "who_is_responsible",
          question: "Who is responsible for my new tattoo?",
          answer:
            "Primarily you, and in some cases the artist to the degree the artist’s business provides. A tattoo is a willful commitment you, and only you, decide to have done on your own body. Tattoo Masters provides a great platform for you to do your research and to get to know the artist in question. Read their reviews and look at their portfolios to ensure their talent is up to your demand. Tattoo Masters does not guarantee the accuracy of user accounts and is not liable for any interactions or transactions between users and artists.",
        },
        {
          id: "forgot_password",
          question: "I forgot my password. What should I do?",
          answer:
            "Use the “Forgot password” option on the login screen to reset it via email.",
        },
        {
          id: "age_restriction",
          question: "Are there age restrictions?",
          answer:
            "Tattoo Masters does not impose an age restriction. However, individuals under 13 years of age must use the platform only with parental or guardian supervision, subject to local laws. Tattoo related content may not be suitable for young audiences.",
        },
        {
          id: "data_safety",
          question: "Is my personal information safe?",
          answer:
            "Yes, we take data privacy seriously. You may read more about how we use your personal information in our Privacy Policy.",
        },
        {
          id: "report_bug",
          question: "I found a bug. How do I report it?",
          answer:
            "Go to Settings > Feedback > Leave feedback to let us know. We appreciate your help keeping Tattoo Masters up to date.",
        },
      ],
    };

    try {
      await firestore().collection("app_content").doc("faqs").set(data);
      console.log("FAQs uploaded successfully.");
    } catch (error) {
      console.error("Failed to upload FAQs:", error);
    }
  };

  // Run once manually, then comment out
  // useEffect(() => {
  //   uploadFAQsToFirebase();
  // }, []);

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView style={[styles.container, { paddingBottom: insets.bottom }]}>
        {/* Feedback Shortcut */}
        <Pressable
          style={styles.feedbackContainer}
          onPress={() => router.push("/artist/Feedback")}
        >
          <View style={styles.feedbackImage}>
            <Image
              source={require("../../assets/images/feedbackAndSupport.png")}
              style={{ width: "100%", height: "100%" }}
            />
          </View>
          <View style={{ width: "80%", rowGap: 4 }}>
            <Text size="h4" weight="normal" color="#FBF6FA">
              Leave feedback
            </Text>
            <Text size="p" weight="normal" color="#A7A7A7">
              Help us improve the app by sharing your valuable feedback.
            </Text>
          </View>
        </Pressable>

        <Text
          size="h3"
          color="#FBF6FA"
          weight="medium"
          style={{ marginBottom: 12 }}
        >
          FAQ
        </Text>

        {loading ? (
          <ActivityIndicator color="#FBF6FA" size="large" />
        ) : (
          faqData?.faqs?.map((faq, index) => (
            <View key={faq.id} style={styles.faqContainer}>
              <Pressable
                style={styles.faqHeader}
                onPress={() => toggleFAQ(index)}
              >
                <Text
                  size="p"
                  weight="semibold"
                  color="#FBF6FA"
                  style={{ width: "90%" }}
                >
                  {faq.question}
                </Text>
                <Image
                  source={
                    expandedIndex === index
                      ? require("../../assets/images/arrow_up.png")
                      : require("../../assets/images/arrow_down.png")
                  }
                  style={{ width: 24, height: 24 }}
                />
              </Pressable>

              <Collapsible collapsed={expandedIndex !== index}>
                <View style={styles.answerContainer}>
                  <Text size="p" weight="normal" color="#A7A7A7">
                    {faq.answer}
                  </Text>
                </View>
              </Collapsible>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#000",
  },
  feedbackContainer: {
    display: "flex",
    flexDirection: "row",
    columnGap: 16,
    paddingBottom: 24,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },
  feedbackImage: {
    width: 44,
    height: 44,
  },
  faqContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  answerContainer: {
    marginTop: 5,
    width: "95%",
  },
});

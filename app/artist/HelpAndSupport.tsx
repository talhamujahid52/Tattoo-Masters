import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import Collapsible from "react-native-collapsible";
import Text from "@/components/Text";
const App = () => {
  // State to track which FAQ is expanded (index-based)
  const [expandedIndex, setExpandedIndex] = useState(null);

  // List of FAQs
  const faqs = [
    {
      question: "What is React Native?",
      answer:
        "React Native is a framework for building native apps using React.",
    },
    {
      question: "How do I install React Native?",
      answer: "You can install React Native using npm or yarn.",
    },
    {
      question: "What is the difference b/w React and React Native?",
      answer:
        "React is for building web apps, while React Native is for building mobile apps.",
    },
    {
      question: "How do I handle navigation in React Native?",
      answer:
        "You can use React Navigation or React Router Native for handling navigation in React Native.",
    },
  ];

  // Toggle the expanded FAQ
  const toggleFAQ = (index: any) => {
    setExpandedIndex(expandedIndex === index ? null : index); // Collapse if the same FAQ is clicked, else expand the new one
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          columnGap: 16,
          paddingBottom: 24,
          marginBottom: 24,
          borderBottomWidth: 1,
          borderBottomColor: "#262626",
        }}
      >
        <View style={{ width: 44, height: 44 }}>
          <Image
            style={{ width: "100%", height: "100%" }}
            source={require("../../assets/images/feedbackAndSupport.png")}
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
      </View>
      <Text size="h3" color="#FBF6FA" weight="medium">
        FAQ
      </Text>
      {faqs.map((faq, index) => (
        <View key={index} style={styles.faqContainer}>
          {/* FAQ Question */}
          <Pressable
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onPress={() => toggleFAQ(index)}
          >
            <Text
              size="p"
              weight="semibold"
              color="#FBF6FA"
              style={{ width: "80%" }}
            >
              {faq.question}
            </Text>
            <View style={{ width: 24, height: 24 }}>
              <Image
                style={{ width: "100%", height: "100%" }}
                source={
                  index === expandedIndex
                    ? require("../../assets/images/arrow_up.png")
                    : require("../../assets/images/arrow_down.png")
                }
              />
            </View>
          </Pressable>

          {/* Collapsible Answer */}
          <Collapsible collapsed={expandedIndex !== index}>
            <View style={styles.answerContainer}>
              <Text size="p" weight="normal" color="#A7A7A7">
                {faq.answer}
              </Text>
            </View>
          </Collapsible>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 16,
    backgroundColor: "#000",
  },
  faqContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
    paddingVertical: 16,
  },
  questionButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
  },
  answerContainer: {
    marginTop: 5,
    width: "95%",
  },
});

export default App;

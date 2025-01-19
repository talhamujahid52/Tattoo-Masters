import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import Text from "@/components/Text";
import Input from "@/components/Input";
import ConnectSocialMediaButton from "@/components/ConnectSocialMediaButton";
import Button from "@/components/Button";

const EditProfile = () => {
  const [aboutYou, setAboutYou] = useState("");
  const [isEnabledRadius, setIsEnabledRadius] = useState(false);
  const toggleSwitch = () =>
    setIsEnabledRadius((previousState) => !previousState);
  const options = [
    { label: "Studio", value: "option1" },
    { label: "Freelancer", value: "option2" },
    { label: "Homeartist", value: "option3" },
  ];
  const [tattooStyles, setTattooStyles] = useState([
    { title: "Tribal", value: 1, selected: false },
    { title: "Geometric", value: 2, selected: false },
    { title: "Black and White", value: 3, selected: false },
  ]);

  const handleSelection = (value: string) => {
    console.log("Selected:", value);
  };

  const toggleTattooStyles = (value: number) => {
    const updatedTattooStyles = tattooStyles.map((item) =>
      item.value === value ? { ...item, selected: !item.selected } : item
    );

    setTattooStyles(updatedTattooStyles);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profilePictureRow}>
        <Image
          style={styles.profilePicture}
          source={require("../../assets/images/profilePicture.png")}
        />
        <TouchableOpacity>
          <Text size="h4" weight="semibold" color="#DAB769">
            Change photo
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginBottom: 16 }}>
        <Text
          size="h4"
          weight="semibold"
          color="#A7A7A7"
          style={{ marginBottom: 10 }}
        >
          Full Name
        </Text>
        <Input inputMode="text" placeholder="Full Name"></Input>
      </View>
      <View style={{ marginBottom: 16 }}>
        <Text
          size="h4"
          weight="semibold"
          color="#A7A7A7"
          style={{ marginBottom: 10 }}
        >
          Phone Number
        </Text>
        <Input inputMode="tel" placeholder="Phone Number"></Input>
      </View>
    </ScrollView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
    borderTopWidth: 0.33,
    borderColor: "#FFFFFF56",
  },
  profilePictureRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  profilePicture: {
    width: 114,
    height: 114,
    resizeMode: "contain",
  },
  ratingButtonsRow: {
    marginTop: 16,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  textArea: {
    height: 100,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#FFFFFF1A",
    color: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    // marginBottom: 100,
  },
});

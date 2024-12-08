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
import RadioButton from "@/components/RadioButton";
import ConnectSocialMediaButton from "@/components/ConnectSocialMediaButton";
import Button from "@/components/Button";

const Step1 = () => {
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
          source={require("../assets/images/profilePicture.png")}
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
      <RadioButton
        title="Studio"
        options={options}
        onSelect={handleSelection}
      />
      <View style={{ marginTop: 6 }}>
        <Text
          size="h4"
          weight="semibold"
          color="#A7A7A7"
          style={{ marginBottom: 10 }}
        >
          Location
        </Text>
        <Input inputMode="text" placeholder="Location"></Input>
      </View>
      <View style={{ marginTop: 16 }}>
        <Text
          size="h4"
          weight="semibold"
          color="#A7A7A7"
          style={{ marginBottom: 10 }}
        >
          Pin your exact location
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Text
            size="h4"
            weight="normal"
            color="#FBF6FA"
            style={{ marginBottom: 10 }}
          >
            Show city only
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#44e52c" }}
            thumbColor={isEnabledRadius ? "#fff" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabledRadius}
          />
        </View>
        <View>
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Styles
          </Text>
          <View style={styles.ratingButtonsRow}>
            {tattooStyles.map((item, idx) => {
              return (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={1}
                  style={{
                    padding: 6,
                    borderRadius: 6,
                    backgroundColor: item.selected ? "#DAB769" : "#262526",
                  }}
                  onPress={() => toggleTattooStyles(item.value)}
                >
                  <Text
                    size="p"
                    weight="normal"
                    color={item.selected ? "#22221F" : "#A7A7A7"}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={{ marginTop: 16, marginBottom: 16 }}>
          <Text
            size="h4"
            weight="semibold"
            color="#A7A7A7"
            style={{ marginBottom: 10 }}
          >
            About you
          </Text>
          <TextInput
            selectionColor="#A29F93"
            placeholderTextColor="#A29F93"
            placeholder="My Intro"
            multiline
            value={aboutYou}
            style={styles.textArea}
            maxLength={100}
            onChangeText={(newtext) => {
              setAboutYou(newtext);
            }}
          ></TextInput>
          <Text
            size="medium"
            weight="normal"
            color="#A7A7A7"
            style={{ textAlign: "right", marginTop: 4 }}
          >
            {aboutYou.length} / 100
          </Text>
        </View>
        <View style={{ marginBottom: 70 }}>
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Connect your social media accounts
          </Text>
          <View
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
              marginBottom: 24,
            }}
          >
            <ConnectSocialMediaButton
              title="Facebook Connected"
              icon={require("../assets/images/facebook_2.png")}
              onConnect={() => {
                alert("This Functionality is not Available.");
              }}
              onDisconnect={() => {
                alert("This Functionality is not Available.");
              }}
              isConnected={true}
            />
            <ConnectSocialMediaButton
              title="Connect Instagram"
              icon={require("../assets/images/instagram.png")}
              onConnect={() => {
                alert("This Functionality is not Available.");
              }}
              onDisconnect={() => {
                alert("This Functionality is not Available.");
              }}
              isConnected={false}
            />
          </View>
          {/* <Button title="Save" /> */}
        </View>
      </View>
    </ScrollView>
  );
};

export default Step1;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#FFFFFF56",
    borderRadius: 20,
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
  },
});

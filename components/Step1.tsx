import React, { useState, useContext, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
} from "react-native";
import Text from "@/components/Text";
import Input from "@/components/Input";
import RadioButton from "@/components/RadioButton";
import ConnectSocialMediaButton from "@/components/ConnectSocialMediaButton";
import MapView, { Region, PROVIDER_GOOGLE } from "react-native-maps";
import { Asset, launchImageLibrary } from "react-native-image-picker";
import { router } from "expo-router";
import { FormContext } from "../context/FormContext";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { UserFirestore } from "@/types/user";
import { useSelector } from "react-redux";

const Step1: React.FC = () => {
  const { formData, setFormData } = useContext(FormContext)!;

  const options = [
    { label: "Studio", value: "studio" },
    { label: "Freelancer", value: "freelancer" },
    { label: "Homeartist", value: "homeArtist" },
  ];

  const defaultLocation = {
    latitude: 33.664286,
    longitude: 73.004291,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user,
  );
  const loggedInUserFirestore: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore,
  );

  // Prepopulate the full name field if it is not already set.
  useEffect(() => {
    if (
      loggedInUserFirestore?.name &&
      !formData.fullName &&
      formData.fullName !== ""
    ) {
      setFormData((prev) => ({
        ...prev,
        name: loggedInUserFirestore.name,
      }));
    }
  }, [loggedInUserFirestore, formData.fullName, setFormData]);

  const localImage = useMemo(() => {
    return {
      uri:
        formData?.profilePicture ??
        loggedInUserFirestore?.profilePictureSmall ??
        loggedInUserFirestore?.profilePicture ??
        loggedInUser?.photoURL ??
        undefined,
    };
  }, [loggedInUser, loggedInUserFirestore, formData]);

  const [region, setRegion] = useState<Region>({
    latitude: formData.location?.latitude || defaultLocation.latitude,
    longitude: formData.location?.longitude || defaultLocation.longitude,
    latitudeDelta: defaultLocation.latitudeDelta,
    longitudeDelta: defaultLocation.longitudeDelta,
  });

  const handleProfilePictureSelection = async () => {
    const result = await launchImageLibrary({
      selectionLimit: 1,
      mediaType: "photo",
      includeBase64: true,
      quality: 0.4,
    });
    if (!result.didCancel && result.assets && result.assets[0].uri) {
      const selectedImageUri = result.assets[0].uri;
      setFormData((prev) => ({ ...prev, profilePicture: selectedImageUri }));
    }
  };

  const toggleSwitch = () => {
    setFormData((prev) => ({ ...prev, showCityOnly: !prev.showCityOnly }));
  };

  const toggleTattooStyles = (tattooStyle: {
    title: string;
    selected: boolean;
  }) => {
    const updatedTattooStyles = formData.tattooStyles.map((item) =>
      item.title === tattooStyle.title
        ? { ...item, selected: !item.selected }
        : item,
    );
    setFormData((prev) => ({ ...prev, tattooStyles: updatedTattooStyles }));
  };

  useEffect(() => {
    console.log("Location Changed in Step1");
    setRegion({
      latitude: formData.location?.latitude || defaultLocation.latitude,
      longitude: formData.location?.longitude || defaultLocation.longitude,
      latitudeDelta: defaultLocation.latitudeDelta,
      longitudeDelta: defaultLocation.longitudeDelta,
    });
  }, [formData.location]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profilePictureRow}>
        <Image style={styles.profilePicture} source={localImage} />
        <TouchableOpacity onPress={handleProfilePictureSelection}>
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
        <Input
          inputMode="text"
          placeholder="Full Name"
          value={formData.fullName}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, fullName: text }))
          }
        />
      </View>
      <RadioButton
        title="Studio"
        options={options}
        selectedValue={formData.studio}
        inputValue={formData.studioName}
        onSelect={(value) =>
          setFormData((prev) => ({ ...prev, studio: value }))
        }
        onStudioNameChange={(name) =>
          setFormData((prev) => ({ ...prev, studioName: name }))
        }
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
        <Input
          inputMode="text"
          placeholder="Location"
          value={formData.city}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, city: text }))
          }
        />
      </View>
      <View style={{ marginTop: 16 }}>
        <Text
          size="h4"
          weight="semibold"
          color="#A7A7A7"
          style={{ marginBottom: 10 }}
        >
          Pin your location
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 10,
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
            thumbColor={formData.showCityOnly ? "#fff" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={formData.showCityOnly}
          />
        </View>
        {!formData.showCityOnly && (
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/artist/SearchLocation",
              });
            }}
            style={{
              height: 130,
              borderRadius: 20,
              overflow: "hidden",
              marginTop: 8,
              marginBottom: 16,
            }}
          >
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              mapType="terrain"
              region={region}
            >
              {/* <Marker coordinate={region} title="Location" />  */}
            </MapView>
          </TouchableOpacity>
        )}
        <View>
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Styles
          </Text>
          <View style={styles.ratingButtonsRow}>
            {formData.tattooStyles.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={1}
                style={{
                  padding: 6,
                  borderRadius: 6,
                  backgroundColor: item.selected ? "#DAB769" : "#262526",
                }}
                onPress={() => toggleTattooStyles(item)}
              >
                <Text
                  size="p"
                  weight="normal"
                  color={item.selected ? "#22221F" : "#A7A7A7"}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
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
            value={formData.aboutYou}
            style={styles.textArea}
            maxLength={100}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, aboutYou: text }))
            }
          />
          <Text
            size="medium"
            weight="normal"
            color="#A7A7A7"
            style={{ textAlign: "right", marginTop: 4 }}
          >
            {formData.aboutYou.length} / 100
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
        </View>
      </View>
    </ScrollView>
  );
};

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
    borderRadius: 57,
    width: 114,
    height: 114,
    resizeMode: "cover",
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
  map: {
    ...StyleSheet.absoluteFillObject, // Makes the map take up the entire screen
  },
});

export default Step1;

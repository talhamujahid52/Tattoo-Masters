import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useState, useContext } from "react";
import Text from "@/components/Text";
import Input from "@/components/Input";
import RadioButton from "@/components/RadioButton";
import ConnectSocialMediaButton from "@/components/ConnectSocialMediaButton";
import Button from "@/components/Button";
import { router } from "expo-router";
import MapView, { Region, PROVIDER_GOOGLE } from "react-native-maps";
import { launchImageLibrary } from "react-native-image-picker";
import { useDispatch, useSelector } from "react-redux";

const EditProfile = () => {
  const loggedInUser = useSelector((state: any) => state?.user?.userFirestore);

  // console.log(
  //   "Logged In User in Edit Profile ",
  //   loggedInUser.location.coordinates.latitude
  // );

  const [formData, setFormData] = useState({
    profilePicture:
      loggedInUser?.profilePictureSmall ?? loggedInUser.profilePicture,
    name: loggedInUser?.name ? loggedInUser?.name : "",
    studio: loggedInUser?.studio ? loggedInUser?.studio?.type : "",
    studioName: loggedInUser?.studio ? loggedInUser?.studio?.name : "",
    city: loggedInUser?.city ? loggedInUser?.city : "",
    location: {
      latitude: loggedInUser?.location?.coordinates?.latitude
        ? loggedInUser?.location?.coordinates?.latitude
        : "",
      longitude: loggedInUser?.location?.coordinates?.longitude
        ? loggedInUser?.location?.coordinates?.longitude
        : "",
      address: loggedInUser?.address ? loggedInUser?.address : "",
    },
    showCityOnly: true,
    tattooStyles: loggedInUser?.tattooStyles
      ? loggedInUser?.tattooStyles
      : [
          { title: "Tribal", selected: false },
          { title: "Geometric", selected: false },
          { title: "Black and White", selected: false },
        ],
    aboutYou: loggedInUser?.about ? loggedInUser?.about : "",
  });
  const options = [
    { label: "Studio", value: "studio" },
    { label: "Freelancer", value: "freelancer" },
    { label: "Homeartist", value: "homeArtist" },
  ];
  // const [tattooStyles, setTattooStyles] = useState([
  //   { title: "Tribal", value: 1, selected: false },
  //   { title: "Geometric", value: 2, selected: false },
  //   { title: "Black and White", value: 3, selected: false },
  // ]);
  const toggleTattooStyles = (value: number) => {
    const updatedTattooStyles = formData.tattooStyles.map((item: any) =>
      item.value === value ? { ...item, selected: !item.selected } : item,
    );
  };
  const defaultLocation = {
    latitude: 33.664286,
    longitude: 73.004291,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };
  const [region, setRegion] = useState<Region>({
    latitude: formData.location?.latitude || defaultLocation.latitude,
    longitude: formData.location?.longitude || defaultLocation.longitude,
    latitudeDelta: defaultLocation.latitudeDelta,
    longitudeDelta: defaultLocation.longitudeDelta,
  });

  const toggleSwitch = () => {
    setFormData((prev) => ({ ...prev, showCityOnly: !prev.showCityOnly }));
  };

  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: 1, // Allow only one image to be selected
    });

    if (!result.didCancel && result.assets && result.assets[0].uri) {
      const selectedImageUri = result.assets[0].uri;

      setFormData((prev) => {
        return { ...prev, profilePicture: selectedImageUri };
      });
    }
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profilePictureRow}>
        <Image
          style={styles.profilePicture}
          source={
            formData?.profilePicture
              ? { uri: formData?.profilePicture }
              : require("../../assets/images/profilePicture.png")
          }
        />
        <TouchableOpacity
          onPress={() => {
            handleSelectImage();
          }}
        >
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
          value={formData.name}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, name: text }))
          }
        ></Input>
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
        ></Input>
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
            {formData.tattooStyles.map((item: any, idx: any) => {
              return (
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
                    {item}
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
            value={formData.aboutYou}
            style={styles.textArea}
            maxLength={100}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, aboutYou: text }))
            }
          ></TextInput>
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
              icon={require("../../assets/images/facebook_2.png")}
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
              icon={require("../../assets/images/instagram.png")}
              onConnect={() => {
                alert("This Functionality is not Available.");
              }}
              onDisconnect={() => {
                alert("This Functionality is not Available.");
              }}
              isConnected={false}
            />
          </View>
          <Button
            title="Save"
            onPress={() => {
              console.log("Form Data after edit : ", formData);
            }}
          />
        </View>
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
    resizeMode: "cover",
    overflow: "hidden",
    borderRadius: 100,
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
  map: {
    ...StyleSheet.absoluteFillObject, // Makes the map take up the entire screen
  },
});

import React, { useContext, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import Text from "./Text";
import Button from "./Button";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import { FormContext } from "../context/FormContext";
import { useSelector } from "react-redux";
import useFirebaseImage from "@/utils/firebase/useFirebaseImage";
import { getFileName } from "@/utils/helperFunctions";
import { useRouter } from "expo-router";
import { updateProfile } from "@react-native-firebase/auth";
import { updateUserProfile } from "@/utils/firebase/userFunctions";
import { UserProfileFormData } from "@/types/user";
import { changeProfilePicture } from "@/utils/firebase/changeProfilePicture";
import { setUserFirestoreData } from "@/redux/slices/userSlice";
import { getUpdatedUser } from "@/utils/firebase/userFunctions";
import { useDispatch } from "react-redux";
const StepperForm: React.FC = () => {
  const totalSteps = 3;
  const { width } = Dimensions.get("window");
  const { step, setStep, formData } = useContext(FormContext)!;
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state: any) => state?.user?.user);
  const currentUserId = loggedInUser?.uid;
  const { uploadImages } = useFirebaseImage({
    uniqueFilePrefix: currentUserId,
  });

  const stepLabels = ["Profile", "Tattoo portfolio", "Preview"];

  const handleNext = () => {
    setStep((prevStep: number) => Math.min(prevStep + 1, totalSteps));
  };

  const handlePrevious = () => {
    setStep((prevStep: number) => Math.max(prevStep - 1, 1));
  };
  const submitForm = async () => {
    try {
      setLoading(true);
      const imgs = formData.images.filter((img) => img && img.uri);
      const updatedFormData = {
        ...formData,
        tattooStyles: formData.tattooStyles.map((style) => style.title),
      };
      console.log("updatedFormData", updatedFormData);
      await uploadImages(imgs); // upload publications images and add to publication collection as well
      await updateUserProfile(currentUserId, {
        ...updatedFormData,
        isArtist: true, //make the user an artist
      } as UserProfileFormData);
      // update the user profile picture as well if it has been changed
      if (formData?.profilePicture) {
        await changeProfilePicture(
          currentUserId,
          formData?.profilePicture,
          "profile.jpeg"
        );
      }

      const updatedUser = await getUpdatedUser(currentUserId);
      dispatch(setUserFirestoreData(updatedUser));
      console.log("profile updated successfully");
      router.replace("/(bottomTabs)/Home");
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const indicators = [];
    for (let i = 1; i <= totalSteps; i++) {
      indicators.push(
        <View key={i} style={styles.stepContainer}>
          <View
            style={[
              styles.stepIndicator,
              i === step && styles.activeStep,
              i < step && styles.doneStep,
            ]}
          >
            {i < step && (
              <Image
                style={{ height: 6, width: 8 }}
                source={require("../assets/images/black-tick.png")}
              />
            )}
          </View>
          {i < totalSteps && (
            <View style={[styles.line, { width: width / 5 }]} />
          )}
        </View>
      );
    }
    return <View style={styles.indicatorContainer}>{indicators}</View>;
  };

  const renderStepLabel = () => (
    <View style={styles.labelContainer}>
      {stepLabels.map((label, index) => (
        <Text
          key={index}
          size="medium"
          weight="normal"
          color={index + 1 === step ? "#FFFFFF" : "#A7A7A7"}
        >
          {label}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ paddingVertical: 24 }}>
        {renderStepIndicator()}
        {renderStepLabel()}
      </View>

      <View style={styles.contentContainer}>
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
      </View>

      <View style={styles.buttonContainer}>
        {step > 1 ? (
          <TouchableOpacity
            style={{
              width: 52,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handlePrevious}
          >
            <Image
              style={{ height: 13, width: 20 }}
              source={require("../assets/images/back-arrow.png")}
            />
          </TouchableOpacity>
        ) : (
          <View></View>
        )}
        {step < totalSteps ? (
          <View style={{ width: 84 }}>
            <Button title="Next" onPress={handleNext} />
          </View>
        ) : (
          <View style={{ width: 84 }}>
            <Button
              loading={loading}
              title="Next"
              onPress={() => {
                router.push("/artist/CreateReviewPassword");
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  stepContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 30,
  },
  stepIndicator: {
    width: 20,
    height: 20,
    borderRadius: 50,
    borderColor: "#302F2D",
    backgroundColor: "#302F2D",
    justifyContent: "center",
    alignItems: "center",
  },
  activeStep: {
    borderWidth: 2,
    borderColor: "#DAB769",
    backgroundColor: "#302F2D",
  },
  doneStep: {
    backgroundColor: "#DAB769",
  },
  line: {
    height: 3,
    borderRadius: 5,
    backgroundColor: "#FFFFFF26",
    marginHorizontal: 25,
    marginVertical: 10,
  },
  contentContainer: {
    flex: 1,
  },
  buttonContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
});
export default StepperForm;

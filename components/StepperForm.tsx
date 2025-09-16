import React, { useContext, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import Text from "./Text";
import Button from "./Button";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import { FormContext } from "../context/FormContext";
import { useSelector } from "react-redux";
import useBackgroundUpload from "@/hooks/useBackgroundUpload";
// import { getFileName } from "@/utils/helperFunctions";
import { useRouter } from "expo-router";
// import { updateProfile } from "@react-native-firebase/auth";
// import { updateUserProfile } from "@/utils/firebase/userFunctions";
// import { UserProfileFormData } from "@/types/user";
// import { changeProfilePicture } from "@/utils/firebase/changeProfilePicture";
// import { setUserFirestoreData } from "@/redux/slices/userSlice";
// import { getUpdatedUser } from "@/utils/firebase/userFunctions";
import { useDispatch } from "react-redux";
const StepperForm: React.FC = () => {
  const totalSteps = 3;
  const { width } = Dimensions.get("window");
  const { step, setStep, formData } = useContext(FormContext)!;
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state: any) => state?.user?.user);
  const userFirestore = useSelector((state: any) => state?.user?.userFirestore);
  const currentUserId = loggedInUser?.uid;
  const { queueUpload } = useBackgroundUpload();

  const stepLabels = ["Profile", "Tattoo portfolio", "Preview"];

  const handleNext = () => {
    // Validation: Step 1 requires profile picture selected
    if (step === 1) {
      const hasProfilePicture =
        !!formData?.profilePicture ||
        !!userFirestore?.profilePictureSmall ||
        !!userFirestore?.profilePicture ||
        !!loggedInUser?.photoURL;
      if (!hasProfilePicture) {
        Alert.alert(
          "Profile picture required",
          "Please add a profile picture to continue.",
        );
        return;
      }

      // Full Name Validation
      if (!formData?.name || formData.name.trim().length === 0) {
        Alert.alert(
          "Full Name required",
          "Please enter your full name to continue.",
        );
        return;
      }

      // Studio Type Validation (Must select one)
      if (!formData?.studio) {
        Alert.alert(
          "Studio Type required",
          "Please select your work type (Studio, Freelancer, or Home Artist) to continue.",
        );
        return;
      }

      // If 'Studio' is selected, Studio Name is mandatory
      if (
        formData?.studio === "studio" &&
        (!formData?.studioName || formData.studioName.trim().length === 0)
      ) {
        Alert.alert(
          "Studio Name required",
          "Please enter your studio name to continue.",
        );
        return;
      }

      // Address Validation
      if (!formData?.address || formData.address.trim().length === 0) {
        Alert.alert(
          "Address required",
          "Please enter your address to continue.",
        );
        return;
      }

      // Tattoo Styles Validation (At least one style selected)
      if (!formData?.tattooStyles || formData.tattooStyles.length === 0) {
        Alert.alert(
          "Tattoo Style required",
          "Please select at least one tattoo style to continue.",
        );
        return;
      }

      // About You Validation
      if (!formData?.aboutYou || formData.aboutYou.trim().length === 0) {
        Alert.alert(
          "About You required",
          "Please provide an introduction about yourself to continue.",
        );
        return;
      }
    }
    // Validation: Step 2 requires at least 4 tattoos selected
    if (step === 2) {
      const firstFour = formData?.images?.slice(0, 4) || [];
      const allFourPresent = firstFour.every((img) => img && !!img.uri);
      if (!allFourPresent) {
        Alert.alert("Add 4 tattoos", "Please upload 4 tattoos to continue.");
        return;
      }
    }
    setStep((prevStep: number) => Math.min(prevStep + 1, totalSteps));
  };

  const handlePrevious = () => {
    setStep((prevStep: number) => Math.max(prevStep - 1, 1));
  };
  // const submitForm = async () => {
  //   try {
  //     setLoading(true);
  //     const imgs = formData.images.filter((img) => img && img.uri);
  //     const updatedFormData = {
  //       ...formData,
  //       tattooStyles: formData.tattooStyles.map((style) => style.title),
  //     };
  //     console.log("updatedFormData", updatedFormData);
  //
  //     // Queue images for background upload (only if not already uploaded)
  //     const imagesToUpload = imgs.filter(
  //       (img) => !img.uploadStatus || img.uploadStatus === "failed",
  //     );
  //
  //     if (imagesToUpload.length > 0) {
  //       console.log(
  //         `Queueing ${imagesToUpload.length} images for background upload`,
  //       );
  //
  //       for (const img of imagesToUpload) {
  //         queueUpload({
  //           uri: img.uri,
  //           userId: currentUserId,
  //           type: "publication",
  //           caption: img.caption,
  //           styles: img.styles,
  //           name: img.name,
  //         });
  //       }
  //     }
  //
  //     await updateUserProfile(currentUserId, {
  //       ...updatedFormData,
  //       isArtist: true, //make the user an artist
  //     } as UserProfileFormData);
  //
  //     // update the user profile picture as well if it has been changed
  //     if (formData?.profilePicture) {
  //       const profileSuccess = await queueUpload({
  //         uri: formData.profilePicture,
  //         userId: currentUserId,
  //         type: "profile",
  //         name: "profile.jpeg",
  //       });
  //
  //       if (!profileSuccess) {
  //         console.warn("Failed to queue profile picture upload");
  //       }
  //     }
  //
  //     const updatedUser = await getUpdatedUser(currentUserId);
  //     dispatch(setUserFirestoreData(updatedUser));
  //     console.log("profile updated successfully");
  //     router.replace("/(bottomTabs)/Home");
  //   } catch (error) {
  //     console.log("error", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
        </View>,
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

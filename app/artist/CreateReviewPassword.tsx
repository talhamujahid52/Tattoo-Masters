import React, { useState, useContext, useMemo } from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Text from "@/components/Text";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { router } from "expo-router";
import { FormContext } from "../../context/FormContext";
import useBackgroundUpload from "@/hooks/useBackgroundUpload";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile } from "@/utils/firebase/userFunctions";
import { UserProfileFormData } from "@/types/user";
import { UserFirestore } from "@/types/user";
import { changeProfilePicture } from "@/utils/firebase/changeProfilePicture";
import { getUpdatedUser } from "@/utils/firebase/userFunctions";
import { setUserFirestoreData } from "@/redux/slices/userSlice";
import { getFileName } from "@/utils/helperFunctions";

const CreateReviewPassword = () => {
  const [reviewPassword, setReviewPassword] = useState<string>("");
  const [confirmReviewPassword, setConfirmReviewPassword] =
    useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const loggedInUser = useSelector((state: any) => state?.user?.user);
  const loggedInUserFirestore: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore
  );
  const currentUserId = loggedInUser?.uid;
  const { queueUpload } = useBackgroundUpload();
  const dispatch = useDispatch();
  const { formData, setFormData } = useContext(FormContext)!;

  const handleCreateAccount = () => {
    // Final validation before account creation
    const hasProfilePicture =
      !!formData?.profilePicture ||
      !!loggedInUserFirestore?.profilePictureSmall ||
      !!loggedInUserFirestore?.profilePicture ||
      !!loggedInUser?.photoURL;
    if (!hasProfilePicture) {
      setError("Please add a profile picture.");
      return;
    }
    const firstFour = formData?.images?.slice(0, 4) || [];
    const allFourPresent = firstFour.every((img) => img && !!img.uri);
    if (!allFourPresent) {
      setError("Please upload 4 tattoos to continue.");
      return;
    }
    if (!reviewPassword || !confirmReviewPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (reviewPassword !== confirmReviewPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    submitForm();
    // Proceed with account creation logic here
    console.log("Account created with password:", reviewPassword);
  };

  const submitForm = async () => {
    try {
      setFormData((prev) => ({ ...prev, reviewPassword }));
      setLoading(true);
      // Ensure we pass exactly the first 4 tattoo images (as required by step 2)
      const firstFour = (formData?.images || []).slice(0, 4);
      const imgs = firstFour.filter((img: any) => img && img.uri);
      const updatedFormData = {
        ...formData,
        reviewPassword,
        tattooStyles: formData.tattooStyles.map((style) => style.title),
      };

      // Check if images are already queued/uploaded to prevent duplicates
      // Always attempt to queue all four; queue layer will dedupe if truly identical
      const imagesToUpload = imgs;

      if (imagesToUpload.length > 0) {
        console.log(
          `Queueing ${imagesToUpload.length} images (first 4) for background upload`
        );
        const failures: string[] = [];
        let passed = 0;
        for (let i = 0; i < imagesToUpload.length; i++) {
          const img: any = imagesToUpload[i];
          const baseName = img?.name || getFileName(img.uri) || "image.jpg";
          const matchExt = baseName.match(/(\.[^.]+)$/);
          const ext = matchExt ? matchExt[1] : "";
          const stem = ext ? baseName.slice(0, -ext.length) : baseName;
          const name = `${stem}_slot${i + 1}${ext}`;
          console.log(`Queueing image ${i + 1}/4`, { uri: img.uri, name });
          const ok = await queueUpload({
            uri: img.uri,
            userId: currentUserId,
            type: "publication",
            caption: img.caption,
            styles: img.styles,
            name,
          });
          if (!ok) {
            failures.push(name || img.uri);
          } else {
            passed++;
          }
        }
        console.log(`Queued images successfully: ${passed}/4`);
        if (failures.length) {
          console.warn("Some images failed to queue:", failures);
          // Surface a gentle warning; uploads for the rest will continue
        }
      }

      await updateUserProfile(currentUserId, {
        ...updatedFormData,
        isArtist: true, //make the user an artist
        artistRegistrationDate: new Date().toISOString(),
      } as UserProfileFormData);

      // update the user profile picture as well if it has been changed
      if (
        formData?.profilePicture &&
        !formData.profilePicture.startsWith("http")
      ) {
        const profileSuccess = await queueUpload({
          uri: formData.profilePicture,
          userId: currentUserId,
          type: "profile",
          name: getFileName(formData.profilePicture),
        });

        if (!profileSuccess) {
          console.warn("Failed to queue profile picture upload");
        }
      }

      const updatedUser = await getUpdatedUser(currentUserId);
      dispatch(setUserFirestoreData(updatedUser));
      console.log("profile updated successfully");
      router.push("/artist/SubscriptionInfo");
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  const profileImage = useMemo(() => {
    return {
      uri:
        formData?.profilePicture ??
        loggedInUserFirestore?.profilePictureSmall ??
        loggedInUserFirestore?.profilePicture ??
        loggedInUser?.photoURL ??
        undefined,
    };
  }, [loggedInUser, loggedInUserFirestore, formData]);

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <View
        style={{
          width: 115,
          height: 109,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Image
          style={{
            height: 115,
            width: 109,
            resizeMode: "contain",
          }}
          source={require("../../assets/images/reviewPasswordImage.png")}
        />
        <Image
          style={[
            styles.headerImage,
            {
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: [{ translateX: -34 }, { translateY: -34 }],
            },
          ]}
          source={profileImage}
        />
      </View>

      <Text
        weight="medium"
        size="profileName"
        color="#FBF6FA"
        style={{ marginVertical: 16 }}
      >
        Last step
      </Text>
      <Text color="#A7A7A7" style={styles.descriptionText}>
        In order to get reviewed on Tattoo Masters{"\n"} your clients must enter
        a review password.
      </Text>
      <Text color="#A7A7A7" style={styles.descriptionText}>
        Come up with a creative password{"\n"}which you can share with them!
      </Text>

      <View style={styles.infoBox}>
        <Image
          source={require("../../assets/images/error-2.png")}
          style={styles.warningIcon}
          resizeMode="contain"
        />
        <View>
          <Text size="medium" color="#A7A7A7">
            This password will be used by your customers.
          </Text>
          <Text size="medium" color="#A7A7A7">
            Please do not use any personal password{"\n"}for this purpose.
          </Text>
        </View>
      </View>

      <View style={styles.inputSection}>
        {error !== "" && (
          <Text color="red" style={styles.errorText}>
            {error}
          </Text>
        )}
        <Input
          inputMode="password"
          placeholder="Create review password"
          value={reviewPassword}
          onChangeText={setReviewPassword}
        />
        <Input
          inputMode="password"
          placeholder="Confirm review password"
          value={confirmReviewPassword}
          onChangeText={setConfirmReviewPassword}
        />
        <Button
          loading={loading}
          title="Create account"
          onPress={() => {
            handleCreateAccount();
          }}
        />
        <Pressable
          onPress={() => {
            router.back();
          }}
          style={styles.button}
        >
          <Text size="h4" weight="normal" color="#FBF6FA">
            Back
          </Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default CreateReviewPassword;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    flexGrow: 1,
    backgroundColor: "#000", // optional: assuming dark background
  },
  headerImage: {
    height: 68,
    width: 68,
    resizeMode: "cover",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#333333",
  },
  descriptionText: {
    marginBottom: 16,
    textAlign: "center",
  },
  infoBox: {
    borderWidth: 2,
    borderColor: "#20201E",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  warningIcon: {
    height: 24,
    width: 24,
    marginRight: 16,
  },
  inputSection: {
    width: "100%",
    rowGap: 10,
    marginTop: "auto",
    marginBottom: 40,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 8,
  },
  button: {
    height: 48,
    width: "100%",
    borderRadius: 30,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
});

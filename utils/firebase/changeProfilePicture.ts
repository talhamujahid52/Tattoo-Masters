import storage, { ref } from "@react-native-firebase/storage";
import firestore from "@react-native-firebase/firestore";
import { resizedName, keepTrying } from "./useFirebaseImage";

interface ProfilePictureUrls {
  downloadUrlSmall: string;
  downloadUrlMedium: string;
  downloadUrlHigh: string;
  downloadUrlVeryHigh: string;
}

/**
 * Uploads a new custom profile picture.
 *
 * This function:
 * - Deletes previously stored resized images (if any) using stored delete URLs.
 * - Uploads the original image (which triggers resizing).
 * - Uses a retry mechanism (keepTrying) to fetch the download URLs for resized images.
 * - Updates the user's Firestore document with the resized images' download URLs and their corresponding deletion paths.
 *
 * Note: The original image is not retained (and is auto-deleted) after the resizing process.
 *
 * @param uid - The user's unique ID.
 * @param imageUri - The local URI of the image to upload.
 * @param fileName - The name of the file (e.g., "profile.jpeg").
 * @returns An object containing the download URLs for each resized image.
 */
export const changeProfilePicture = async (
  uid: string,
  imageUri: string,
  fileName: string,
): Promise<ProfilePictureUrls> => {
  try {
    // Reference to the user's document in Firestore.
    const userDocRef = firestore().collection("Users").doc(uid);
    const userDoc = await userDocRef.get();
    // Delete previously stored resized images (if any).

    if (userDoc.exists) {
      console.log("user exists...");
      const userData = userDoc.data();
      if (userData?.profilePictureDeleteUrls) {
        console.log("user has profile picture already uploaded...");
        const deleteUrls = userData.profilePictureDeleteUrls;
        for (const key in deleteUrls) {
          if (deleteUrls.hasOwnProperty(key) && deleteUrls[key]) {
            try {
              await storage().ref(deleteUrls[key]).delete();
              console.log(
                `Previous profile picture (${key}) deleted successfully.`,
              );
            } catch (error) {
              console.warn(
                `Error deleting previous profile picture (${key}):`,
                error,
              );
            }
          }
        }
      } else {
        console.log("user is uploading for the first time...");
      }
    }

    // Create a unique file path for the new original image upload.
    const timestamp = Date.now();
    const newFilePath = `profilePictures/${uid}/${timestamp}_${fileName}`;
    console.log("newFilePath", newFilePath);

    // Upload the original image (which triggers the resizing process).
    const reference = storage().ref(newFilePath);
    await reference.putFile(imageUri);
    console.log("Original profile picture uploaded at:", newFilePath);

    // Generate storage paths for the resized images.
    const smallImagePath = newFilePath.replace(
      fileName,
      resizedName(fileName, "400x400"),
    );
    const mediumImagePath = newFilePath.replace(
      fileName,
      resizedName(fileName, "720x1280"),
    );
    const highImagePath = newFilePath.replace(
      fileName,
      resizedName(fileName, "1080x1920"),
    );
    const veryHighImagePath = newFilePath.replace(
      fileName,
      resizedName(fileName, "1440x2560"),
    );

    // Retrieve the download URLs for each resized version using the retry mechanism.
    const downloadUrlSmall = await keepTrying(smallImagePath);
    const downloadUrlMedium = await keepTrying(mediumImagePath);
    const downloadUrlHigh = await keepTrying(highImagePath);
    const downloadUrlVeryHigh = await keepTrying(veryHighImagePath);
    console.log("downloadUrlSmall", downloadUrlSmall);
    console.log("downloadUrlMedium", downloadUrlMedium);
    console.log("downloadUrlHigh", downloadUrlHigh);
    console.log("downloadUrlVeryHigh", downloadUrlVeryHigh);

    // Update the user's Firestore document with the resized images' download URLs and deletion paths.
    await userDocRef.set(
      {
        profilePictureSmall: downloadUrlSmall,
        profilePictureMedium: downloadUrlMedium,
        profilePictureHigh: downloadUrlHigh,
        profilePictureVeryHigh: downloadUrlVeryHigh,
        profilePictureDeleteUrls: {
          small: smallImagePath,
          medium: mediumImagePath,
          high: highImagePath,
          veryHigh: veryHighImagePath,
        },
      },
      { merge: true },
    );

    console.log("User document updated with new profile picture data.");
    return {
      downloadUrlSmall,
      downloadUrlMedium,
      downloadUrlHigh,
      downloadUrlVeryHigh,
    };
  } catch (error) {
    console.error("Error uploading custom profile picture:", error);
    throw error;
  }
};

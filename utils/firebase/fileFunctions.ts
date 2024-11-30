import storage from "@react-native-firebase/storage";
/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param file The file object to upload.
 * @param folder The folder path in Firebase Storage.
 * @returns A promise that resolves to the download URL.
 */
export const uploadFileToFirebase = async (
  file: { uri: string; fileName?: string },
  folder: string,
): Promise<string> => {
  try {
    const fileName = `${folder}/${Date.now()}_${file.fileName || "image.jpg"}`;
    const storageRef = storage().ref(fileName);

    // Convert file URI to a Blob for upload
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // Upload the Blob to Firebase Storage
    await storageRef.put(blob);

    // Get the file's download URL
    const downloadURL = await storageRef.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file to Firebase:", error);
    throw new Error("Failed to upload file.");
  }
};

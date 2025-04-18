import storage from "@react-native-firebase/storage";
import { resizedName, keepTrying } from "./useFirebaseImage";

interface ReviewImageUrls {
  downloadUrlSmall: string;
  downloadUrlLarge?: string;
  deletePaths: {
    small: string;
    large: string;
  };
}

export const uploadReviewImage = async (
  imageUri: string,
  currentUserId: string,
  fileName: string,
): Promise<ReviewImageUrls> => {
  try {
    const timestamp = Date.now();
    const basePath = `reviewImages/${currentUserId}_${timestamp}/${fileName}`;
    const reference = storage().ref(basePath);

    await reference.putFile(imageUri, {
      contentType: 'image/jpeg',
      cacheControl: 'public,max-age=31536000',
    });
    
    console.log("Original review image uploaded at:", basePath);

    const smallImagePath = basePath.replace(
      fileName,
      resizedName(fileName, "400x400"),
    );
    
    const largeImagePath = basePath.replace(
      fileName,
      resizedName(fileName, "1080x1920"),
    );

    const downloadUrlSmall = await keepTrying(smallImagePath);

    let downloadUrlLarge: string | undefined;
    try {
      downloadUrlLarge = await storage().ref(largeImagePath).getDownloadURL();
    } catch (error) {
      console.log("Large image not ready yet, continuing without it");
    }

    return {
      downloadUrlSmall,
      downloadUrlLarge,
      deletePaths: {
        small: smallImagePath,
        large: largeImagePath,
      },
    };
  } catch (error) {
    console.error("Error uploading review image:", error);
    throw error;
  }
};
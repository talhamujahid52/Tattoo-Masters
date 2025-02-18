import { useState, useEffect } from "react";
import storage from "@react-native-firebase/storage";
import firestore from "@react-native-firebase/firestore";

// Interface for the hook's input parameters
interface UseFirebaseImageProps {
  uniqueFilePrefix: string;
}

// Interface representing an individual image
interface FirebaseImage {
  downloadUrlSmall: string;
  deleteUrlSmall: string;
  downloadUrlMedium: string;
  deleteUrlMedium: string;
  downloadUrlHigh: string;
  deleteUrlHigh: string;
  downloadUrlVeryHigh: string;
  deleteUrlVeryHigh: string;
}

// Interface for the image items passed to uploadImages
interface ImageItem {
  uri: string;
  name: string;
}

// Interface for the hook's return values
interface UseFirebaseImageReturn {
  uploadImages: (arrayImages: ImageItem[]) => Promise<void>;
  // deleteImage: (deleteUrl: string) => Promise<void>;
  firebaseImages: FirebaseImage[];
  // updateFirebaseImages: (updatedImages: FirebaseImage[]) => Promise<void>;
}

// Function to resize image names
export const resizedName = (fileName: string, dimensions: string): string => {
  const extIndex = fileName.lastIndexOf(".");
  const ext = ".jpeg";
  return `${fileName.substring(0, extIndex)}_${dimensions}${ext}`;
};

// Delay function (for retry mechanism)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Recursive function to keep trying to get download URL
export const keepTrying = async (
  storagePath: string,
  triesRemaining = 4,
): Promise<string> => {
  if (triesRemaining <= 0) {
    throw new Error(
      `Failed to get download URL for ${storagePath} after multiple attempts`,
    );
  }

  try {
    const url = await storage().ref(storagePath).getDownloadURL();
    return url;
  } catch (error: any) {
    if (error.code === "storage/object-not-found") {
      console.log(
        `Retrying to fetch URL for ${storagePath} (${triesRemaining} tries left)...`,
      );
      await delay(4000);
      return keepTrying(storagePath, triesRemaining - 1);
    } else {
      throw error;
    }
  }
};

const useFirebaseImage = ({
  uniqueFilePrefix,
}: UseFirebaseImageProps): UseFirebaseImageReturn => {
  const [firebaseImages, setFirebaseImages] = useState<FirebaseImage[]>([]);

  // Function to upload images
  const uploadImages = async (arrayImages: ImageItem[]): Promise<void> => {
    const dateConst = Date.now().toString();
    console.log("arrayImages", arrayImages);
    try {
      const uploadPromises = arrayImages.map(async (item) => {
        const filePath = `publications/${uniqueFilePrefix}${dateConst}/${item.name}`;
        console.log("filePath", filePath);
        const reference = storage().ref(filePath);
        console.log("file.uri", item.uri);
        // Upload file directly using putFile
        //
        await reference.putFile(item.uri);

        // Generate different resolution image paths
        const smallImagePath = filePath.replace(
          item.name,
          resizedName(item.name, "400x400"),
        );
        const mediumImagePath = filePath.replace(
          item.name,
          resizedName(item.name, "720x1280"),
        );
        const highImagePath = filePath.replace(
          item.name,
          resizedName(item.name, "1080x1920"),
        );
        const veryHighImagePath = filePath.replace(
          item.name,
          resizedName(item.name, "1440x2560"),
        );

        // Keep trying to get URLs for different sizes
        const downloadUrlSmall = await keepTrying(smallImagePath);
        const downloadUrlMedium = await keepTrying(mediumImagePath);
        const downloadUrlHigh = await keepTrying(highImagePath);
        const downloadUrlVeryHigh = await keepTrying(veryHighImagePath);

        const newImageEntry = {
          userId: uniqueFilePrefix, // Store the user's unique ID
          timestamp: firestore.FieldValue.serverTimestamp(), // Add timestamp
          downloadUrls: {
            small: downloadUrlSmall,
            medium: downloadUrlMedium,
            high: downloadUrlHigh,
            veryHigh: downloadUrlVeryHigh,
          },
          deleteUrls: {
            small: smallImagePath,
            medium: mediumImagePath,
            high: highImagePath,
            veryHigh: veryHighImagePath,
          },
        };

        // Store each image as a separate document in Firestore under `/publications`
        await firestore().collection("publications").add(newImageEntry);

        return newImageEntry;
      });

      await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  // Function to update images in Firestore
  // const updateFirebaseImages = async (
  //   updatedImages: FirebaseImage[],
  // ): Promise<void> => {
  //   try {
  //     await firestore()
  //       .collection("publications")
  //       .doc(publicationId)
  //       .set({ images: updatedImages }, { merge: true });
  //     setFirebaseImages(updatedImages);
  //   } catch (error) {
  //     console.error("Error updating images in Firestore:", error);
  //   }
  // };

  // Function to delete an image
  // const deleteImage = async (deleteUrl: string): Promise<void> => {
  //   try {
  //     await storage().ref(deleteUrl).delete();
  //     const updatedImages = firebaseImages.filter(
  //       (image) => !Object.values(image).includes(deleteUrl),
  //     );
  //     await updateFirebaseImages(updatedImages);
  //   } catch (error) {
  //     console.error("Error deleting image:", error);
  //   }
  // };

  // Effect to listen to Firestore changes
  // useEffect(() => {
  //   if (!publicationId) return;
  //
  //   const unsubscribe = firestore()
  //     .collection("publications")
  //     .doc(publicationId)
  //     .onSnapshot((docSnap) => {
  //       if (docSnap.exists) {
  //         const data = docSnap.data();
  //         setFirebaseImages((data?.images as FirebaseImage[]) || []);
  //       } else {
  //         setFirebaseImages([]);
  //       }
  //     });
  //
  //   return () => unsubscribe();
  // }, [publicationId]);

  return {
    uploadImages,
    // deleteImage,
    firebaseImages,
    // updateFirebaseImages,
  };
};

export default useFirebaseImage;

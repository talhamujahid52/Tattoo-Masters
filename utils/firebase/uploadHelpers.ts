import storage from "@react-native-firebase/storage";

/**
 * Generates a resized image name based on original filename and size
 * @param originalName - Original image filename
 * @param size - Size string (e.g., "400x400")
 * @returns Resized filename with .jpeg extension (Firebase always compresses to JPEG)
 */
export const resizedName = (originalName: string, size: string): string => {
  const lastDotIndex = originalName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return `${originalName}_${size}.jpeg`;
  }
  const nameWithoutExtension = originalName.substring(0, lastDotIndex);
  // Always use .jpeg for resized images since Firebase compresses to JPEG format
  return `${nameWithoutExtension}_${size}.jpeg`;
};

/**
 * Keeps trying to get a download URL for a Firebase Storage path
 * Useful for getting URLs of resized images that may take time to process
 * @param imagePath - Firebase Storage path
 * @param maxAttempts - Maximum number of attempts (default: 10)
 * @param delay - Delay between attempts in ms (default: 2000)
 * @returns Download URL
 */
export const keepTrying = async (
  imagePath: string,
  maxAttempts: number = 10,
  delay: number = 5000,
): Promise<string> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const downloadURL = await storage().ref(imagePath).getDownloadURL();
      // console.log(
      //   `Successfully got URL for ${imagePath} on attempt ${attempt}`
      // );
      return downloadURL;
    } catch (error) {
      // console.log(
      //   `Attempt ${attempt}/${maxAttempts} failed for ${imagePath}:`,
      //   error,
      // );

      if (attempt === maxAttempts) {
        throw new Error(
          `Failed to get download URL for ${imagePath} after ${maxAttempts} attempts`,
        );
      }

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  throw new Error(`Unexpected error in keepTrying for ${imagePath}`);
};

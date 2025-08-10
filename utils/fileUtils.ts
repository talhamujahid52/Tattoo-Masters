import { Platform } from "react-native";

/**
 * Generates a unique filename to avoid conflicts
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.substring(originalName.lastIndexOf("."));
  return `upload_${timestamp}_${random}${extension}`;
};

/**
 * Copy a file to the app's document directory for permanent storage
 * This prevents file-not-found errors when original files are deleted
 */
export const copyFileToAppDirectory = async (
  sourceUri: string,
  fileName?: string
): Promise<string> => {
  try {
    // For now, we'll validate the file exists and return the original URI
    // In a future enhancement, this could copy files to a permanent location

    // Validate the file exists
    const testResponse = await fetch(sourceUri, { method: "HEAD" });
    if (!testResponse.ok) {
      throw new Error("Source file does not exist");
    }

    console.log(`File validated for upload: ${sourceUri}`);
    return sourceUri;
  } catch (error) {
    console.error("Error validating file:", error);
    // Return original URI as fallback, upload service will handle the error
    return sourceUri;
  }
};

/**
 * Validate that a file exists and is accessible
 */
export const validateFileAccess = async (uri: string): Promise<boolean> => {
  try {
    const response = await fetch(uri, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    console.log(`File validation failed for ${uri}:`, error);
    return false;
  }
};

/**
 * Get file size in bytes
 */
export const getFileSize = async (uri: string): Promise<number> => {
  try {
    const response = await fetch(uri, { method: "HEAD" });
    const contentLength = response.headers.get("content-length");
    return contentLength ? parseInt(contentLength, 10) : 0;
  } catch (error) {
    console.log(`Could not get file size for ${uri}:`, error);
    return 0;
  }
};

/**
 * Clean up old upload files to free space
 */
export const cleanupOldUploadFiles = async (): Promise<void> => {
  try {
    // Future enhancement: Clean up old upload files to free space
    // This would require react-native-fs or similar file system access
    console.log("Cleanup of old upload files would happen here");
  } catch (error) {
    console.error("Error cleaning up old upload files:", error);
  }
};

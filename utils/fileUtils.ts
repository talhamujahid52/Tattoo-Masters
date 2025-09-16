import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

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
    const targetName = fileName || generateUniqueFileName(".jpg");
    const targetPath = `${FileSystem.documentDirectory || ""}${targetName}`;

    // Try a real copy for file:// and content:// (best-effort)
    try {
      await FileSystem.copyAsync({ from: sourceUri, to: targetPath });
      return targetPath;
    } catch (e) {
      // If copy fails (e.g., ph:// on iOS), fall back to original URI
      // We'll still attempt upload from the original URI
      console.log("copyAsync failed; falling back to original URI", e);
    }

    // Validate the file exists via HEAD where possible; otherwise trust OS URIs
    if (sourceUri.startsWith("http://") || sourceUri.startsWith("https://")) {
      const testResponse = await fetch(sourceUri, { method: "HEAD" });
      if (!testResponse.ok) throw new Error("Source file does not exist");
    }

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
    // Trust common local URI schemes which may not support HEAD
    if (
      uri.startsWith("file://") ||
      uri.startsWith("content://") ||
      uri.startsWith("ph://") ||
      uri.startsWith("assets-library://")
    ) {
      // Try FileSystem existence check where available
      try {
        if (uri.startsWith("file://")) {
          const info = await FileSystem.getInfoAsync(uri);
          return !!info.exists;
        }
      } catch {}
      return true;
    }

    // Fallback for http(s)
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

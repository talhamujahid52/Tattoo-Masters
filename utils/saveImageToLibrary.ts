import { Alert, Linking } from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Image as ExpoImage } from "expo-image";
import { showToast } from "@/components/Toast";

// Only show "Saving…" if saving takes longer than this
const SAVING_TOAST_DELAY_MS = 250;

const SAVEABLE_EXTENSIONS = ["jpg", "jpeg", "png", "heic", "webp", "gif"];

// Firebase Storage URLs keep the file name URL-encoded in the path,
// e.g. .../o/publications%2Fabc%2Fimage.png?alt=media
const getExtension = (uri: string) => {
  const path = decodeURIComponent(uri.split("?")[0]);
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return SAVEABLE_EXTENSIONS.includes(ext) ? ext : "jpg";
};

/**
 * Saves an image (remote URL or local file) to the device's photo library.
 * Only asks for permission to add photos, never to read them.
 */
export const saveImageToLibrary = async (uri: string): Promise<boolean> => {
  if (!uri) return false;

  const { granted, canAskAgain } =
    await MediaLibrary.requestPermissionsAsync(true);
  if (!granted) {
    Alert.alert(
      "Permission needed",
      "Allow Tattoo Masters to add photos to your library to save images.",
      canAskAgain
        ? [{ text: "OK" }]
        : [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ],
    );
    return false;
  }

  const isRemote = /^https?:\/\//i.test(uri);
  const tempUri = `${FileSystem.cacheDirectory}tattoo-masters-${Date.now()}.${getExtension(uri)}`;

  const savingTimer = setTimeout(
    () => showToast("Saving…", "loading"),
    SAVING_TOAST_DELAY_MS,
  );

  try {
    let localUri = uri;
    if (isRemote) {
      // The image is usually already on screen, so expo-image has it on
      // disk. Copy that instead of downloading the full-size file again.
      // The copy gets a real extension, which the photo library needs.
      const cachedPath = await ExpoImage.getCachePathAsync(uri).catch(
        () => null,
      );
      if (cachedPath) {
        const from = cachedPath.startsWith("file://")
          ? cachedPath
          : `file://${cachedPath}`;
        await FileSystem.copyAsync({ from, to: tempUri });
      } else {
        const result = await FileSystem.downloadAsync(uri, tempUri);
        if (result.status !== 200) {
          throw new Error(`Download failed with status ${result.status}`);
        }
      }
      localUri = tempUri;
    }
    await MediaLibrary.saveToLibraryAsync(localUri);
    clearTimeout(savingTimer);
    showToast("Saved");
    return true;
  } catch (error) {
    console.error("Error saving image:", error);
    clearTimeout(savingTimer);
    showToast("Couldn't save", "error");
    return false;
  } finally {
    if (isRemote) {
      FileSystem.deleteAsync(tempUri, { idempotent: true }).catch(() => {});
    }
  }
};

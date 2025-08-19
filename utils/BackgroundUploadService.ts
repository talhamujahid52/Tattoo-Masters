import { store } from "@/redux/store";
import {
  updateUploadStatus,
  updateFirebaseData,
  setProcessing,
  cleanupOldUploads,
  UploadItem,
} from "@/redux/slices/uploadQueueSlice";
import storage from "@react-native-firebase/storage";
import firestore from "@react-native-firebase/firestore";
import { AppState, AppStateStatus } from "react-native";
import { resizedName, keepTrying } from "./firebase/uploadHelpers";

class BackgroundUploadService {
  private isRunning = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;

  constructor() {
    this.setupAppStateListener();
    this.start();
  }

  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener(
      "change",
      this.handleAppStateChange,
    );
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    // Continue processing uploads even when app goes to background
    if (nextAppState === "background" || nextAppState === "inactive") {
      console.log("App went to background, continuing uploads...");
      // We keep the service running in background for a limited time
    } else if (nextAppState === "active") {
      console.log("App became active, ensuring upload service is running...");
      this.start();
    }
  };

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log("Background upload service started");

    // Clean up old uploads on start
    store.dispatch(cleanupOldUploads());

    // Process queue immediately
    this.processQueue();

    // Set up interval to process queue every 5 seconds
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 5000);
  }

  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    console.log("Background upload service stopped");

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    store.dispatch(setProcessing(false));
  }

  destroy() {
    this.stop();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }

  private async processQueue() {
    const state = store.getState();
    const { queue, isProcessing } = state.uploadQueue;

    // Don't start new processing if already processing
    if (isProcessing) {
      // console.log("Already processing uploads, skipping...");
      return;
    }

    // Find pending uploads
    const pendingUploads = queue.filter((item) => item.status === "pending");

    if (pendingUploads.length === 0) {
      return;
    }

    // console.log(
    //   `Found ${pendingUploads.length} pending uploads out of ${queue.length} total`,
    // );
    //
    // console.log(`Processing ${pendingUploads.length} pending uploads...`);
    store.dispatch(setProcessing(true));

    // Process uploads one by one to avoid overwhelming Firebase
    for (const uploadItem of pendingUploads) {
      try {
        await this.processUploadItem(uploadItem);
        // console.log(`Successfully processed upload: ${uploadItem.id}`);
      } catch (error) {
        console.error(`Error processing upload ${uploadItem.id}:`, error);

        let errorMessage = "Unknown error";
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        // Special handling for file not found errors
        if (
          errorMessage.includes("File no longer exists") ||
          errorMessage.includes("File not found")
        ) {
          console.log(`Removing missing file from queue: ${uploadItem.id}`);
          // Mark as failed with clear message, don't retry missing files
          store.dispatch(
            updateUploadStatus({
              id: uploadItem.id,
              status: "failed",
              error: `File missing: ${uploadItem.name} was deleted or moved`,
            }),
          );
        } else {
          // Other errors can be retried
          store.dispatch(
            updateUploadStatus({
              id: uploadItem.id,
              status: "failed",
              error: errorMessage,
            }),
          );
        }
      }
    }

    store.dispatch(setProcessing(false));
  }

  private async checkFileExists(uri: string): Promise<boolean> {
    try {
      const response = await fetch(uri, { method: "HEAD" });
      return response.ok;
    } catch (error) {
      console.log(`File existence check failed for ${uri}:`, error);
      return false;
    }
  }

  private async processUploadItem(item: UploadItem): Promise<void> {
    console.log(`Starting upload for ${item.id}...`);

    // Check if file still exists before attempting upload
    const fileExists = await this.checkFileExists(item.uri);
    if (!fileExists) {
      throw new Error(
        `File no longer exists: ${item.uri}. The file may have been deleted or moved.`,
      );
    }

    store.dispatch(
      updateUploadStatus({
        id: item.id,
        status: "uploading",
        progress: 0,
      }),
    );

    try {
      switch (item.type) {
        case "publication":
          await this.uploadPublication(item);
          break;
        case "publication_edit":
          await this.uploadPublicationEdit(item);
          break;
        case "review":
          await this.uploadReview(item);
          break;
        case "feedback":
          await this.uploadFeedback(item);
          break;
        case "profile":
          await this.uploadProfile(item);
          break;
        default:
          throw new Error(`Unknown upload type: ${item.type}`);
      }
    } catch (error) {
      // Handle specific Firebase storage errors
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "storage/file-not-found") {
          throw new Error(
            `File not found: ${item.name}. The file may have been deleted from your device.`,
          );
        }
        if (error.code === "storage/unauthorized") {
          throw new Error(
            `Upload failed: Unauthorized access. Please check your permissions.`,
          );
        }
        if (error.code === "storage/network-error") {
          throw new Error(
            `Upload failed: Network error. Please check your internet connection.`,
          );
        }
      }
      throw error;
    }
  }

  private async uploadPublicationEdit(item: UploadItem): Promise<void> {
    if (!item.docId) {
      throw new Error("Missing document ID for publication edit");
    }

    const dateConst = Date.now().toString();
    const filePath = `publications/${item.userId}${dateConst}/${item.name}`;

    const reference = storage().ref(filePath);

    const uploadTask = reference.putFile(item.uri);
    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
      store.dispatch(
        updateUploadStatus({
          id: item.id,
          status: "uploading",
          progress: Math.round(progress),
        }),
      );
    });
    await uploadTask;

    store.dispatch(
      updateUploadStatus({ id: item.id, status: "uploading", progress: 60 }),
    );

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

    const downloadUrlSmall = await keepTrying(smallImagePath);
    store.dispatch(
      updateUploadStatus({ id: item.id, status: "uploading", progress: 70 }),
    );
    const downloadUrlMedium = await keepTrying(mediumImagePath);
    store.dispatch(
      updateUploadStatus({ id: item.id, status: "uploading", progress: 80 }),
    );
    const downloadUrlHigh = await keepTrying(highImagePath);
    store.dispatch(
      updateUploadStatus({ id: item.id, status: "uploading", progress: 85 }),
    );
    const downloadUrlVeryHigh = await keepTrying(veryHighImagePath);
    store.dispatch(
      updateUploadStatus({ id: item.id, status: "uploading", progress: 90 }),
    );

    await firestore()
      .collection("publications")
      .doc(item.docId)
      .set(
        {
          caption: item.caption ?? "",
          styles: item.styles ?? [],
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
        },
        { merge: true },
      );

    const old = item.oldDeleteUrls || {};
    const oldPaths = [old.small, old.medium, old.high, old.veryHigh].filter(
      Boolean,
    ) as string[];
    await Promise.all(
      oldPaths.map(async (p) => {
        try {
          await storage().ref(p).delete();
        } catch (e) {
          // ignore
        }
      }),
    );

    const firebaseImageData = {
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
    store.dispatch(updateFirebaseData({ id: item.id, firebaseImageData }));

    store.dispatch(
      updateUploadStatus({
        id: item.id,
        status: "completed",
        progress: 100,
      }),
    );
  }

  private async uploadPublication(item: UploadItem): Promise<void> {
    const dateConst = Date.now().toString();
    const filePath = `publications/${item.userId}${dateConst}/${item.name}`;

    console.log(`Uploading publication to: ${filePath}`);

    const reference = storage().ref(filePath);

    // Upload with progress tracking
    const uploadTask = reference.putFile(item.uri);

    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 50; // 50% for upload
      store.dispatch(
        updateUploadStatus({
          id: item.id,
          status: "uploading",
          progress: Math.round(progress),
        }),
      );
    });

    await uploadTask;

    // Update progress to 60% after upload
    store.dispatch(
      updateUploadStatus({
        id: item.id,
        status: "uploading",
        progress: 60,
      }),
    );

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

    // Get download URLs for different sizes
    const downloadUrlSmall = await keepTrying(smallImagePath);
    store.dispatch(
      updateUploadStatus({ id: item.id, status: "uploading", progress: 70 }),
    );

    const downloadUrlMedium = await keepTrying(mediumImagePath);
    store.dispatch(
      updateUploadStatus({ id: item.id, status: "uploading", progress: 80 }),
    );

    const downloadUrlHigh = await keepTrying(highImagePath);
    store.dispatch(
      updateUploadStatus({ id: item.id, status: "uploading", progress: 85 }),
    );

    const downloadUrlVeryHigh = await keepTrying(veryHighImagePath);
    store.dispatch(
      updateUploadStatus({ id: item.id, status: "uploading", progress: 90 }),
    );

    const firebaseImageData = {
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

    // Store in Firestore
    const newImageEntry = {
      userId: item.userId,
      timestamp: firestore.FieldValue.serverTimestamp(),
      caption: item.caption ?? "",
      styles: item.styles ?? [],
      downloadUrls: firebaseImageData.downloadUrls,
      deleteUrls: firebaseImageData.deleteUrls,
    };

    await firestore().collection("publications").add(newImageEntry);

    // Update Redux with Firebase data
    store.dispatch(updateFirebaseData({ id: item.id, firebaseImageData }));

    store.dispatch(
      updateUploadStatus({
        id: item.id,
        status: "completed",
        progress: 100,
      }),
    );

    console.log(`Publication upload completed: ${item.id}`);
  }

  private async uploadReview(item: UploadItem): Promise<void> {
    const timestamp = Date.now();
    const basePath = `reviewImages/${item.userId}_${timestamp}/${item.name}`;
    const reference = storage().ref(basePath);

    // Upload with progress tracking
    const uploadTask = reference.putFile(item.uri, {
      contentType: "image/jpeg",
      cacheControl: "public,max-age=31536000",
    });

    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 70; // 70% for upload
      store.dispatch(
        updateUploadStatus({
          id: item.id,
          status: "uploading",
          progress: Math.round(progress),
        }),
      );
    });

    await uploadTask;

    console.log("Review image uploaded at:", basePath);

    const smallImagePath = basePath.replace(
      item.name,
      resizedName(item.name, "400x400"),
    );
    const largeImagePath = basePath.replace(
      item.name,
      resizedName(item.name, "1080x1920"),
    );

    const downloadUrlSmall = await keepTrying(smallImagePath);
    store.dispatch(
      updateUploadStatus({ id: item.id, status: "uploading", progress: 85 }),
    );

    let downloadUrlLarge: string | undefined;
    try {
      downloadUrlLarge = await storage().ref(largeImagePath).getDownloadURL();
    } catch (error) {
      console.log("Large image not ready yet, continuing without it");
    }

    const firebaseImageData = {
      downloadUrls: {
        small: downloadUrlSmall,
        medium: downloadUrlLarge || downloadUrlSmall,
        high: downloadUrlLarge || downloadUrlSmall,
        veryHigh: downloadUrlLarge || downloadUrlSmall,
      },
      deleteUrls: {
        small: smallImagePath,
        medium: largeImagePath,
        high: largeImagePath,
        veryHigh: largeImagePath,
      },
    };

    store.dispatch(updateFirebaseData({ id: item.id, firebaseImageData }));

    store.dispatch(
      updateUploadStatus({
        id: item.id,
        status: "completed",
        progress: 100,
      }),
    );

    console.log(`Review upload completed: ${item.id}`);
  }

  private async uploadFeedback(item: UploadItem): Promise<void> {
    const timestamp = Date.now();
    const basePath = `feedbackImages/${item.userId}_${timestamp}/${item.name}`;
    const reference = storage().ref(basePath);

    // Upload with progress tracking
    const uploadTask = reference.putFile(item.uri, {
      contentType: "image/jpeg",
      cacheControl: "public,max-age=31536000",
    });

    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 70; // 70% for upload
      store.dispatch(
        updateUploadStatus({
          id: item.id,
          status: "uploading",
          progress: Math.round(progress),
        }),
      );
    });

    await uploadTask;

    const smallImagePath = basePath.replace(
      item.name,
      resizedName(item.name, "400x400"),
    );
    const largeImagePath = basePath.replace(
      item.name,
      resizedName(item.name, "1080x1920"),
    );

    const downloadUrlSmall = await keepTrying(smallImagePath);
    store.dispatch(
      updateUploadStatus({ id: item.id, status: "uploading", progress: 85 }),
    );

    let downloadUrlLarge: string | undefined;
    try {
      downloadUrlLarge = await storage().ref(largeImagePath).getDownloadURL();
    } catch (error) {
      console.log("Large image not ready yet, continuing without it");
    }

    const firebaseImageData = {
      downloadUrls: {
        small: downloadUrlSmall,
        medium: downloadUrlLarge || downloadUrlSmall,
        high: downloadUrlLarge || downloadUrlSmall,
        veryHigh: downloadUrlLarge || downloadUrlSmall,
      },
      deleteUrls: {
        small: smallImagePath,
        medium: largeImagePath,
        high: largeImagePath,
        veryHigh: largeImagePath,
      },
    };

    store.dispatch(updateFirebaseData({ id: item.id, firebaseImageData }));

    store.dispatch(
      updateUploadStatus({
        id: item.id,
        status: "completed",
        progress: 100,
      }),
    );

    console.log(`Feedback upload completed: ${item.id}`);
  }

  private async uploadProfile(item: UploadItem): Promise<void> {
    // Implementation for profile picture upload
    // This would be similar to changeProfilePicture function
    // For now, we'll use the existing pattern

    const timestamp = Date.now();
    const newFilePath = `profilePictures/${item.userId}/${timestamp}_${item.name}`;

    console.log("Profile upload path:", newFilePath);

    const reference = storage().ref(newFilePath);

    // Upload with progress tracking
    const uploadTask = reference.putFile(item.uri);

    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 50; // 50% for upload
      store.dispatch(
        updateUploadStatus({
          id: item.id,
          status: "uploading",
          progress: Math.round(progress),
        }),
      );
    });

    await uploadTask;

    // Generate storage paths for the resized images
    const smallImagePath = newFilePath.replace(
      item.name,
      resizedName(item.name, "400x400"),
    );
    const mediumImagePath = newFilePath.replace(
      item.name,
      resizedName(item.name, "720x1280"),
    );
    const highImagePath = newFilePath.replace(
      item.name,
      resizedName(item.name, "1080x1920"),
    );
    const veryHighImagePath = newFilePath.replace(
      item.name,
      resizedName(item.name, "1440x2560"),
    );

    // Retrieve the download URLs for each resized version
    const downloadUrlSmall = await keepTrying(smallImagePath);
    store.dispatch(
      updateUploadStatus({ id: item.id, status: "uploading", progress: 70 }),
    );

    const downloadUrlMedium = await keepTrying(mediumImagePath);
    store.dispatch(
      updateUploadStatus({ id: item.id, status: "uploading", progress: 80 }),
    );

    const downloadUrlHigh = await keepTrying(highImagePath);
    store.dispatch(
      updateUploadStatus({ id: item.id, status: "uploading", progress: 90 }),
    );

    const downloadUrlVeryHigh = await keepTrying(veryHighImagePath);

    const firebaseImageData = {
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

    // Update user's Firestore document
    await firestore().collection("Users").doc(item.userId).set(
      {
        profilePictureSmall: downloadUrlSmall,
        profilePictureMedium: downloadUrlMedium,
        profilePictureHigh: downloadUrlHigh,
        profilePictureVeryHigh: downloadUrlVeryHigh,
        profilePictureDeleteUrls: firebaseImageData.deleteUrls,
      },
      { merge: true },
    );

    store.dispatch(updateFirebaseData({ id: item.id, firebaseImageData }));

    store.dispatch(
      updateUploadStatus({
        id: item.id,
        status: "completed",
        progress: 100,
      }),
    );

    console.log(`Profile upload completed: ${item.id}`);
  }

  // Retry failed uploads
  async retryFailedUploads() {
    const state = store.getState();
    const failedUploads = state.uploadQueue.queue.filter(
      (item) => item.status === "failed" && item.retryCount < 3,
    );

    console.log(`Retrying ${failedUploads.length} failed uploads...`);

    for (const item of failedUploads) {
      store.dispatch(
        updateUploadStatus({
          id: item.id,
          status: "pending",
          progress: 0,
          error: undefined,
        }),
      );
    }
  }
}

// Create singleton instance
export const backgroundUploadService = new BackgroundUploadService();

export default BackgroundUploadService;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface UploadItem {
  id: string;
  uri: string;
  name: string;
  caption?: string;
  styles?: string[];
  userId: string;
  type: "publication" | "review" | "feedback" | "profile";
  status: "pending" | "uploading" | "completed" | "failed";
  progress: number;
  error?: string;
  retryCount: number;
  createdAt: number;
  uploadedAt?: number;
  firebaseImageData?: {
    downloadUrls: {
      small: string;
      medium: string;
      high: string;
      veryHigh: string;
    };
    deleteUrls: {
      small: string;
      medium: string;
      high: string;
      veryHigh: string;
    };
  };
}

interface UploadQueueState {
  queue: UploadItem[];
  isProcessing: boolean;
  completedUploads: UploadItem[];
  totalUploadsToday: number;
}

const initialState: UploadQueueState = {
  queue: [],
  isProcessing: false,
  completedUploads: [],
  totalUploadsToday: 0,
};

const uploadQueueSlice = createSlice({
  name: "uploadQueue",
  initialState,
  reducers: {
    addToQueue: (
      state,
      action: PayloadAction<
        Omit<
          UploadItem,
          "id" | "status" | "progress" | "retryCount" | "createdAt"
        >
      >
    ) => {
      const newItem: UploadItem = {
        ...action.payload,
        id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: "pending",
        progress: 0,
        retryCount: 0,
        createdAt: Date.now(),
      };

      // Check for duplicates based on uri and userId
      const isDuplicate = state.queue.some(
        (item) =>
          item.uri === newItem.uri &&
          item.userId === newItem.userId &&
          (item.status === "pending" ||
            item.status === "uploading" ||
            item.status === "completed")
      );

      if (!isDuplicate) {
        state.queue.push(newItem);
      }
    },

    updateUploadStatus: (
      state,
      action: PayloadAction<{
        id: string;
        status: UploadItem["status"];
        progress?: number;
        error?: string;
      }>
    ) => {
      const { id, status, progress, error } = action.payload;
      const item = state.queue.find((item) => item.id === id);
      if (item) {
        item.status = status;
        if (progress !== undefined) item.progress = progress;
        if (error) item.error = error;
        if (status === "completed") {
          item.uploadedAt = Date.now();
          // Move to completed uploads
          state.completedUploads.push({ ...item });
          state.totalUploadsToday += 1;
        }
        if (status === "failed") {
          item.retryCount += 1;
        }
      }
    },

    updateFirebaseData: (
      state,
      action: PayloadAction<{
        id: string;
        firebaseImageData: UploadItem["firebaseImageData"];
      }>
    ) => {
      const { id, firebaseImageData } = action.payload;
      const item = state.queue.find((item) => item.id === id);
      if (item) {
        item.firebaseImageData = firebaseImageData;
      }
    },

    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter((item) => item.id !== action.payload);
    },

    retryUpload: (state, action: PayloadAction<string>) => {
      const item = state.queue.find((item) => item.id === action.payload);
      if (item && item.status === "failed" && item.retryCount < 3) {
        // Don't retry if the error indicates the file is missing
        if (
          item.error &&
          (item.error.includes("File missing") ||
            item.error.includes("File not found"))
        ) {
          console.log(`Not retrying missing file: ${item.name}`);
          return;
        }
        item.status = "pending";
        item.error = undefined;
        item.progress = 0;
      }
    },

    clearCompleted: (state) => {
      state.queue = state.queue.filter((item) => item.status !== "completed");
    },

    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },

    clearQueue: (state) => {
      state.queue = [];
      state.isProcessing = false;
    },

    // Remove items that have been uploaded more than 24 hours ago or failed uploads older than 1 hour
    cleanupOldUploads: (state) => {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      // Keep completed uploads for 24 hours
      state.completedUploads = state.completedUploads.filter(
        (item) => (item.uploadedAt || item.createdAt) > oneDayAgo
      );

      // Remove failed uploads older than 1 hour to prevent persistent failures across app restarts
      state.queue = state.queue.filter((item) => {
        if (item.status === "failed" && item.createdAt < oneHourAgo) {
          console.log(`Cleaning up old failed upload: ${item.name}`);
          return false;
        }
        return true;
      });
    },

    // Reset any uploading status on app launch (in case app was killed during upload)
    resetUploadingStates: (state) => {
      state.isProcessing = false;
      state.queue = state.queue.map((item) => {
        if (item.status === "uploading") {
          console.log(`Resetting stuck upload state for: ${item.name}`);
          return {
            ...item,
            status: "pending" as const,
            progress: 0,
            error: undefined,
          };
        }
        return item;
      });
    },
  },
});

export const {
  addToQueue,
  updateUploadStatus,
  updateFirebaseData,
  removeFromQueue,
  retryUpload,
  clearCompleted,
  setProcessing,
  clearQueue,
  cleanupOldUploads,
  resetUploadingStates,
} = uploadQueueSlice.actions;

export default uploadQueueSlice.reducer;

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  addToQueue,
  retryUpload,
  clearCompleted,
  clearQueue,
  removeFromQueue,
} from "@/redux/slices/uploadQueueSlice";
import { backgroundUploadService } from "@/utils/BackgroundUploadService";
import { getFileName } from "@/utils/helperFunctions";
import { validateFileAccess, copyFileToAppDirectory } from "@/utils/fileUtils";

interface UseBackgroundUploadReturn {
  // Queue management
  queueUpload: (params: {
    uri: string;
    userId: string;
    type:
      | "publication"
      | "review"
      | "feedback"
      | "profile"
      | "publication_edit";
    caption?: string;
    styles?: string[];
    name?: string;
    // For edits
    docId?: string;
    oldDeleteUrls?: {
      small?: string;
      medium?: string;
      high?: string;
      veryHigh?: string;
    };
  }) => Promise<boolean>;

  // Queue state
  queue: Array<any>;
  isProcessing: boolean;
  completedUploads: Array<any>;
  totalUploadsToday: number;

  // Queue actions
  retryFailedUpload: (id: string) => void;
  clearCompletedUploads: () => void;
  clearAllUploads: () => void;
  removeUpload: (id: string) => void;
  retryAllFailedUploads: () => void;

  // Upload statistics
  pendingCount: number;
  uploadingCount: number;
  completedCount: number;
  failedCount: number;
}

export const useBackgroundUpload = (): UseBackgroundUploadReturn => {
  const dispatch = useDispatch();
  const uploadQueueState = useSelector((state: RootState) => state.uploadQueue);

  const { queue, isProcessing, completedUploads, totalUploadsToday } =
    uploadQueueState;

  const queueUpload = async ({
    uri,
    userId,
    type,
    caption,
    styles,
    name,
    docId,
    oldDeleteUrls,
  }: {
    uri: string;
    userId: string;
    type:
      | "publication"
      | "review"
      | "feedback"
      | "profile"
      | "publication_edit";
    caption?: string;
    styles?: string[];
    name?: string;
    docId?: string;
    oldDeleteUrls?: {
      small?: string;
      medium?: string;
      high?: string;
      veryHigh?: string;
    };
  }) => {
    const fileName = name || getFileName(uri);

    try {
      // Validate file exists before queuing
      const fileExists = await validateFileAccess(uri);
      if (!fileExists) {
        console.error(`Cannot queue upload: File not found at ${uri}`);
        return false;
      }

      // Copy file to app directory for persistence (if possible)
      const persistentUri = await copyFileToAppDirectory(uri, fileName);

      dispatch(
        addToQueue({
          uri: persistentUri,
          name: fileName,
          caption,
          styles,
          userId,
          type,
          docId,
          oldDeleteUrls,
        })
      );

      console.log(`Queued ${type} upload for user ${userId}: ${fileName}`);
      return true;
    } catch (error) {
      console.error(`Error queuing upload for ${fileName}:`, error);
      return false;
    }
  };

  const retryFailedUpload = (id: string) => {
    dispatch(retryUpload(id));
  };

  const clearCompletedUploads = () => {
    dispatch(clearCompleted());
  };

  const clearAllUploads = () => {
    dispatch(clearQueue());
  };

  const removeUpload = (id: string) => {
    dispatch(removeFromQueue(id));
  };

  const retryAllFailedUploads = () => {
    backgroundUploadService.retryFailedUploads();
  };

  // Calculate statistics
  const pendingCount = queue.filter((item) => item.status === "pending").length;
  const uploadingCount = queue.filter(
    (item) => item.status === "uploading"
  ).length;
  const completedCount = queue.filter(
    (item) => item.status === "completed"
  ).length;
  const failedCount = queue.filter((item) => item.status === "failed").length;

  return {
    queueUpload,
    queue,
    isProcessing,
    completedUploads,
    totalUploadsToday,
    retryFailedUpload,
    clearCompletedUploads,
    clearAllUploads,
    removeUpload,
    retryAllFailedUploads,
    pendingCount,
    uploadingCount,
    completedCount,
    failedCount,
  };
};

export default useBackgroundUpload;

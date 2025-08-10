# Background Upload System

## Overview

This system addresses two critical issues in the Tattoo Masters app:

1. **Duplicate Image Uploads**: Multiple calls to `uploadImages()` for the same images during artist registration
2. **Blocking UI Uploads**: Synchronous uploads that block the UI and fail if users navigate away

## Key Components

### 1. Upload Queue Redux Slice (`redux/slices/uploadQueueSlice.ts`)

Manages a centralized queue of upload tasks with the following features:

- **Duplicate Prevention**: Automatically prevents duplicate uploads based on URI and user ID
- **Status Tracking**: Tracks upload status (pending, uploading, completed, failed)
- **Progress Monitoring**: Real-time progress updates for each upload
- **Retry Logic**: Built-in retry mechanism for failed uploads
- **Cleanup**: Automatic cleanup of old completed uploads

```typescript
interface UploadItem {
  id: string;
  uri: string;
  name: string;
  userId: string;
  type: "publication" | "review" | "feedback" | "profile";
  status: "pending" | "uploading" | "completed" | "failed";
  progress: number;
  // ... other fields
}
```

### 2. Background Upload Service (`utils/BackgroundUploadService.ts`)

A singleton service that:

- **Processes Queue**: Continuously processes pending uploads in the background
- **App State Aware**: Continues uploads even when app goes to background
- **Progress Tracking**: Real-time progress updates with Firebase upload events
- **Multi-Resolution**: Handles Firebase's automatic image resizing
- **Error Handling**: Robust error handling with retry mechanisms

### 3. React Hook (`hooks/useBackgroundUpload.tsx`)

Easy-to-use hook for components:

```typescript
const { queueUpload, queue, pendingCount, uploadingCount } =
  useBackgroundUpload();

// Queue an upload
queueUpload({
  uri: imageUri,
  userId: currentUserId,
  type: "publication",
  caption: "My tattoo",
  styles: ["Traditional", "Color"],
});
```

### 4. Progress Indicator (`components/UploadProgressIndicator.tsx`)

Visual feedback component with:

- **Compact Mode**: Small persistent indicator showing overall progress
- **Detailed Mode**: Full queue view with individual upload progress
- **Status Colors**: Visual indication of upload states
- **Retry Controls**: Easy retry for failed uploads

## How It Solves the Issues

### Duplicate Upload Prevention

**Before:**

```typescript
// StepperForm.tsx
await uploadImages(imgs); // Upload images

// CreateReviewPassword.tsx
await uploadImages(imgs); // Same images uploaded again!
```

**After:**

```typescript
// StepperForm.tsx
imagesToUpload.forEach((img) => {
  queueUpload({
    uri: img.uri,
    userId: currentUserId,
    type: "publication",
    // ...
  });
});

// CreateReviewPassword.tsx
// Check prevents duplicates automatically
const imagesToUpload = imgs.filter(
  (img) => !img.uploadStatus || img.uploadStatus === "failed"
);
// Only queues if not already uploaded
```

### Background Processing

**Before:**

- UI blocked during uploads
- Navigation away cancels uploads
- No progress feedback
- All uploads synchronous

**After:**

- Uploads queue immediately, process in background
- Users can navigate freely during uploads
- Real-time progress indicators
- Uploads continue even when app is backgrounded

## Migration Guide

### For New Uploads

Replace direct upload calls:

```typescript
// OLD
import useFirebaseImage from "@/utils/firebase/useFirebaseImage";
const { uploadImages } = useFirebaseImage({ uniqueFilePrefix: userId });
await uploadImages(images);

// NEW
import useBackgroundUpload from "@/hooks/useBackgroundUpload";
const { queueUpload } = useBackgroundUpload();
images.forEach((img) => {
  queueUpload({
    uri: img.uri,
    userId: currentUserId,
    type: "publication", // or 'review', 'feedback', 'profile'
    caption: img.caption,
    styles: img.styles,
    name: img.name,
  });
});
```

### For Components with Upload Progress

Add the progress indicator:

```typescript
import UploadProgressIndicator from "@/components/UploadProgressIndicator";

// In your component
<UploadProgressIndicator />  // Compact mode
<UploadProgressIndicator showDetailed />  // Detailed mode
```

## Configuration

### Upload Types

The system supports different upload types:

- `publication`: Tattoo portfolio images
- `review`: Review images
- `feedback`: Feedback images
- `profile`: Profile pictures

### Progress Tracking

Each upload type has different progress stages:

- **File Upload**: 0-50% (or 0-70% for reviews/feedback)
- **Processing**: 50-90% (waiting for Firebase image resizing)
- **Completion**: 100% (Firestore document created)

### Retry Logic

- Maximum 3 retry attempts per upload
- Failed uploads can be retried individually or all at once
- Exponential backoff between retries

## Benefits

1. **Better UX**: Users can navigate freely during uploads
2. **Reliability**: No more lost uploads due to navigation
3. **Performance**: Non-blocking uploads improve app responsiveness
4. **Visibility**: Clear upload progress and status feedback
5. **Robustness**: Automatic retry and error handling
6. **Efficiency**: Prevents duplicate uploads and resource waste

## Monitoring

The system provides comprehensive monitoring:

- Queue status (pending, uploading, completed, failed counts)
- Individual upload progress
- Upload history and cleanup
- Error tracking and retry status

This new system ensures a much more robust and user-friendly upload experience while preventing the duplicate upload issues that were occurring during artist registration.

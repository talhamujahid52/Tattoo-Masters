import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type BlockReason =
  | "harassment"
  | "inappropriate_content"
  | "spam"
  | "impersonation"
  | "other";

export type BlockSourceType = "profile" | "publication" | "review" | "chat";

export type ReportTargetType = "publication" | "review" | "user";

export interface BlockedUserSnapshot {
  name: string;
  profilePicture: string;
}

export interface BlockedUserRecord {
  id: string;
  blockerId: string;
  blockedUserId: string;
  active: boolean;
  reason: BlockReason;
  sourceType: BlockSourceType;
  sourceId: string | null;
  blockedUserSnapshot?: BlockedUserSnapshot;
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt?: FirebaseFirestoreTypes.Timestamp | null;
  unblockedAt?: FirebaseFirestoreTypes.Timestamp | null;
  moderationStatus: "pending" | "reviewed" | "actioned";
  developerNotificationStatus: "pending" | "sent" | "failed";
  developerNotifiedAt?: FirebaseFirestoreTypes.Timestamp | null;
}

export interface ReportedItemRecord {
  id: string;
  reportedBy: string;
  type: ReportTargetType;
  targetId: string;
  targetOwnerId: string;
  reason: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
}

export interface BlockUserInput {
  blockedUserId: string;
  reason: BlockReason;
  sourceType: BlockSourceType;
  sourceId?: string | null;
  blockedUserSnapshot?: Partial<BlockedUserSnapshot>;
}

export interface SubmitReportInput {
  type: ReportTargetType;
  targetId: string;
  targetOwnerId: string;
  reason: string;
}

export const BLOCK_REASON_OPTIONS: {
  label: string;
  value: BlockReason;
}[] = [
  { label: "Harassment or bullying", value: "harassment" },
  { label: "Inappropriate content", value: "inappropriate_content" },
  { label: "Spam", value: "spam" },
  { label: "Impersonation", value: "impersonation" },
  { label: "Other", value: "other" },
];

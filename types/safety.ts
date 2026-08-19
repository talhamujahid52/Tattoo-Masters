import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type BlockReason =
  | "harassment"
  | "inappropriate_account"
  | "fake_account"
  | "impersonation"
  | "other"
  // Legacy values remain valid for persisted records and older app versions.
  | "inappropriate_content"
  | "spam";

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
  { label: "Harassment", value: "harassment" },
  { label: "Inappropriate account", value: "inappropriate_account" },
  { label: "Impersonation", value: "impersonation" },
  { label: "Fake account", value: "fake_account" },
  { label: "Other", value: "other" },
];

import type { BlockedUserRecord, ReportTargetType } from "@/types/safety";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface SafetyState {
  currentUserId: string | null;
  blockedUserIds: string[];
  reportedPublicationIds: string[];
  reportedReviewIds: string[];
  hydrated: boolean;
  blockedUsersById: Record<string, BlockedUserRecord>;
  blocksHydrated: boolean;
  reportsHydrated: boolean;
  hasBlocksCache: boolean;
  hasReportsCache: boolean;
}

const initialState: SafetyState = {
  currentUserId: null,
  blockedUserIds: [],
  reportedPublicationIds: [],
  reportedReviewIds: [],
  hydrated: false,
  blockedUsersById: {},
  blocksHydrated: false,
  reportsHydrated: false,
  hasBlocksCache: false,
  hasReportsCache: false,
};

const unique = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean)));

const updateHydrated = (state: SafetyState) => {
  state.hydrated = state.blocksHydrated && state.reportsHydrated;
};

const safetySlice = createSlice({
  name: "safety",
  initialState,
  reducers: {
    beginSafetyHydration: (state, action: PayloadAction<string>) => {
      if (state.currentUserId !== action.payload) {
        state.currentUserId = action.payload;
        state.blockedUserIds = [];
        state.reportedPublicationIds = [];
        state.reportedReviewIds = [];
        state.blockedUsersById = {};
        state.hasBlocksCache = false;
        state.hasReportsCache = false;
      }

      state.blocksHydrated = false;
      state.reportsHydrated = false;
      state.hydrated = false;
    },
    setBlockedUsers: (state, action: PayloadAction<BlockedUserRecord[]>) => {
      const activeRecords = action.payload.filter((record) => record.active);
      state.blockedUserIds = unique(
        activeRecords.map((record) => record.blockedUserId),
      );
      state.blockedUsersById = activeRecords.reduce<
        Record<string, BlockedUserRecord>
      >((records, record) => {
        records[record.blockedUserId] = record;
        return records;
      }, {});
      state.blocksHydrated = true;
      state.hasBlocksCache = true;
      updateHydrated(state);
    },
    setReportedItems: (
      state,
      action: PayloadAction<{
        publicationIds: string[];
        reviewIds: string[];
      }>,
    ) => {
      state.reportedPublicationIds = unique(action.payload.publicationIds);
      state.reportedReviewIds = unique(action.payload.reviewIds);
      state.reportsHydrated = true;
      state.hasReportsCache = true;
      updateHydrated(state);
    },
    markBlocksHydrated: (state) => {
      // Listener failures may reuse a previously successful persisted snapshot,
      // but an account with no cache remains fail-closed until Firestore responds.
      state.blocksHydrated = state.hasBlocksCache;
      updateHydrated(state);
    },
    markReportsHydrated: (state) => {
      state.reportsHydrated = state.hasReportsCache;
      updateHydrated(state);
    },
    markUserBlocked: (state, action: PayloadAction<BlockedUserRecord>) => {
      const record = action.payload;
      state.blockedUserIds = unique([
        ...state.blockedUserIds,
        record.blockedUserId,
      ]);
      state.blockedUsersById[record.blockedUserId] = record;
    },
    markUserUnblocked: (state, action: PayloadAction<string>) => {
      state.blockedUserIds = state.blockedUserIds.filter(
        (id) => id !== action.payload,
      );
      delete state.blockedUsersById[action.payload];
    },
    markItemReported: (
      state,
      action: PayloadAction<{ type: ReportTargetType; targetId: string }>,
    ) => {
      if (action.payload.type === "publication") {
        state.reportedPublicationIds = unique([
          ...state.reportedPublicationIds,
          action.payload.targetId,
        ]);
      }

      if (action.payload.type === "review") {
        state.reportedReviewIds = unique([
          ...state.reportedReviewIds,
          action.payload.targetId,
        ]);
      }
    },
    clearSafetyState: () => initialState,
  },
});

export const {
  beginSafetyHydration,
  setBlockedUsers,
  setReportedItems,
  markBlocksHydrated,
  markReportsHydrated,
  markUserBlocked,
  markUserUnblocked,
  markItemReported,
  clearSafetyState,
} = safetySlice.actions;

type StateWithSafety = { safety: SafetyState };

export const selectBlockedUserIds = (state: StateWithSafety) =>
  state.safety.blockedUserIds;
export const selectReportedPublicationIds = (state: StateWithSafety) =>
  state.safety.reportedPublicationIds;
export const selectReportedReviewIds = (state: StateWithSafety) =>
  state.safety.reportedReviewIds;
export const selectSafetyHydrated = (state: StateWithSafety) =>
  state.safety.hydrated;
export const selectBlockedUsersById = (state: StateWithSafety) =>
  state.safety.blockedUsersById;
export const selectSafetyCurrentUserId = (state: StateWithSafety) =>
  state.safety.currentUserId;

export default safetySlice.reducer;

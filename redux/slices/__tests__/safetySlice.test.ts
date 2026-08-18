import reducer, {
  beginSafetyHydration,
  markBlocksHydrated,
  markItemReported,
  markReportsHydrated,
  markUserBlocked,
  markUserUnblocked,
  setBlockedUsers,
  setReportedItems,
} from "../safetySlice";
import type { BlockedUserRecord } from "../../../types/safety";

const blockRecord = (
  blockedUserId: string,
  blockerId = "viewer-a",
): BlockedUserRecord => ({
  id: `${blockerId}__${blockedUserId}`,
  blockerId,
  blockedUserId,
  active: true,
  reason: "harassment",
  sourceType: "profile",
  sourceId: blockedUserId,
  moderationStatus: "pending",
  developerNotificationStatus: "pending",
});

describe("safetySlice", () => {
  it("hydrates blocks and reports for the current account", () => {
    let state = reducer(undefined, beginSafetyHydration("viewer-a"));

    state = reducer(state, setBlockedUsers([blockRecord("artist-a")]));
    expect(state.hydrated).toBe(false);

    state = reducer(
      state,
      setReportedItems({
        publicationIds: ["tattoo-a"],
        reviewIds: ["review-a"],
      }),
    );

    expect(state.hydrated).toBe(true);
    expect(state.blockedUserIds).toEqual(["artist-a"]);
    expect(state.reportedPublicationIds).toEqual(["tattoo-a"]);
    expect(state.reportedReviewIds).toEqual(["review-a"]);
  });

  it("adds and removes a block without deleting report state", () => {
    let state = reducer(undefined, beginSafetyHydration("viewer-a"));
    state = reducer(
      state,
      setReportedItems({ publicationIds: ["tattoo-a"], reviewIds: [] }),
    );
    state = reducer(state, markUserBlocked(blockRecord("artist-a")));
    state = reducer(state, markUserUnblocked("artist-a"));

    expect(state.blockedUserIds).toEqual([]);
    expect(state.reportedPublicationIds).toEqual(["tattoo-a"]);
  });

  it("records only the selected reported item type", () => {
    let state = reducer(undefined, beginSafetyHydration("viewer-a"));
    state = reducer(
      state,
      markItemReported({ type: "publication", targetId: "tattoo-a" }),
    );
    state = reducer(
      state,
      markItemReported({ type: "review", targetId: "review-a" }),
    );
    state = reducer(
      state,
      markItemReported({ type: "user", targetId: "artist-a" }),
    );

    expect(state.reportedPublicationIds).toEqual(["tattoo-a"]);
    expect(state.reportedReviewIds).toEqual(["review-a"]);
    expect(state.blockedUserIds).toEqual([]);
  });

  it("clears persisted safety data when accounts switch", () => {
    let state = reducer(undefined, beginSafetyHydration("viewer-a"));
    state = reducer(state, setBlockedUsers([blockRecord("artist-a")]));
    state = reducer(
      state,
      setReportedItems({ publicationIds: ["tattoo-a"], reviewIds: [] }),
    );

    state = reducer(state, beginSafetyHydration("viewer-b"));

    expect(state.currentUserId).toBe("viewer-b");
    expect(state.blockedUserIds).toEqual([]);
    expect(state.reportedPublicationIds).toEqual([]);
    expect(state.reportedReviewIds).toEqual([]);
    expect(state.hydrated).toBe(false);
  });

  it("fails closed on hydration errors until a successful cache exists", () => {
    let state = reducer(undefined, beginSafetyHydration("viewer-a"));
    state = reducer(state, markBlocksHydrated());
    state = reducer(state, markReportsHydrated());

    expect(state.hydrated).toBe(false);
  });

  it("reuses last-known safety filters when a later refresh fails", () => {
    let state = reducer(undefined, beginSafetyHydration("viewer-a"));
    state = reducer(state, setBlockedUsers([blockRecord("artist-a")]));
    state = reducer(
      state,
      setReportedItems({ publicationIds: ["tattoo-a"], reviewIds: [] }),
    );

    state = reducer(state, beginSafetyHydration("viewer-a"));
    state = reducer(state, markBlocksHydrated());
    state = reducer(state, markReportsHydrated());

    expect(state.hydrated).toBe(true);
    expect(state.blockedUserIds).toEqual(["artist-a"]);
    expect(state.reportedPublicationIds).toEqual(["tattoo-a"]);
  });
});

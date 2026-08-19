/* eslint-env node */
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { after, before, beforeEach, describe, it } = require("node:test");

const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require("@firebase/rules-unit-testing");
const {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} = require("firebase/firestore");

const PROJECT_ID = "tattoo-masters-ugc-rules-test";
const ALICE = "alice";
const BOB = "bob";
const MALLORY = "mallory";

let testEnvironment;

const authenticatedFirestore = (uid) =>
  testEnvironment.authenticatedContext(uid).firestore();

const clientBlock = (blockerId, blockedUserId, overrides = {}) => ({
  blockerId,
  blockedUserId,
  active: true,
  reason: "harassment",
  sourceType: "profile",
  sourceId: null,
  blockedUserSnapshot: {
    name: blockedUserId === BOB ? "Bob" : "Blocked user",
    profilePicture: "",
  },
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  unblockedAt: null,
  moderationStatus: "pending",
  developerNotificationStatus: "pending",
  developerNotifiedAt: null,
  ...overrides,
});

const adminBlock = (blockerId, blockedUserId, overrides = {}) => ({
  blockerId,
  blockedUserId,
  active: true,
  reason: "harassment",
  sourceType: "profile",
  sourceId: null,
  blockedUserSnapshot: {
    name: blockedUserId === BOB ? "Bob" : "Blocked user",
    profilePicture: "",
  },
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  unblockedAt: null,
  moderationStatus: "pending",
  developerNotificationStatus: "pending",
  developerNotifiedAt: null,
  ...overrides,
});

async function seedDocuments(entries) {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all(
      entries.map(([path, data]) => setDoc(doc(db, path), data)),
    );
  });
}

async function seedUsers() {
  await seedDocuments([
    [`Users/${ALICE}`, { uid: ALICE, name: "Alice" }],
    [`Users/${BOB}`, { uid: BOB, name: "Bob" }],
    [`Users/${MALLORY}`, { uid: MALLORY, name: "Mallory" }],
  ]);
}

async function seedChat(chatOverrides = {}) {
  await seedDocuments([
    [
      "Chats/alice-bob",
      {
        participants: [ALICE, BOB],
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        ...chatOverrides,
      },
    ],
    [
      "Chats/alice-bob/messages/existing-message",
      {
        _id: "existing-message",
        text: "History is retained for moderation.",
        createdAt: new Date("2026-01-01T00:01:00.000Z"),
        user: { _id: ALICE, name: "Alice" },
      },
    ],
  ]);
}

const newMessage = (senderId, id) => ({
  _id: id,
  text: "This write should be evaluated by the block rules.",
  createdAt: serverTimestamp(),
  user: { _id: senderId, name: senderId },
});

describe("Firestore UGC safety rules", { concurrency: false }, () => {
  before(async () => {
    const emulatorAddress = process.env.FIRESTORE_EMULATOR_HOST;
    if (!emulatorAddress) {
      throw new Error(
        "FIRESTORE_EMULATOR_HOST is missing. Run `npm run test:firestore-rules`.",
      );
    }

    const separator = emulatorAddress.lastIndexOf(":");
    const host = emulatorAddress.slice(0, separator);
    const port = Number(emulatorAddress.slice(separator + 1));

    testEnvironment = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        host,
        port,
        rules: readFileSync(resolve(__dirname, "../firestore.rules"), "utf8"),
      },
    });
  });

  beforeEach(async () => {
    await testEnvironment.clearFirestore();
    await seedUsers();
  });

  after(async () => {
    await testEnvironment?.cleanup();
  });

  it("allows only the blocker to create or change a block record", async () => {
    const aliceDb = authenticatedFirestore(ALICE);
    const bobDb = authenticatedFirestore(BOB);

    await assertSucceeds(
      setDoc(
        doc(aliceDb, `BlockedUsers/${ALICE}__${BOB}`),
        clientBlock(ALICE, BOB),
      ),
    );

    await assertFails(
      updateDoc(doc(bobDb, `BlockedUsers/${ALICE}__${BOB}`), {
        active: false,
        updatedAt: serverTimestamp(),
        unblockedAt: serverTimestamp(),
      }),
    );

    await assertFails(
      setDoc(
        doc(bobDb, `BlockedUsers/${ALICE}__${MALLORY}`),
        clientBlock(ALICE, MALLORY),
      ),
    );
  });

  it("lets the blocked party read the relationship but not update it", async () => {
    await seedDocuments([
      [`BlockedUsers/${ALICE}__${BOB}`, adminBlock(ALICE, BOB)],
    ]);
    const bobDb = authenticatedFirestore(BOB);

    await assertSucceeds(
      getDoc(doc(bobDb, `BlockedUsers/${ALICE}__${BOB}`)),
    );
    await assertFails(
      updateDoc(doc(bobDb, `BlockedUsers/${ALICE}__${BOB}`), {
        active: false,
        updatedAt: serverTimestamp(),
        unblockedAt: serverTimestamp(),
      }),
    );
  });

  it("accepts the account-specific block reasons", async () => {
    const aliceDb = authenticatedFirestore(ALICE);

    await assertSucceeds(
      setDoc(
        doc(aliceDb, `BlockedUsers/${ALICE}__${BOB}`),
        clientBlock(ALICE, BOB, { reason: "inappropriate_account" }),
      ),
    );
    await assertSucceeds(
      setDoc(
        doc(aliceDb, `BlockedUsers/${ALICE}__${MALLORY}`),
        clientBlock(ALICE, MALLORY, { reason: "fake_account" }),
      ),
    );
  });

  it("allows blocking and unfollowing to update both follower records atomically", async () => {
    await seedDocuments([
      [`Users/${ALICE}`, { uid: ALICE, name: "Alice", followedArtists: [BOB] }],
      [`Users/${BOB}`, { uid: BOB, name: "Bob", followersCount: 1 }],
    ]);
    const aliceDb = authenticatedFirestore(ALICE);
    const batch = writeBatch(aliceDb);
    batch.set(
      doc(aliceDb, `BlockedUsers/${ALICE}__${BOB}`),
      clientBlock(ALICE, BOB),
    );
    batch.update(doc(aliceDb, `Users/${ALICE}`), { followedArtists: [] });
    batch.update(doc(aliceDb, `Users/${BOB}`), { followersCount: 0 });

    await assertSucceeds(batch.commit());
  });

  it("accepts a report whose owner matches the reported publication", async () => {
    await seedDocuments([
      ["publications/publication-1", { userId: BOB, description: "Tattoo" }],
    ]);
    const aliceDb = authenticatedFirestore(ALICE);

    await assertSucceeds(
      setDoc(doc(aliceDb, "ReportedItems/valid-report"), {
        reportedBy: ALICE,
        type: "publication",
        targetId: "publication-1",
        targetOwnerId: BOB,
        reason: "Spam",
        createdAt: serverTimestamp(),
      }),
    );
  });

  it("rejects a report whose owner does not match the reported publication", async () => {
    await seedDocuments([
      ["publications/publication-1", { userId: BOB, description: "Tattoo" }],
    ]);
    const aliceDb = authenticatedFirestore(ALICE);

    await assertFails(
      setDoc(doc(aliceDb, "ReportedItems/forged-owner-report"), {
        reportedBy: ALICE,
        type: "publication",
        targetId: "publication-1",
        targetOwnerId: MALLORY,
        reason: "Spam",
        createdAt: serverTimestamp(),
      }),
    );
  });

  it("denies messages for both participants when the sender has blocked the recipient", async () => {
    await seedChat();
    await seedDocuments([
      [`BlockedUsers/${ALICE}__${BOB}`, adminBlock(ALICE, BOB)],
    ]);
    const aliceDb = authenticatedFirestore(ALICE);
    const bobDb = authenticatedFirestore(BOB);

    await assertFails(
      setDoc(
        doc(aliceDb, "Chats/alice-bob/messages/alice-after-block"),
        newMessage(ALICE, "alice-after-block"),
      ),
    );
    await assertFails(
      setDoc(
        doc(bobDb, "Chats/alice-bob/messages/bob-after-block"),
        newMessage(BOB, "bob-after-block"),
      ),
    );
  });

  it("denies messages when the active block is in the reverse direction", async () => {
    await seedChat();
    await seedDocuments([
      [`BlockedUsers/${BOB}__${ALICE}`, adminBlock(BOB, ALICE)],
    ]);
    const aliceDb = authenticatedFirestore(ALICE);

    await assertFails(
      setDoc(
        doc(aliceDb, "Chats/alice-bob/messages/reverse-block"),
        newMessage(ALICE, "reverse-block"),
      ),
    );
  });

  it("keeps existing chat history readable to both participants after a block", async () => {
    await seedChat({
      hiddenFor: [ALICE],
      disabledParticipants: [ALICE, BOB],
    });
    await seedDocuments([
      [`BlockedUsers/${ALICE}__${BOB}`, adminBlock(ALICE, BOB)],
    ]);
    const aliceDb = authenticatedFirestore(ALICE);
    const bobDb = authenticatedFirestore(BOB);
    const malloryDb = authenticatedFirestore(MALLORY);
    const messagePath = "Chats/alice-bob/messages/existing-message";

    await assertSucceeds(getDoc(doc(aliceDb, messagePath)));
    await assertSucceeds(getDoc(doc(bobDb, messagePath)));
    await assertFails(getDoc(doc(malloryDb, messagePath)));
  });

  it("allows unblock and re-block without exposing moderation fields", async () => {
    await seedChat();
    await seedDocuments([
      [
        `BlockedUsers/${ALICE}__${BOB}`,
        adminBlock(ALICE, BOB, {
          moderationStatus: "reviewed",
          developerNotificationStatus: "sent",
          developerNotifiedAt: new Date("2026-01-01T00:02:00.000Z"),
        }),
      ],
    ]);
    const aliceDb = authenticatedFirestore(ALICE);
    const blockReference = doc(
      aliceDb,
      `BlockedUsers/${ALICE}__${BOB}`,
    );

    await assertSucceeds(
      updateDoc(blockReference, {
        active: false,
        updatedAt: serverTimestamp(),
        unblockedAt: serverTimestamp(),
      }),
    );
    await assertSucceeds(
      updateDoc(blockReference, {
        active: true,
        reason: "spam",
        sourceType: "chat",
        sourceId: "alice-bob",
        blockedUserSnapshot: { name: "Bob", profilePicture: "" },
        updatedAt: serverTimestamp(),
        unblockedAt: null,
      }),
    );
    await assertFails(
      updateDoc(blockReference, {
        moderationStatus: "actioned",
        developerNotificationStatus: "failed",
        developerNotifiedAt: null,
        updatedAt: serverTimestamp(),
      }),
    );
  });
});

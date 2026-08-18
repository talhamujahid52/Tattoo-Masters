# UGC Safety Deployment and App Review Checklist

This checklist covers the production setup for legal consent, reporting, user blocking, chat restrictions, and moderator notifications. Perform it with two normal test accounts and one moderator account before submitting a build.

## 1. Configure moderators

Create or update this document with the Firebase Console or another trusted Admin SDK environment:

```text
app_content/moderation
```

Its required field is:

```text
moderatorUserIds: ["FIREBASE_AUTH_UID_1", "FIREBASE_AUTH_UID_2"]
```

- Use Firebase Authentication UIDs, not email addresses or Firestore document auto-IDs.
- Keep at least two moderators configured for production coverage when possible.
- Never seed this document from the mobile app. Normal clients are intentionally denied access to it by Firestore rules.
- Do not store FCM tokens in the moderation document. Tokens belong in each moderator's `Users/{uid}.fcmTokens` array.

For each moderator, install the production or TestFlight build on a physical device, sign in, grant notification permission, and confirm that `Users/{uid}.fcmTokens` contains that device's current token. Remove stale tokens through a trusted administrative process when needed. Do not copy tokens into tickets, recordings, or logs.

## 2. Validate and deploy

From the repository root, validate the app, security rules, and Cloud Functions build:

```bash
yarn install --frozen-lockfile
yarn lint
npx tsc --noEmit
yarn jest --runInBand --watchman=false
yarn test:firestore-rules
cd functions
npm install
npm run build
cd ..
```

Confirm the active Firebase project, then deploy the security boundary and backend together:

```bash
firebase use tattoo-masters-48277
firebase deploy --only firestore:rules,firestore:indexes,functions
```

After deployment, confirm that `syncBlockedUser` is present and has no startup errors. Allow time for new composite indexes to finish building before running production verification.

## 3. Verify production behavior

Create a block from Account A against Account B and inspect the deterministic document:

```text
BlockedUsers/{accountAUid}__{accountBUid}
```

Verify:

- `active` is `true`, identity/source fields identify the correct users and content, and timestamps are populated.
- `moderationStatus` is `pending` until a moderator handles the event.
- `developerNotificationStatus` moves from `pending` to `sent`, and `developerNotifiedAt` is populated.
- The moderator receives the push on a real device.
- The matching chat contains Account A in `hiddenFor` and both UIDs in `disabledParticipants`.
- Account A immediately loses the profile, all content, and the conversation. Account B retains read-only history and cannot send.

If the notification status becomes `failed`, inspect `developerNotificationError`, moderator UID configuration, notification permission, and each moderator's `fcmTokens`. Review backend logs with:

```bash
firebase functions:log --only syncBlockedUser
```

Next, unblock through **Settings > Blocked users**. Confirm the block document remains but `active` becomes `false`. With no reverse block, both users are removed from the chat restriction arrays and the existing conversation is restored. With a reverse block active, chat remains restricted until the final active block is removed. A prior follow is not restored.

Also report one tattoo and one review. Each successful report should create a `ReportedItems` record with the reporter UID, normalized type, target ID, and target owner ID. Only the reported item should disappear immediately and remain hidden after relaunch; the owner's other content stays visible. Reported items must remain hidden after an unrelated unblock.

## 4. Physical-device App Review recording

Record one continuous, readable video on a physical iPhone or iPad showing:

1. Login or registration is stopped while consent is unchecked.
2. Terms of Use and Privacy Policy open before authentication and contain the zero-tolerance, reporting, and blocking language.
3. Reporting a tattoo or review removes that item immediately.
4. Blocking from content removes the account, all of its content, and the blocker-side chat.
5. The blocked account's existing chat is read-only and displays the unavailable-conversation message.
6. **Settings > Blocked users > Unblock** restores eligible content and chat.
7. The moderation push arrives on the moderator device.

Repeat the core flow on the iPad layout used by App Review. Avoid showing personal data, FCM tokens, Firebase credentials, or unrelated notifications. Upload the recording to the App Review Information **Notes** field and state that block activations create a persistent moderation record and notify configured moderators.

## 5. Diagnostics and rollback

- Treat `BlockedUsers`, `ReportedItems`, chats, and messages as moderation evidence. Do not delete them to repair UI state.
- A `failed` notification does not justify manually clearing chat restrictions or re-enabling message writes while a block is active. Fix configuration or delivery first.
- Updating only a notification-status field does not retrigger an activation. Reprocess production events only through an approved Admin SDK repair procedure after confirming the underlying block state.
- If a release must be rolled back, deploy the previously tested Functions and Firestore rules/index definitions from version control as one compatible set. Preserve all block, report, and message documents.
- Before resubmission, test self-block prevention, duplicate blocks, reverse blocks, offline/failed writes, notification deep links, and queued chat-image uploads. Confirm no account or content flashes before safety state hydration completes.

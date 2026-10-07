# kits/ — self-managed forks of the Firebase Extensions

Firebase Extensions shut down on **March 31, 2027**. The three extensions this
project used are forked here as ordinary Cloud Functions codebases (see the
`functions` array in `firebase.json`). Each kit is a vendored copy of the
extension's `functions/src` with the smallest possible changes, and a `.env`
holding the configuration exported from the installed extension instance on
2026-10-07 (`firebase ext:export`).

| Kit | Replaces extension instance(s) | Codebase | Functions | Region | Gen |
|---|---|---|---|---|---|
| `storage-resize-images` | `storage-resize-images` (firebase/storage-resize-images@0.3.6) | `resize-images` | `generateResizedImage` | europe-west1 | 1 |
| `firestore-typesense-search` | `firestore-typesense-search-users` + `firestore-typesense-search` (typesense/firestore-typesense-search@2.1.0) | `typesense-search` | `indexOnWriteUsers`, `indexOnWritePublications`, `backfill` | europe-north1 | 2 |
| `delete-user-data` | `delete-user-data` (firebase/delete-user-data@0.1.30) | `delete-user-data` | `clearData`, `handleSearch`, `handleDeletion` | us-central1 | 1 |

## What was changed from upstream

Every fork keeps the upstream source byte-for-byte except:

- **storage-resize-images** — `index.ts` sets region, memory, timeout and the
  bucket trigger explicitly (the extension framework used to inject these from
  `extension.yaml`). `config.ts` gained `functionMemory()` and falls back to
  `GCLOUD_PROJECT` for the project id. Upstream's Eventarc "extension events"
  code is still there but is a no-op because `EVENTARC_CHANNEL` is unset.
- **delete-user-data** — `index.ts` imports `firebase-functions/v1` (v6 defaults
  to v2) and sets region/memory. `config.ts` names the Pub/Sub topics
  `<TOPIC_PREFIX>-discovery|deletion` because `EXT_*` env vars are reserved.
- **firestore-typesense-search** — source is upstream `4.0.0-rc.1` (the version
  Typesense themselves converted into a kit; the Firestore→Typesense document
  mapping is unchanged since 2.x). `index.ts` drops the `requiresRole()`
  declarations (need firebase-functions 7 + CLI 15.32) and, instead of one
  trigger on every write in the database, exports one narrow trigger per
  collection via `createIndexOnWrite()` — exactly what the two extension
  instances did. Both collections share one `backfill` function.

## Deploying (first time)

1. Create the Typesense secret the kit reads (same admin key the extension used;
   get it from the Typesense Cloud dashboard):

   ```sh
   firebase functions:secrets:set TYPESENSE_API_KEY
   ```

2. Deploy the kits. The extensions keep running until you uninstall them, so
   deploy one kit, verify, then uninstall its extension before the next one.

   ```sh
   firebase deploy --only functions:typesense-search
   firebase ext:uninstall firestore-typesense-search-users
   firebase ext:uninstall firestore-typesense-search

   firebase deploy --only functions:resize-images
   firebase ext:uninstall storage-resize-images      # do this right away, see note

   firebase deploy --only functions:delete-user-data
   firebase ext:uninstall delete-user-data
   ```

   Resize note: while both the extension and the kit are deployed every upload is
   processed twice and both try to delete the original, so uninstall the
   extension immediately after the kit deploy succeeds.

3. Verify:

   ```sh
   firebase functions:list
   firebase functions:log --only generateResizedImage
   firebase functions:log --only indexOnWriteUsers,indexOnWritePublications
   ```

   Upload an image from the app and check the `_400x400.jpeg` etc. files appear;
   edit a profile and search for it.

## Changing configuration

Edit the kit's `.env` and redeploy that codebase. Config lives in `.env`, not in
the Firebase console.

## Backfilling Typesense

Unchanged: write `{trigger: true}` to Firestore document `typesense_sync/backfill`.

## Upstream

- https://github.com/firebase/extensions/tree/master/storage-resize-images
- https://github.com/firebase/extensions/tree/master/delete-user-data
- https://github.com/typesense/firestore-typesense-search

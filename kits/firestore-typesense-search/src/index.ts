import {assertNoRemovedParams} from "./config.js";
import {createIndexOnWrite} from "./indexOnWrite.js";

assertNoRemovedParams();

// Fork note: upstream 4.0.0 deploys a single `indexOnWrite` on `{path=**}/{documentID}`
// (every write in the database) and filters in code. The two 2.1.0 extension instances
// this fork replaces each listened to exactly one collection, so we keep one narrow
// trigger per collection. Add a line here if you add a path to FIRESTORE_COLLECTION_PATHS.
export const indexOnWriteUsers = createIndexOnWrite("Users/{documentID}");
export const indexOnWritePublications = createIndexOnWrite("publications/{documentID}");

export {backfill} from "./backfill.js";

/*
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Fork note: the extension framework set EXT_INSTANCE_ID; EXT_* is a reserved
// prefix for Cloud Functions env vars (so is KIT_), so the fork uses TOPIC_PREFIX instead.
const instanceId = process.env.TOPIC_PREFIX || "delete-user-data";

export default {
  location: process.env.LOCATION || "us-central1",
  databaseId: process.env.FIRESTORE_DATABASE_ID || "(default)",
  firestorePaths: process.env.FIRESTORE_PATHS,
  firestoreDeleteMode: process.env.FIRESTORE_DELETE_MODE,
  rtdbPaths: process.env.RTDB_PATHS,
  storagePaths: process.env.STORAGE_PATHS,
  enableSearch: process.env.ENABLE_AUTO_DISCOVERY === "yes",
  storageBucketDefault:
    process.env.CLOUD_STORAGE_BUCKET || process.env.STORAGE_BUCKET,
  selectedDatabaseInstance: process.env.SELECTED_DATABASE_INSTANCE,
  selectedDatabaseLocation: process.env.SELECTED_DATABASE_LOCATION,
  searchFields: process.env.AUTO_DISCOVERY_SEARCH_FIELDS || "",
  searchFunction: process.env.SEARCH_FUNCTION,
  discoveryTopic: `${instanceId}-discovery`,
  deletionTopic: `${instanceId}-deletion`,
  searchDepth: process.env.AUTO_DISCOVERY_SEARCH_DEPTH
    ? parseInt(process.env.AUTO_DISCOVERY_SEARCH_DEPTH)
    : 3,
};

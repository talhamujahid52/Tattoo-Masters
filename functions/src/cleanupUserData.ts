import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import Typesense from "typesense";

const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: "wi0ecngpr2q43hz9p-1.a1.typesense.net",
      port: 443,
      protocol: "https",
    },
  ],
  apiKey: "m9ha4JfGUemJ8dZJI1k3weikrjzaizgg",
  connectionTimeoutSeconds: 60,
});

/**
 * Cloud Function triggered when a user is deleted from Firebase Authentication.
 * Deletes the corresponding user document from the "Users" Firestore collection.
 */
export const cleanupUserData = functions.auth
  .user()
  .onDelete(async (user: functions.auth.UserRecord) => {
    const { uid } = user;
    const db = admin.firestore();

    try {
      /** -----------------------------
       * Delete publications from Firestore
       * ------------------------------ */
      const publicationsSnap = await db
        .collection("publications")
        .where("userId", "==", uid)
        .get();

      if (!publicationsSnap.empty) {
        const batch = db.batch();
        publicationsSnap.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }

      /** -----------------------------
       * Delete publications from Typesense
       * (same logic as useTypesense.search filterBy)
       * ------------------------------ */
      await typesenseClient
        .collections("publications")
        .documents()
        .delete({
          filter_by: `userId:=${uid}`,
        });

      /** -----------------------------
       * Delete user document
       * ------------------------------ */
      await db.collection("Users").doc(uid).delete();

      console.log(`Cleanup completed for user: ${uid}`);
    } catch (error) {
      console.error(`Cleanup failed for user: ${uid}`, error);
      // Don't throw → prevents retry loop
    }
  });

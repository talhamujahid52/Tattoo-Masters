import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

/**
 * Cloud Function triggered when a user is deleted from Firebase Authentication.
 * Deletes the corresponding user document from the "Users" Firestore collection.
 */
export const cleanupUserData = functions.auth.user().onDelete(async (user: functions.auth.UserRecord) => {
    const { uid } = user;

    try {
        // Delete the user document from Firestore
        await admin.firestore().collection("Users").doc(uid).delete();
        console.log(`Successfully deleted user document for UID: ${uid}`);
    } catch (error) {
        console.error(`Error deleting user document for UID: ${uid}`, error);
        // We don't throw the error to avoid infinite retries if the user is already gone
    }
});

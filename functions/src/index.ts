import { setGlobalOptions } from "firebase-functions";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";

// Set global options for performance/cost control
setGlobalOptions({ maxInstances: 10 });

// Initialize Firebase Admin SDK
admin.initializeApp();

// Basic CORS wrapper for onRequest
const corsHandler = cors({ origin: true });

// Cloud Function: HTTP endpoint to send push notifications
// Supports either a direct token or a recipient userId that will be resolved to stored tokens
export const sendPushNotification = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      // Verify Firebase ID token from Authorization header
      const authHeader = (req.headers.authorization || req.headers.Authorization) as
        | string
        | undefined;
      if (!authHeader || !authHeader.toString().startsWith("Bearer ")) {
        res.status(401).send("Unauthorized");
        return;
      }
      const idToken = authHeader.toString().split(" ")[1];
      try {
        await admin.auth().verifyIdToken(idToken);
      } catch (e) {
        res.status(401).send("Invalid token");
        return;
      }

      const { token, recipientUserId, title, body, data } = req.body || {};

      if ((!token && !recipientUserId) || !title || !body) {
        res.status(400).send("Missing required fields");
        return;
      }

      let tokens: string[] = [];
      if (token) {
        tokens = [token];
      } else if (recipientUserId) {
        const userSnap = await admin.firestore().collection("Users").doc(recipientUserId).get();
        if (!userSnap.exists) {
          res.status(404).send("Recipient user not found");
          return;
        }
        const userData = userSnap.data() as { fcmTokens?: string[] } | undefined;
        tokens = Array.from(new Set((userData?.fcmTokens || []).filter(Boolean)));
        if (tokens.length === 0) {
          res.status(200).send("No tokens to notify");
          return;
        }
      }

      // Build a cross‑platform message
      const multicast: admin.messaging.MulticastMessage = {
        tokens,
        notification: { title, body },
        android: {
          priority: "high",
          notification: {
            channelId: "default",
            sound: "default",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
            },
          },
        },
        data: data || {},
      };

      const response = await admin.messaging().sendEachForMulticast(multicast);
      console.log("sendEachForMulticast result", JSON.stringify(response));

      // Remove invalid tokens from Firestore if we addressed by recipientUserId
      if (recipientUserId && response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((r, idx) => {
          if (!r.success) {
            const code = (r.error as any)?.code || "";
            if (
              code.includes("registration-token-not-registered") ||
              code.includes("invalid-registration-token")
            ) {
              invalidTokens.push(tokens[idx]);
            }
          }
        });
        if (invalidTokens.length) {
          console.log("Pruning invalid tokens", invalidTokens);
          await admin
            .firestore()
            .collection("Users")
            .doc(recipientUserId)
            .update({ fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens) });
        }
      }

      res.status(200).json({ success: true, sent: response.successCount, failed: response.failureCount });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).send("Internal Server Error");
    }
  });
});

export * from "./cleanupUserData";
export * from "./deleteUserAccount";

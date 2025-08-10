import { setGlobalOptions } from "firebase-functions";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Set global options for performance/cost control
setGlobalOptions({ maxInstances: 10 });

// Initialize Firebase Admin SDK
admin.initializeApp();

// Cloud Function: HTTP endpoint to send push notification
export const sendPushNotification = functions.https.onRequest(
  async (req, res) => {
    try {
      const { token, title, body, data } = req.body;

      if (!token || !title || !body) {
        res.status(400).send("Missing required fields");
        return;
      }

      const message: admin.messaging.Message = {
        token,
        android: {
          notification: {
            title,
            body,
            channelId: "default", // This must match your Expo channel config
            sound: "default",
          },
          priority: "high",
        },
        data: data || {},
      };

      const response = await admin.messaging().send(message);
      console.log("Successfully sent message:", response);

      res.status(200).send("Notification sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

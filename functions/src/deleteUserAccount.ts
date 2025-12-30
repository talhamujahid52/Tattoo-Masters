import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

/**
 * HTTP Cloud Function to provide a URL for Account Deletion (Play Console Compliance).
 *
 * GET: Returns an HTML page with instructions on how to delete the account.
 * POST: API endpoint to programmatically delete a user (requires authentication).
 */
export const deleteUserAccount = functions.https.onRequest(async (req, res) => {
    // Handle CORS (optional if accessed directly in browser, but good practice)
    res.set("Access-Control-Allow-Origin", "*");

    if (req.method === "GET") {
        // 1. Compliance: Serve an HTML page with deletion instructions.
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Delete Account - Tattoo Masters</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            h1 { color: #000; }
            .container { border: 1px solid #ddd; padding: 30px; border-radius: 8px; background-color: #f9f9f9; }
            .button { display: inline-block; background-color: #d9534f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .note { font-size: 0.9em; color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Delete Your Account</h1>
            <p>We are sad to see you go. If you would like to delete your Tattoo Masters account and all associated data, please follow the steps below:</p>
            
            <h3>Option 1: In-App Deletion (Recommended)</h3>
            <ol>
              <li>Open the <strong>Tattoo Masters</strong> app.</li>
              <li>Navigate to <strong>Settings</strong> > <strong>Profile</strong>.</li>
              <li>Tap on <strong>Delete Account</strong>.</li>
              <li>Confirm your choice. Your data will be deleted immediately.</li>
            </ol>

            <h3>Option 2: Request via Support</h3>
            <p>If you cannot access the app, you may request account deletion by emailing our support team:</p>
            <p><strong>Email:</strong> <a href="mailto:support@tattoomasters.com">support@tattoomasters.com</a></p>
            <p>Please send the email from the address associated with your account, with the subject line "<strong>Account Deletion Request</strong>".</p>
            
            <p class="note"><strong>Data Safety:</strong> Upon processing your request, your account authentication credentials, personal profile information, and uploaded content will be permanently removed from our servers.</p>
          </div>
        </body>
      </html>
    `;
        res.status(200).send(html);
        return;
    }

    if (req.method === "POST") {
        // 2. Functionality: API to delete user (requires Admin auth or similar validation)
        // For simplicity and safety, we normally require an ID token here.

        // Check Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized. Missing or invalid Bearer token." });
            return;
        }

        const idToken = authHeader.split("Bearer ")[1];

        try {
            // Verify the token
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const uid = decodedToken.uid;

            // Delete the user from Firebase Authentication
            // This will trigger the 'cleanupUserData' background function (if deployed) to clean Firestore.
            await admin.auth().deleteUser(uid);

            res.status(200).json({ success: true, message: `User ${uid} deleted successfully.` });
        } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ error: "Failed to delete user.", details: error });
        }
        return;
    }

    // Method not allowed
    res.status(405).send("Method Not Allowed");
});

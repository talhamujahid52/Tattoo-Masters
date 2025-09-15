import auth from "@react-native-firebase/auth";

export type ChatNotificationPayload = {
  chatId: string;
  senderId: string;
  type?: string;
  url?: string;
};

// Send a chat push notification via HTTPS Cloud Function
export async function sendChatNotification(
  recipientUserId: string,
  title: string,
  body: string,
  data: ChatNotificationPayload
) {
  try {
    const url = "https://sendpushnotification-pal5tpsjyq-uc.a.run.app";
    const idToken = await auth().currentUser?.getIdToken?.();
    if (!idToken) {
      console.warn("No auth token; user must be signed in to send notifications");
      return;
    }
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ recipientUserId, title, body, data }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn("sendChatNotification failed:", res.status, text);
    }
  } catch (e) {
    console.warn("sendChatNotification error:", e);
  }
}

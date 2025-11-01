import auth from "@react-native-firebase/auth";

export type ChatNotificationPayload = {
  chatId: string;
  senderId: string;
  type?: string;
  url?: string;
};

type NotificationRequest = {
  recipientUserId?: string;
  token?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
};

const NOTIFICATION_ENDPOINT = "https://sendpushnotification-pal5tpsjyq-uc.a.run.app";

const sanitizeData = (data?: Record<string, any>): Record<string, string> | undefined => {
  if (!data) return undefined;
  const cleaned: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    cleaned[key] = typeof value === "string" ? value : JSON.stringify(value);
  });
  return Object.keys(cleaned).length ? cleaned : undefined;
};

async function postNotification(payload: NotificationRequest) {
  try {
    const idToken = await auth().currentUser?.getIdToken?.();
    if (!idToken) {
      console.warn("No auth token; user must be signed in to send notifications");
      return;
    }

    const res = await fetch(NOTIFICATION_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        ...payload,
        data: sanitizeData(payload.data),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn("sendPushNotification failed:", res.status, text);
    }
  } catch (error) {
    console.warn("sendPushNotification error:", error);
  }
}

// Send a chat push notification via HTTPS Cloud Function
export async function sendChatNotification(
  recipientUserId: string,
  title: string,
  body: string,
  data: ChatNotificationPayload
) {
  await postNotification({ recipientUserId, title, body, data });
}

export async function sendUserNotification(
  recipientUserId: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  await postNotification({ recipientUserId, title, body, data });
}

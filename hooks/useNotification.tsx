import { useEffect, useRef } from "react";
import messaging from "@react-native-firebase/messaging";
import firestore from "@react-native-firebase/firestore";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

// Ensure notification handler is set
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// One-time Android channel setup
const configureNotificationChannel = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
};

export const getFcmToken = async (): Promise<string | null> => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    console.log("FCM permission not granted");
    return null;
  }

  try {
    const token = await messaging().getToken();
    console.log("FCM Token:", token);
    return token;
  } catch (error) {
    console.log("Failed to get FCM token", error);
    return null;
  }
};

export const saveFcmTokenToFirestore = async (
  userId: string,
  token: string
) => {
  const userRef = firestore().collection("Users").doc(userId);
  const doc = await userRef.get();
  const existingTokens: string[] = doc.data()?.fcmTokens || [];

  if (!existingTokens.includes(token)) {
    await userRef.update({
      fcmTokens: firestore.FieldValue.arrayUnion(token),
    });
  }
};

export const removeFcmTokenFromFirestore = async (
  userId: string,
  token: string
) => {
  try {
    const userRef = firestore().collection("Users").doc(userId);
    await userRef.update({
      fcmTokens: firestore.FieldValue.arrayRemove(token),
    });
  } catch (err) {
    console.log("Failed to remove FCM token from Firestore", err);
  }
};

const listenForTokenRefresh = (userId: string) => {
  return messaging().onTokenRefresh(async (newToken) => {
    console.log("FCM token refreshed:", newToken);
    await saveFcmTokenToFirestore(userId, newToken);
  });
};

export const useNotificationListeners = ({
  onReceive,
  onRespond,
  showForegroundAlert = true,
}: {
  onReceive?: (notification: Notifications.Notification) => void;
  onRespond?: (response: Notifications.NotificationResponse) => void;
  showForegroundAlert?: boolean;
}) => {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        onReceive?.(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        onRespond?.(response);
      });

    // Ensure foreground messages display a system notification banner
    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
      try {
        if (!showForegroundAlert) return;
        const title = remoteMessage.notification?.title || "";
        const body = remoteMessage.notification?.body || "";
        const data = (remoteMessage.data as any) || {};
        await Notifications.presentNotificationAsync({
          title,
          body,
          data,
          android: { channelId: "default" as any },
        });
      } catch (e) {
        // no-op
      }
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
      unsubscribeOnMessage();
    };
  }, [showForegroundAlert]);
};

export const useNotification = (userId?: string) => {
  useEffect(() => {
    if (!userId) return;

    const init = async () => {
      // Ensure notification permissions are granted at the OS level
      try {
        const settings = await Notifications.getPermissionsAsync();
        if (!settings.granted) {
          await Notifications.requestPermissionsAsync();
        }
      } catch {}

      await configureNotificationChannel();

      const token = await getFcmToken();
      if (token) {
        await saveFcmTokenToFirestore(userId, token);
      }
    };

    init();

    const unsubscribe = listenForTokenRefresh(userId);
    return () => unsubscribe();
  }, [userId]);
};

// Clear FCM token on logout to stop receiving notifications on this device
export const clearFcmTokenOnLogout = async (userId?: string) => {
  try {
    if (!userId) return;
    // Get current token if any
    let token: string | null = null;
    try {
      token = await messaging().getToken();
    } catch (e) {
      // ignore inability to fetch token
    }
    if (token) {
      await removeFcmTokenFromFirestore(userId, token);
    }
    // Invalidate token on device
    try {
      await messaging().deleteToken();
      console.log("FCM token deleted on device");
    } catch (e) {
      console.log("Failed to delete FCM token on device", e);
    }
  } catch (err) {
    console.log("Error during FCM logout cleanup", err);
  }
};

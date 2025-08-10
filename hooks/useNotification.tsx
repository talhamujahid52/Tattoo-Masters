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

const listenForTokenRefresh = (userId: string) => {
  return messaging().onTokenRefresh(async (newToken) => {
    console.log("FCM token refreshed:", newToken);
    await saveFcmTokenToFirestore(userId, newToken);
  });
};

export const useNotificationListeners = ({
  onReceive,
  onRespond,
}: {
  onReceive?: (notification: Notifications.Notification) => void;
  onRespond?: (response: Notifications.NotificationResponse) => void;
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

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
};

export const useNotification = (userId?: string) => {
  useEffect(() => {
    if (!userId) return;

    const init = async () => {
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

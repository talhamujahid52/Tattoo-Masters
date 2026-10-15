import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import firestore from "@react-native-firebase/firestore";

// Keeps the signed-in user's isOnline/lastSeen current. Mounted at the app
// root so presence is tracked on every screen, not just the Chat tab.
const useLastSeen = (userId?: string | null) => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!userId) return;

    const userRef = firestore().collection("Users").doc(userId);

    // lastSeen is written on both transitions so a user who is online right
    // now still has one once they leave.
    const setPresence = (isOnline: boolean) =>
      userRef
        .update({
          isOnline,
          lastSeen: firestore.FieldValue.serverTimestamp(),
        })
        .catch((error) => {
          console.warn("Error updating presence", error);
        });

    if (appState.current === "active") setPresence(true);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const prevState = appState.current;
      appState.current = nextAppState;

      if (prevState === "active" && (nextAppState === "background" || nextAppState === "inactive")) {
        setPresence(false);
      } else if (nextAppState === "active" && prevState !== "active") {
        setPresence(true);
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
      setPresence(false);
    };
  }, [userId]);
};

export default useLastSeen;

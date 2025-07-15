import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const useLastSeen = () => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const userRef = firestore().collection("Users").doc(user.uid);

    // On mount: set user online
    userRef.update({ isOnline: true });

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const prevState = appState.current;
      appState.current = nextAppState;

      if (prevState === "active" && (nextAppState === "background" || nextAppState === "inactive")) {
        try {
          await userRef.update({
            lastSeen: firestore.FieldValue.serverTimestamp(),
            isOnline: false,
          });
        } catch (error) {
          console.warn("Error updating lastSeen and isOnline", error);
        }
      } else if (nextAppState === "active") {
        try {
          await userRef.update({ isOnline: true });
        } catch (error) {
          console.warn("Error updating isOnline to true", error);
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      // On unmount: mark user offline
      userRef.update({
        lastSeen: firestore.FieldValue.serverTimestamp(),
        isOnline: false,
      });

      subscription.remove();
    };
  }, []);
};

export default useLastSeen;

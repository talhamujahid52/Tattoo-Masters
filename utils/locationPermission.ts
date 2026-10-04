import { AppState, Platform } from "react-native";
import * as Location from "expo-location";

// How long to wait for the system prompt to appear before assuming there is none.
const NO_PROMPT_TIMEOUT_MS = 1000;

let inFlightRequest: Promise<Location.LocationPermissionResponse> | null = null;

const requestOnce = () => {
  if (!inFlightRequest) {
    inFlightRequest = Location.requestForegroundPermissionsAsync().finally(
      () => {
        inFlightRequest = null;
      },
    );
  }
  return inFlightRequest;
};

/**
 * Use this instead of Location.requestForegroundPermissionsAsync().
 *
 * Newer Android versions (seen on Android 17) answer a permission request
 * straight away, without opening the system prompt, when there is nothing to
 * ask (e.g. the permission is already granted). React Native only hands that
 * answer back to JS on the next activity resume, which never comes because the
 * activity was never paused, so the request promise hangs and every later
 * request queues up behind it.
 *
 * To stay clear of that we only request when the permission is not granted
 * yet, share a single request between concurrent callers, and stop waiting if
 * no prompt showed up.
 */
export const requestForegroundLocationPermission =
  async (): Promise<Location.LocationPermissionResponse> => {
    const current = await Location.getForegroundPermissionsAsync();
    if (current.granted) return current;

    const request = requestOnce();
    if (Platform.OS !== "android") return request;

    // A real prompt pauses the activity, which moves AppState out of "active".
    let promptShown = AppState.currentState !== "active";
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") promptShown = true;
    });
    let timer: ReturnType<typeof setTimeout> | undefined;
    const noPrompt = new Promise<Location.LocationPermissionResponse>(
      (resolve) => {
        timer = setTimeout(() => {
          if (promptShown) return;
          Location.getForegroundPermissionsAsync().then(resolve, () =>
            resolve(current),
          );
        }, NO_PROMPT_TIMEOUT_MS);
      },
    );

    try {
      return await Promise.race([request, noPrompt]);
    } finally {
      clearTimeout(timer);
      subscription.remove();
    }
  };

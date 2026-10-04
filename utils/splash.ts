import { SplashScreen } from "expo-router";

type Listener = (visible: boolean) => void;

let visible = true;
const listeners = new Set<Listener>();

/** Whether the in-app splash overlay (see components/AppSplash.tsx) is still showing. */
export const isSplashVisible = () => visible;

export function subscribeSplash(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Hides the native splash screen and then the in-app splash overlay.
 * On Android the native splash is limited to a small system-masked icon, so the
 * overlay is what actually shows the full-size logo until the app is ready.
 */
export async function hideSplash() {
  try {
    await SplashScreen.hideAsync();
  } catch {
    // Already hidden or never shown; nothing to do.
  }
  if (!visible) return;
  visible = false;
  listeners.forEach((listener) => listener(false));
}

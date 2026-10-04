import React, { useMemo } from "react";
import { Platform, View } from "react-native";
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

/**
 * Keeps the whole app above Android's system navigation bar.
 *
 * Apps targeting SDK 35+ are forced edge-to-edge on Android 15+, so the
 * window extends underneath the navigation bar. With 3-button navigation the
 * bar is tall enough to cover bottom buttons, bottom sheets and the end of
 * scroll views on every screen that does not pad for it itself.
 *
 * Padding once here restores the layout older Android versions get, where
 * the window simply ends above the bar. The bottom inset is then reported as
 * 0 to everything below, so screens that already add `insets.bottom` do not
 * pad twice. The inset is measured from the real overlap, so it is already 0
 * (and this is a no-op) whenever the window is not drawn under the bar.
 * iOS is left untouched.
 */
export default function AndroidNavigationBarInset({
  children,
}: {
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const contentInsets = useMemo(() => ({ ...insets, bottom: 0 }), [insets]);

  if (Platform.OS !== "android") return <>{children}</>;

  return (
    <View
      style={{ flex: 1, backgroundColor: "#000", paddingBottom: insets.bottom }}
    >
      <SafeAreaInsetsContext.Provider value={contentInsets}>
        {children}
      </SafeAreaInsetsContext.Provider>
    </View>
  );
}

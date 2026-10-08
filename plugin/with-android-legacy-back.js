const { createRunOncePlugin, withAndroidManifest } = require("@expo/config-plugins");

// Apps targeting SDK 36 get predictive back by default on Android 16, which
// stops the system calling Activity.onBackPressed(). React Native 0.76 still
// relies on it for BackHandler, so without this opt-out the hardware back
// button exits the app instead of navigating back.
const withAndroidLegacyBack = (config) =>
  withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];

    if (!application) {
      throw new Error("Android application manifest is missing.");
    }

    application.$["android:enableOnBackInvokedCallback"] = "false";

    return config;
  });

module.exports = createRunOncePlugin(
  withAndroidLegacyBack,
  "with-android-legacy-back",
  "1.0.0"
);

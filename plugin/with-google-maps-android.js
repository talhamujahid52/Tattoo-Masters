const { createRunOncePlugin, withAndroidManifest } = require("@expo/config-plugins");

const withGoogleMapsAndroid = (config, { googleMapsApiKey }) =>
  withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];

    if (!application) {
      throw new Error("Android application manifest is missing.");
    }

    const name = "com.google.android.geo.API_KEY";
    const existing = (application["meta-data"] ?? []).find(
      (entry) => entry.$?.["android:name"] === name
    );

    if (existing) {
      existing.$["android:value"] = googleMapsApiKey;
    } else {
      application["meta-data"] = [
        ...(application["meta-data"] ?? []),
        { $: { "android:name": name, "android:value": googleMapsApiKey } },
      ];
    }

    return config;
  });

module.exports = createRunOncePlugin(
  withGoogleMapsAndroid,
  "with-google-maps-android",
  "1.0.0"
);

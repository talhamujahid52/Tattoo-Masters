const {
    withStringsXml,
    withAndroidManifest,
    withAppBuildGradle,
    withProjectBuildGradle,
    createRunOncePlugin,
  } = require("@expo/config-plugins");
  
  const FACEBOOK_APP_ID = "3768254563474647"; // 🔁 Replace with your actual ID
  const FACEBOOK_CLIENT_TOKEN = "2ad4cce3ee5552af0dacc10b9d94bbd4"; // 🔁 Replace with your actual token
  
  const withFacebookStrings = (config) => {
    return withStringsXml(config, async (config) => {
      config.modResults = await ensureFacebookStrings(config.modResults);
      return config;
    });
  };
  
  async function ensureFacebookStrings(strings) {
    const stringItems = [
      { name: "facebook_app_id", value: FACEBOOK_APP_ID },
      { name: "facebook_client_token", value: FACEBOOK_CLIENT_TOKEN },
      { name: "fb_login_protocol_scheme", value: `fb${FACEBOOK_APP_ID}` },
    ];
  
    stringItems.forEach((item) => {
      const exists = strings.resources.string?.some(
        (str) => str.$.name === item.name
      );
      if (!exists) {
        strings.resources.string = [
          ...(strings.resources.string || []),
          { _: item.value, $: { name: item.name } },
        ];
      }
    });
  
    return strings;
  }
  
  const withFacebookAndroidManifest = (config) => {
    return withAndroidManifest(config, (config) => {
      const manifest = config.modResults.manifest;
  
      // Ensure tools namespace is included in the manifest tag
      if (!manifest.$["xmlns:tools"]) {
        manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
      }
  
      const app = manifest.application[0];
  
      // Meta-data
      const metaData = [
        {
          $: {
            "android:name": "com.facebook.sdk.ApplicationId",
            "android:value": "@string/facebook_app_id",
          },
        },
        {
          $: {
            "android:name": "com.facebook.sdk.ClientToken",
            "android:value": "@string/facebook_client_token",
          },
        },
      ];
      app["meta-data"] = [...(app["meta-data"] || []), ...metaData];
  
      // FacebookActivity
      app.activity = [
        ...(app.activity || []),
        {
          $: {
            "android:name": "com.facebook.FacebookActivity",
            "android:configChanges":
              "keyboard|keyboardHidden|screenLayout|screenSize|orientation",
            "android:label": "@string/app_name",
          },
        },
        {
          $: {
            "android:name": "com.facebook.CustomTabActivity",
            "android:exported": "true",
          },
          "intent-filter": [
            {
              action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
              category: [
                { $: { "android:name": "android.intent.category.DEFAULT" } },
                { $: { "android:name": "android.intent.category.BROWSABLE" } },
              ],
              data: [
                {
                  $: {
                    "android:scheme": "@string/fb_login_protocol_scheme",
                  },
                },
              ],
            },
          ],
        },
      ];
  
      // Permissions
      manifest["uses-permission"] = [
        ...(manifest["uses-permission"] || []),
        {
          $: {
            "android:name": "com.google.android.gms.permission.AD_ID",
            "tools:node": "remove",
          },
        },
      ];
  
      return config;
    });
  };
  
  const withFacebookAppBuildGradle = (config) => {
    return withAppBuildGradle(config, (config) => {
      if (!config.modResults.contents.includes("facebook-android-sdk")) {
        config.modResults.contents = config.modResults.contents.replace(
          /dependencies\s?{/,
          `dependencies {
        implementation 'com.facebook.android:facebook-android-sdk:latest.release'`
        );
      }
      return config;
    });
  };
  
  const withFacebookProjectBuildGradle = (config) => {
    return withProjectBuildGradle(config, (config) => {
      if (!config.modResults.contents.includes("mavenCentral()")) {
        config.modResults.contents = config.modResults.contents.replace(
          /allprojects\s*{\s*repositories\s*{/,
          `allprojects {
        repositories {
            mavenCentral()`
        );
      }
      return config;
    });
  };
  
  const withFacebookFBSdkNext = (config) => {
    config = withFacebookStrings(config);
    config = withFacebookAndroidManifest(config);
    config = withFacebookAppBuildGradle(config);
    config = withFacebookProjectBuildGradle(config);
    return config;
  };
  
  // Ensures the plugin only runs once per build
  module.exports = createRunOncePlugin(
    withFacebookFBSdkNext,
    "with-facebook-fbsdk-next",
    "1.0.0"
  );
  
const { withInfoPlist, createRunOncePlugin } = require("@expo/config-plugins");

const withoutIOSUserTracking = (config) => {
  if (config.ios?.infoPlist) {
    delete config.ios.infoPlist.NSUserTrackingUsageDescription;
  }

  return withInfoPlist(config, (config) => {
    delete config.modResults.NSUserTrackingUsageDescription;
    return config;
  });
};

module.exports = createRunOncePlugin(
  withoutIOSUserTracking,
  "without-ios-user-tracking",
  "1.0.0"
);

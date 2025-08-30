const {
  withInfoPlist,
  withAppDelegate,
  createRunOncePlugin,
} = require("@expo/config-plugins");

const FACEBOOK_APP_ID = "3768254563474647"; // 🔁 Replace with your actual App ID
const FACEBOOK_CLIENT_TOKEN = "2ad4cce3ee5552af0dacc10b9d94bbd4"; // 🔁 Replace with your actual Client Token
const FACEBOOK_APP_NAME = "Tattoo Masters"; // 🔁 Replace with your actual app name

const withFacebookInfoPlist = (config) => {
  return withInfoPlist(config, (config) => {
    const plist = config.modResults;

    // Add Facebook-related configuration to Info.plist
    plist.CFBundleURLTypes = plist.CFBundleURLTypes || [];
    plist.CFBundleURLTypes.push({
      CFBundleURLSchemes: [`fb${FACEBOOK_APP_ID}`],
    });

    plist.FacebookAppID = FACEBOOK_APP_ID;
    plist.FacebookClientToken = FACEBOOK_CLIENT_TOKEN;
    plist.FacebookDisplayName = FACEBOOK_APP_NAME;

    plist.LSApplicationQueriesSchemes = plist.LSApplicationQueriesSchemes || [];
    plist.LSApplicationQueriesSchemes.push("fbapi", "fb-messenger-share-api");

    return config;
  });
};

const withFacebookAppDelegate = (config) => {
  return withAppDelegate(config, (config) => {
    const appDelegateFile = config.modResults;

    // 1. Add the required imports
    if (
      !appDelegateFile.contents.includes(
        "#import <AuthenticationServices/AuthenticationServices.h>"
      )
    ) {
      appDelegateFile.contents = appDelegateFile.contents.replace(
        "#import <React/RCTLinkingManager.h>",
        `#import <React/RCTLinkingManager.h>
#import <AuthenticationServices/AuthenticationServices.h>`
      );
    }

    if (
      !appDelegateFile.contents.includes(
        "#import <SafariServices/SafariServices.h>"
      )
    ) {
      appDelegateFile.contents = appDelegateFile.contents.replace(
        "#import <AuthenticationServices/AuthenticationServices.h>",
        `#import <AuthenticationServices/AuthenticationServices.h>
#import <SafariServices/SafariServices.h>`
      );
    }

    if (
      !appDelegateFile.contents.includes(
        "#import <FBSDKCoreKit/FBSDKCoreKit-Swift.h>"
      )
    ) {
      appDelegateFile.contents = appDelegateFile.contents.replace(
        "#import <SafariServices/SafariServices.h>",
        `#import <SafariServices/SafariServices.h>
#import <FBSDKCoreKit/FBSDKCoreKit-Swift.h>`
      );
    }

    // 2. Add Facebook initialization in didFinishLaunchingWithOptions
    if (
      !appDelegateFile.contents.includes(
        "FBSDKApplicationDelegate sharedInstance"
      )
    ) {
      appDelegateFile.contents = appDelegateFile.contents.replace(
        "// @generated end @react-native-firebase/app-didFinishLaunchingWithOptions",
        `// @generated end @react-native-firebase/app-didFinishLaunchingWithOptions
  [[FBSDKApplicationDelegate sharedInstance] application:application
                       didFinishLaunchingWithOptions:launchOptions];`
      );
    }

    // 3. Add Facebook handling to openURL method
    if (
      !appDelegateFile.contents.includes(
        "FBSDKApplicationDelegate sharedInstance] application:application openURL:url"
      )
    ) {
      appDelegateFile.contents = appDelegateFile.contents.replace(
        "// @generated end @react-native-firebase/auth-openURL",
        `// @generated end @react-native-firebase/auth-openURL

  if ([[FBSDKApplicationDelegate sharedInstance] application:application openURL:url options:options]) {
    return YES;
  }`
      );
    }

    return config;
  });
};

const withFacebookIOS = (config) => {
  config = withFacebookInfoPlist(config);
  config = withFacebookAppDelegate(config);
  return config;
};

module.exports = createRunOncePlugin(
  withFacebookIOS,
  "with-facebook-ios",
  "1.0.0"
);

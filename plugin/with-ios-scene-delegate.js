const {
  withAppDelegate,
  withInfoPlist,
  createRunOncePlugin,
} = require("@expo/config-plugins");

// Apps linked against the iOS 27 SDK (Xcode 27) must adopt the UIScene lifecycle or
// UIKit traps at launch in _UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption.
// React Native 0.76 / Expo SDK 52 are still AppDelegate-based, so this plugin adds a
// minimal SceneDelegate that attaches the AppDelegate's window to the scene and forwards
// URL, user-activity and lifecycle events back to the AppDelegate.
//
// It also exposes the launch URL to JS through the SceneLaunchURL native module:
// under the scene lifecycle a cold-start link arrives in the scene's connection
// options instead of launchOptions, so React Native's Linking.getInitialURL()
// comes back empty. app/AppNavigator.tsx falls back to this module.

const BEGIN = "// @generated begin with-ios-scene-delegate";
const END = "// @generated end with-ios-scene-delegate";

const SCENE_DELEGATE = `
${BEGIN}
#import <React/RCTBridgeModule.h>
#import <React/RCTUtils.h>

// The URL this process was launched with, if any. Set from the scene's
// connection options before the launch is forwarded to the AppDelegate.
static NSURL *gSceneLaunchURL = nil;

@interface SceneLaunchURL : NSObject <RCTBridgeModule>
@end

@implementation SceneLaunchURL

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

RCT_EXPORT_METHOD(getInitialURL:(RCTPromiseResolveBlock)resolve reject:(__unused RCTPromiseRejectBlock)reject)
{
  resolve(RCTNullIfNil(gSceneLaunchURL.absoluteString));
}

@end

@interface SceneDelegate : UIResponder <UIWindowSceneDelegate>
@property (nonatomic, strong, nullable) UIWindow *window;
@end

@implementation SceneDelegate

- (AppDelegate *)appDelegate
{
  return (AppDelegate *)[UIApplication sharedApplication].delegate;
}

- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions
{
  if (![scene isKindOfClass:[UIWindowScene class]]) {
    return;
  }
  UIWindowScene *windowScene = (UIWindowScene *)scene;
  AppDelegate *appDelegate = [self appDelegate];
  UIApplication *application = [UIApplication sharedApplication];

  // RCTAppDelegate already created the window in didFinishLaunchingWithOptions;
  // attach it to this scene so it becomes visible.
  UIWindow *window = appDelegate.window;
  if (window == nil) {
    window = [[UIWindow alloc] initWithWindowScene:windowScene];
    appDelegate.window = window;
  }
  window.windowScene = windowScene;
  self.window = window;
  [window makeKeyAndVisible];

  // Cold-start deep links no longer arrive in launchOptions. Remember the URL
  // for Linking's getInitialURL replacement, then forward the launch so the
  // usual AppDelegate handlers still run.
  for (UIOpenURLContext *context in connectionOptions.URLContexts) {
    gSceneLaunchURL = context.URL;
    [appDelegate application:application openURL:context.URL options:@{}];
  }
  for (NSUserActivity *activity in connectionOptions.userActivities) {
    if ([activity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb] && activity.webpageURL != nil) {
      gSceneLaunchURL = activity.webpageURL;
    }
    [appDelegate application:application continueUserActivity:activity restorationHandler:^(NSArray<id<UIUserActivityRestoring>> *_Nullable restorableObjects) {}];
  }
}

- (void)scene:(UIScene *)scene openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts
{
  UIApplication *application = [UIApplication sharedApplication];
  for (UIOpenURLContext *context in URLContexts) {
    NSMutableDictionary<UIApplicationOpenURLOptionsKey, id> *options = [NSMutableDictionary new];
    if (context.options.sourceApplication != nil) {
      options[UIApplicationOpenURLOptionsSourceApplicationKey] = context.options.sourceApplication;
    }
    if (context.options.annotation != nil) {
      options[UIApplicationOpenURLOptionsAnnotationKey] = context.options.annotation;
    }
    options[UIApplicationOpenURLOptionsOpenInPlaceKey] = @(context.options.openInPlace);
    [[self appDelegate] application:application openURL:context.URL options:options];
  }
}

- (void)scene:(UIScene *)scene continueUserActivity:(NSUserActivity *)userActivity
{
  [[self appDelegate] application:[UIApplication sharedApplication]
             continueUserActivity:userActivity
               restorationHandler:^(NSArray<id<UIUserActivityRestoring>> *_Nullable restorableObjects) {}];
}

- (void)sceneDidBecomeActive:(UIScene *)scene
{
  id<UIApplicationDelegate> appDelegate = [self appDelegate];
  if ([appDelegate respondsToSelector:@selector(applicationDidBecomeActive:)]) {
    [appDelegate applicationDidBecomeActive:[UIApplication sharedApplication]];
  }
}

- (void)sceneWillResignActive:(UIScene *)scene
{
  id<UIApplicationDelegate> appDelegate = [self appDelegate];
  if ([appDelegate respondsToSelector:@selector(applicationWillResignActive:)]) {
    [appDelegate applicationWillResignActive:[UIApplication sharedApplication]];
  }
}

- (void)sceneWillEnterForeground:(UIScene *)scene
{
  id<UIApplicationDelegate> appDelegate = [self appDelegate];
  if ([appDelegate respondsToSelector:@selector(applicationWillEnterForeground:)]) {
    [appDelegate applicationWillEnterForeground:[UIApplication sharedApplication]];
  }
}

- (void)sceneDidEnterBackground:(UIScene *)scene
{
  id<UIApplicationDelegate> appDelegate = [self appDelegate];
  if ([appDelegate respondsToSelector:@selector(applicationDidEnterBackground:)]) {
    [appDelegate applicationDidEnterBackground:[UIApplication sharedApplication]];
  }
}

@end
${END}
`;

const withSceneDelegateAppDelegate = (config) =>
  withAppDelegate(config, (config) => {
    const file = config.modResults;
    if (file.language !== "objcpp" && file.language !== "objc") {
      throw new Error(
        `with-ios-scene-delegate: expected an Objective-C AppDelegate, got ${file.language}`
      );
    }
    // An earlier version of the block may already be in a generated ios/
    // folder (prebuild without --clean keeps it); swap it for the current one.
    const existingStart = file.contents.indexOf(BEGIN);
    if (existingStart !== -1) {
      const existingEndMarker = file.contents.indexOf(END, existingStart);
      if (existingEndMarker === -1) {
        throw new Error("with-ios-scene-delegate: found the begin marker without an end marker in AppDelegate");
      }
      const existingEnd = existingEndMarker + END.length;
      file.contents =
        file.contents.slice(0, existingStart) + SCENE_DELEGATE.trim() + file.contents.slice(existingEnd);
      return config;
    }
    const lastEnd = file.contents.lastIndexOf("@end");
    if (lastEnd === -1) {
      throw new Error("with-ios-scene-delegate: could not find @end in AppDelegate");
    }
    const insertAt = lastEnd + "@end".length;
    file.contents =
      file.contents.slice(0, insertAt) + "\n" + SCENE_DELEGATE + file.contents.slice(insertAt);
    return config;
  });

const withSceneManifest = (config) =>
  withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: "SceneDelegate",
          },
        ],
      },
    };
    return config;
  });

const withIosSceneDelegate = (config) => {
  config = withSceneDelegateAppDelegate(config);
  config = withSceneManifest(config);
  return config;
};

module.exports = createRunOncePlugin(
  withIosSceneDelegate,
  "with-ios-scene-delegate",
  "1.1.0"
);

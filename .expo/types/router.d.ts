/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)/Login` | `/(auth)/Register` | `/(auth)/SetPassword` | `/(auth)/Verification` | `/(auth)/Welcome` | `/(bottomTabs)` | `/(bottomTabs)/Chat` | `/(bottomTabs)/Home` | `/(bottomTabs)/Likes` | `/(bottomTabs)/Maps` | `/(bottomTabs)/Search` | `/Chat` | `/DummyScreen` | `/Home` | `/Likes` | `/Login` | `/Maps` | `/Register` | `/Search` | `/SetPassword` | `/Verification` | `/Welcome` | `/_sitemap`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}

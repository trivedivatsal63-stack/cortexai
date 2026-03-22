/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/blog` | `/(tabs)/explore` | `/(tabs)/profile` | `/_sitemap` | `/blog` | `/explore` | `/profile`;
      DynamicRoutes: `/blog/${Router.SingleRoutePart<T>}` | `/chat/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/blog/[slug]` | `/chat/[id]`;
    }
  }
}

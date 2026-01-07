// apps/v2/src/utils/platform.ts

/**
 * Platform detection utilities
 * Migrated from: vendor/desktop/webapp/channels/src/utils/user_agent.tsx
 *
 * NOTE: Original implementation used browser user agent parsing.
 * React Native uses the Platform API for native detection.
 */

import { Platform } from "react-native";

//#region Platform Types

export type IPlatformOS = "ios" | "android" | "windows" | "macos" | "web";

export type IPlatformInfo = {
  os: IPlatformOS;
  version: string | number;
  isIos: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isWeb: boolean;
};

//#endregion

//#region Core Platform Detection

/**
 * Check if running on iOS
 */
export function isIos(): boolean {
  return Platform.OS === "ios";
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return Platform.OS === "android";
}

/**
 * Check if running on a mobile platform (iOS or Android)
 */
export function isMobile(): boolean {
  return Platform.OS === "ios" || Platform.OS === "android";
}

/**
 * Check if running on web platform
 */
export function isWeb(): boolean {
  return Platform.OS === "web";
}

//#endregion

//#region Desktop Detection (Tauri)

/**
 * Check if running as a desktop app (Tauri)
 * In React Native context, this checks for macos/windows platforms
 */
export function isDesktopApp(): boolean {
  return Platform.OS === "macos" || Platform.OS === "windows";
}

/**
 * Check if running on Windows desktop
 */
export function isWindows(): boolean {
  return Platform.OS === "windows";
}

/**
 * Check if running on macOS desktop
 */
export function isMac(): boolean {
  return Platform.OS === "macos";
}

/**
 * Check if running Windows desktop app
 */
export function isWindowsApp(): boolean {
  return isDesktopApp() && isWindows();
}

/**
 * Check if running macOS desktop app
 */
export function isMacApp(): boolean {
  return isDesktopApp() && isMac();
}

//#endregion

//#region Platform Version

/**
 * Get the current platform version
 * Returns OS version on mobile, empty string on web/desktop
 */
export function getPlatformVersion(): string | number {
  return Platform.Version;
}

/**
 * Check if iOS version is at least the specified version
 */
export function isIosVersionAtLeast(version: number): boolean {
  if (!isIos()) {
    return false;
  }
  const currentVersion =
    typeof Platform.Version === "string"
      ? parseFloat(Platform.Version)
      : Platform.Version;
  return currentVersion >= version;
}

/**
 * Check if Android API level is at least the specified level
 */
export function isAndroidApiLevelAtLeast(apiLevel: number): boolean {
  if (!isAndroid()) {
    return false;
  }
  const currentApiLevel =
    typeof Platform.Version === "number"
      ? Platform.Version
      : parseInt(String(Platform.Version), 10);
  return currentApiLevel >= apiLevel;
}

//#endregion

//#region Platform Info

/**
 * Get comprehensive platform information
 */
export function getPlatformInfo(): IPlatformInfo {
  const os = Platform.OS as IPlatformOS;

  return {
    os,
    version: Platform.Version,
    isIos: isIos(),
    isAndroid: isAndroid(),
    isMobile: isMobile(),
    isDesktop: isDesktopApp(),
    isWeb: isWeb(),
  };
}

//#endregion

//#region Platform Select

/**
 * Select a value based on the current platform
 * Type-safe wrapper around Platform.select
 */
export function platformSelect<T>(options: {
  ios?: T;
  android?: T;
  native?: T;
  web?: T;
  default: T;
}): T {
  return Platform.select({
    ios: options.ios,
    android: options.android,
    native: options.native,
    web: options.web,
    default: options.default,
  }) as T;
}

//#endregion

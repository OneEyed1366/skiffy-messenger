// apps/v2/src/utils/platform.spec.ts

import { Platform } from "react-native";

import {
  isIos,
  isAndroid,
  isMobile,
  isWeb,
  isDesktopApp,
  isWindows,
  isMac,
  isWindowsApp,
  isMacApp,
  getPlatformVersion,
  isIosVersionAtLeast,
  isAndroidApiLevelAtLeast,
  getPlatformInfo,
  platformSelect,
} from "./platform";

describe("Platform Utils", () => {
  const originalPlatform = Platform.OS;
  const originalVersion = Platform.Version;

  afterEach(() => {
    // Reset Platform mock
    Object.defineProperty(Platform, "OS", {
      value: originalPlatform,
      writable: true,
    });
    Object.defineProperty(Platform, "Version", {
      value: originalVersion,
      writable: true,
    });
  });

  //#region iOS Detection

  describe("isIos", () => {
    it("returns true on iOS", () => {
      Object.defineProperty(Platform, "OS", { value: "ios", writable: true });
      expect(isIos()).toBe(true);
    });

    it("returns false on Android", () => {
      Object.defineProperty(Platform, "OS", {
        value: "android",
        writable: true,
      });
      expect(isIos()).toBe(false);
    });

    it("returns false on web", () => {
      Object.defineProperty(Platform, "OS", { value: "web", writable: true });
      expect(isIos()).toBe(false);
    });
  });

  //#endregion

  //#region Android Detection

  describe("isAndroid", () => {
    it("returns true on Android", () => {
      Object.defineProperty(Platform, "OS", {
        value: "android",
        writable: true,
      });
      expect(isAndroid()).toBe(true);
    });

    it("returns false on iOS", () => {
      Object.defineProperty(Platform, "OS", { value: "ios", writable: true });
      expect(isAndroid()).toBe(false);
    });

    it("returns false on web", () => {
      Object.defineProperty(Platform, "OS", { value: "web", writable: true });
      expect(isAndroid()).toBe(false);
    });
  });

  //#endregion

  //#region Mobile Detection

  describe("isMobile", () => {
    it("returns true on iOS", () => {
      Object.defineProperty(Platform, "OS", { value: "ios", writable: true });
      expect(isMobile()).toBe(true);
    });

    it("returns true on Android", () => {
      Object.defineProperty(Platform, "OS", {
        value: "android",
        writable: true,
      });
      expect(isMobile()).toBe(true);
    });

    it("returns false on web", () => {
      Object.defineProperty(Platform, "OS", { value: "web", writable: true });
      expect(isMobile()).toBe(false);
    });

    it("returns false on macOS", () => {
      Object.defineProperty(Platform, "OS", { value: "macos", writable: true });
      expect(isMobile()).toBe(false);
    });
  });

  //#endregion

  //#region Web Detection

  describe("isWeb", () => {
    it("returns true on web", () => {
      Object.defineProperty(Platform, "OS", { value: "web", writable: true });
      expect(isWeb()).toBe(true);
    });

    it("returns false on iOS", () => {
      Object.defineProperty(Platform, "OS", { value: "ios", writable: true });
      expect(isWeb()).toBe(false);
    });

    it("returns false on Android", () => {
      Object.defineProperty(Platform, "OS", {
        value: "android",
        writable: true,
      });
      expect(isWeb()).toBe(false);
    });
  });

  //#endregion

  //#region Desktop Detection

  describe("isDesktopApp", () => {
    it("returns true on macOS", () => {
      Object.defineProperty(Platform, "OS", { value: "macos", writable: true });
      expect(isDesktopApp()).toBe(true);
    });

    it("returns true on Windows", () => {
      Object.defineProperty(Platform, "OS", {
        value: "windows",
        writable: true,
      });
      expect(isDesktopApp()).toBe(true);
    });

    it("returns false on iOS", () => {
      Object.defineProperty(Platform, "OS", { value: "ios", writable: true });
      expect(isDesktopApp()).toBe(false);
    });

    it("returns false on Android", () => {
      Object.defineProperty(Platform, "OS", {
        value: "android",
        writable: true,
      });
      expect(isDesktopApp()).toBe(false);
    });

    it("returns false on web", () => {
      Object.defineProperty(Platform, "OS", { value: "web", writable: true });
      expect(isDesktopApp()).toBe(false);
    });
  });

  describe("isWindows", () => {
    it("returns true on Windows", () => {
      Object.defineProperty(Platform, "OS", {
        value: "windows",
        writable: true,
      });
      expect(isWindows()).toBe(true);
    });

    it("returns false on macOS", () => {
      Object.defineProperty(Platform, "OS", { value: "macos", writable: true });
      expect(isWindows()).toBe(false);
    });
  });

  describe("isMac", () => {
    it("returns true on macOS", () => {
      Object.defineProperty(Platform, "OS", { value: "macos", writable: true });
      expect(isMac()).toBe(true);
    });

    it("returns false on Windows", () => {
      Object.defineProperty(Platform, "OS", {
        value: "windows",
        writable: true,
      });
      expect(isMac()).toBe(false);
    });
  });

  describe("isWindowsApp", () => {
    it("returns true on Windows desktop", () => {
      Object.defineProperty(Platform, "OS", {
        value: "windows",
        writable: true,
      });
      expect(isWindowsApp()).toBe(true);
    });

    it("returns false on macOS desktop", () => {
      Object.defineProperty(Platform, "OS", { value: "macos", writable: true });
      expect(isWindowsApp()).toBe(false);
    });
  });

  describe("isMacApp", () => {
    it("returns true on macOS desktop", () => {
      Object.defineProperty(Platform, "OS", { value: "macos", writable: true });
      expect(isMacApp()).toBe(true);
    });

    it("returns false on Windows desktop", () => {
      Object.defineProperty(Platform, "OS", {
        value: "windows",
        writable: true,
      });
      expect(isMacApp()).toBe(false);
    });
  });

  //#endregion

  //#region Version Checks

  describe("getPlatformVersion", () => {
    it("returns Platform.Version", () => {
      Object.defineProperty(Platform, "Version", {
        value: "16.0",
        writable: true,
      });
      expect(getPlatformVersion()).toBe("16.0");
    });

    it("returns number version on Android", () => {
      Object.defineProperty(Platform, "Version", { value: 33, writable: true });
      expect(getPlatformVersion()).toBe(33);
    });
  });

  describe("isIosVersionAtLeast", () => {
    it("returns true when iOS version is sufficient (string)", () => {
      Object.defineProperty(Platform, "OS", { value: "ios", writable: true });
      Object.defineProperty(Platform, "Version", {
        value: "16.0",
        writable: true,
      });
      expect(isIosVersionAtLeast(15)).toBe(true);
    });

    it("returns true when iOS version equals required", () => {
      Object.defineProperty(Platform, "OS", { value: "ios", writable: true });
      Object.defineProperty(Platform, "Version", {
        value: "15.0",
        writable: true,
      });
      expect(isIosVersionAtLeast(15)).toBe(true);
    });

    it("returns false when iOS version is insufficient", () => {
      Object.defineProperty(Platform, "OS", { value: "ios", writable: true });
      Object.defineProperty(Platform, "Version", {
        value: "14.0",
        writable: true,
      });
      expect(isIosVersionAtLeast(15)).toBe(false);
    });

    it("returns false on non-iOS platforms", () => {
      Object.defineProperty(Platform, "OS", {
        value: "android",
        writable: true,
      });
      expect(isIosVersionAtLeast(15)).toBe(false);
    });
  });

  describe("isAndroidApiLevelAtLeast", () => {
    it("returns true when API level is sufficient", () => {
      Object.defineProperty(Platform, "OS", {
        value: "android",
        writable: true,
      });
      Object.defineProperty(Platform, "Version", { value: 33, writable: true });
      expect(isAndroidApiLevelAtLeast(31)).toBe(true);
    });

    it("returns true when API level equals required", () => {
      Object.defineProperty(Platform, "OS", {
        value: "android",
        writable: true,
      });
      Object.defineProperty(Platform, "Version", { value: 31, writable: true });
      expect(isAndroidApiLevelAtLeast(31)).toBe(true);
    });

    it("returns false when API level is insufficient", () => {
      Object.defineProperty(Platform, "OS", {
        value: "android",
        writable: true,
      });
      Object.defineProperty(Platform, "Version", { value: 29, writable: true });
      expect(isAndroidApiLevelAtLeast(31)).toBe(false);
    });

    it("returns false on non-Android platforms", () => {
      Object.defineProperty(Platform, "OS", { value: "ios", writable: true });
      expect(isAndroidApiLevelAtLeast(31)).toBe(false);
    });

    it("handles string version on Android", () => {
      Object.defineProperty(Platform, "OS", {
        value: "android",
        writable: true,
      });
      Object.defineProperty(Platform, "Version", {
        value: "33",
        writable: true,
      });
      expect(isAndroidApiLevelAtLeast(31)).toBe(true);
    });
  });

  //#endregion

  //#region Platform Info

  describe("getPlatformInfo", () => {
    it("returns correct info for iOS", () => {
      Object.defineProperty(Platform, "OS", { value: "ios", writable: true });
      Object.defineProperty(Platform, "Version", {
        value: "16.0",
        writable: true,
      });

      const info = getPlatformInfo();

      expect(info.os).toBe("ios");
      expect(info.version).toBe("16.0");
      expect(info.isIos).toBe(true);
      expect(info.isAndroid).toBe(false);
      expect(info.isMobile).toBe(true);
      expect(info.isDesktop).toBe(false);
      expect(info.isWeb).toBe(false);
    });

    it("returns correct info for Android", () => {
      Object.defineProperty(Platform, "OS", {
        value: "android",
        writable: true,
      });
      Object.defineProperty(Platform, "Version", { value: 33, writable: true });

      const info = getPlatformInfo();

      expect(info.os).toBe("android");
      expect(info.version).toBe(33);
      expect(info.isIos).toBe(false);
      expect(info.isAndroid).toBe(true);
      expect(info.isMobile).toBe(true);
      expect(info.isDesktop).toBe(false);
      expect(info.isWeb).toBe(false);
    });

    it("returns correct info for web", () => {
      Object.defineProperty(Platform, "OS", { value: "web", writable: true });

      const info = getPlatformInfo();

      expect(info.os).toBe("web");
      expect(info.isIos).toBe(false);
      expect(info.isAndroid).toBe(false);
      expect(info.isMobile).toBe(false);
      expect(info.isDesktop).toBe(false);
      expect(info.isWeb).toBe(true);
    });

    it("returns correct info for macOS", () => {
      Object.defineProperty(Platform, "OS", { value: "macos", writable: true });

      const info = getPlatformInfo();

      expect(info.os).toBe("macos");
      expect(info.isMobile).toBe(false);
      expect(info.isDesktop).toBe(true);
      expect(info.isWeb).toBe(false);
    });
  });

  //#endregion

  //#region Platform Select

  describe("platformSelect", () => {
    it("selects iOS value on iOS", () => {
      Object.defineProperty(Platform, "OS", { value: "ios", writable: true });
      jest.spyOn(Platform, "select").mockReturnValue("ios-value");

      const result = platformSelect({
        ios: "ios-value",
        android: "android-value",
        default: "default-value",
      });

      expect(result).toBe("ios-value");
    });

    it("selects Android value on Android", () => {
      Object.defineProperty(Platform, "OS", {
        value: "android",
        writable: true,
      });
      jest.spyOn(Platform, "select").mockReturnValue("android-value");

      const result = platformSelect({
        ios: "ios-value",
        android: "android-value",
        default: "default-value",
      });

      expect(result).toBe("android-value");
    });

    it("selects default value on unknown platform", () => {
      Object.defineProperty(Platform, "OS", { value: "web", writable: true });
      jest.spyOn(Platform, "select").mockReturnValue("default-value");

      const result = platformSelect({
        ios: "ios-value",
        android: "android-value",
        default: "default-value",
      });

      expect(result).toBe("default-value");
    });
  });

  //#endregion
});

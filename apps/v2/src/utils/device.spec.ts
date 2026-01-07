// apps/v2/src/utils/device.spec.ts

import {
  getScreenDimensions,
  getScreenWidth,
  getScreenHeight,
  getPixelRatio,
  getFontScale,
  getPixelSizeForLayoutSize,
  roundToNearestPixel,
  isTablet,
  isPhone,
  isPhysicalDevice,
  getDeviceType,
  getDeviceTypeAsync,
  getDeviceInfo,
  getPlatform,
  DEFAULT_SAFE_AREA_INSETS,
  getEstimatedSafeAreaInsets,
} from "./device";
import { isIos, isAndroid, isWeb } from "./platform";

describe("device utilities", () => {
  //#region Screen Dimensions

  describe("getScreenDimensions", () => {
    it("returns object with width, height, scale, fontScale", () => {
      const dims = getScreenDimensions();

      expect(dims).toHaveProperty("width");
      expect(dims).toHaveProperty("height");
      expect(dims).toHaveProperty("scale");
      expect(dims).toHaveProperty("fontScale");
      expect(typeof dims.width).toBe("number");
      expect(typeof dims.height).toBe("number");
    });
  });

  describe("getScreenWidth", () => {
    it("returns a positive number", () => {
      const width = getScreenWidth();

      expect(typeof width).toBe("number");
      expect(width).toBeGreaterThan(0);
    });
  });

  describe("getScreenHeight", () => {
    it("returns a positive number", () => {
      const height = getScreenHeight();

      expect(typeof height).toBe("number");
      expect(height).toBeGreaterThan(0);
    });
  });

  //#endregion

  //#region Pixel Ratio

  describe("getPixelRatio", () => {
    it("returns a positive number", () => {
      const ratio = getPixelRatio();

      expect(typeof ratio).toBe("number");
      expect(ratio).toBeGreaterThan(0);
    });
  });

  describe("getFontScale", () => {
    it("returns a positive number", () => {
      const scale = getFontScale();

      expect(typeof scale).toBe("number");
      expect(scale).toBeGreaterThan(0);
    });
  });

  describe("getPixelSizeForLayoutSize", () => {
    it("converts layout size to pixel size", () => {
      const layoutSize = 10;
      const pixelSize = getPixelSizeForLayoutSize(layoutSize);

      expect(typeof pixelSize).toBe("number");
      expect(pixelSize).toBeGreaterThanOrEqual(layoutSize);
    });
  });

  describe("roundToNearestPixel", () => {
    it("returns a number", () => {
      const result = roundToNearestPixel(10.3);

      expect(typeof result).toBe("number");
    });
  });

  //#endregion

  //#region Device Type

  describe("isTablet", () => {
    it("returns a boolean", () => {
      expect(typeof isTablet()).toBe("boolean");
    });
  });

  describe("isPhone", () => {
    it("returns a boolean", () => {
      expect(typeof isPhone()).toBe("boolean");
    });
  });

  describe("isPhysicalDevice", () => {
    it("returns a boolean", () => {
      expect(typeof isPhysicalDevice()).toBe("boolean");
    });
  });

  describe("getDeviceType", () => {
    it("returns a valid device type string", () => {
      const deviceType = getDeviceType();
      const validTypes = ["unknown", "phone", "tablet", "tv", "desktop"];

      expect(validTypes).toContain(deviceType);
    });
  });

  describe("getDeviceTypeAsync", () => {
    it("resolves to a valid device type string", async () => {
      const deviceType = await getDeviceTypeAsync();
      const validTypes = ["unknown", "phone", "tablet", "tv", "desktop"];

      expect(validTypes).toContain(deviceType);
    });
  });

  //#endregion

  //#region Device Info

  describe("getDeviceInfo", () => {
    it("returns object with device properties", () => {
      const info = getDeviceInfo();

      expect(info).toHaveProperty("brand");
      expect(info).toHaveProperty("manufacturer");
      expect(info).toHaveProperty("modelName");
      expect(info).toHaveProperty("osName");
      expect(info).toHaveProperty("osVersion");
      expect(info).toHaveProperty("isDevice");
    });
  });

  describe("getPlatform", () => {
    it("returns a valid platform string", () => {
      const platform = getPlatform();
      const validPlatforms = ["ios", "android", "web", "windows", "macos"];

      expect(validPlatforms).toContain(platform);
    });
  });

  describe("platform checks", () => {
    it("isIos returns a boolean", () => {
      expect(typeof isIos()).toBe("boolean");
    });

    it("isAndroid returns a boolean", () => {
      expect(typeof isAndroid()).toBe("boolean");
    });

    it("isWeb returns a boolean", () => {
      expect(typeof isWeb()).toBe("boolean");
    });
  });

  //#endregion

  //#region Safe Area

  describe("DEFAULT_SAFE_AREA_INSETS", () => {
    it("has all inset properties set to zero", () => {
      expect(DEFAULT_SAFE_AREA_INSETS).toEqual({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      });
    });
  });

  describe("getEstimatedSafeAreaInsets", () => {
    it("returns object with top, right, bottom, left", () => {
      const insets = getEstimatedSafeAreaInsets();

      expect(insets).toHaveProperty("top");
      expect(insets).toHaveProperty("right");
      expect(insets).toHaveProperty("bottom");
      expect(insets).toHaveProperty("left");
      expect(typeof insets.top).toBe("number");
      expect(typeof insets.bottom).toBe("number");
    });
  });

  //#endregion
});

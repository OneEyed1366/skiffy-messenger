// apps/v2/src/utils/device.ts

/**
 * Device capability utilities
 * Provides screen dimensions, pixel ratio, device type, and safe area insets
 */

import { Dimensions, PixelRatio, Platform } from "react-native";
import * as Device from "expo-device";

//#region Types

export type IScreenDimensions = {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
};

export type IDeviceInfo = {
  brand: string | null;
  manufacturer: string | null;
  modelName: string | null;
  modelId: string | null;
  osName: string | null;
  osVersion: string | null;
  osBuildId: string | null;
  platformApiLevel: number | null;
  deviceName: string | null;
  deviceYearClass: number | null;
  isDevice: boolean;
  supportedCpuArchitectures: string[] | null;
  totalMemory: number | null;
};

export type ISafeAreaInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type IDeviceType = "unknown" | "phone" | "tablet" | "tv" | "desktop";

//#endregion

//#region Screen Dimensions

/**
 * Get current screen dimensions with scale factors
 * @returns Screen width, height, scale, and font scale
 */
export function getScreenDimensions(): IScreenDimensions {
  const { width, height, scale, fontScale } = Dimensions.get("window");
  return {
    width,
    height,
    scale,
    fontScale,
  };
}

/**
 * Get screen width
 * @returns Screen width in density-independent pixels
 */
export function getScreenWidth(): number {
  return Dimensions.get("window").width;
}

/**
 * Get screen height
 * @returns Screen height in density-independent pixels
 */
export function getScreenHeight(): number {
  return Dimensions.get("window").height;
}

//#endregion

//#region Pixel Ratio

/**
 * Get device pixel ratio (density)
 * @returns Pixel ratio (e.g., 2 for @2x, 3 for @3x)
 */
export function getPixelRatio(): number {
  return PixelRatio.get();
}

/**
 * Get font scale factor
 * @returns Font scale based on user accessibility settings
 */
export function getFontScale(): number {
  return PixelRatio.getFontScale();
}

/**
 * Convert layout size to pixel size
 * @param layoutSize - Size in density-independent pixels
 * @returns Size in physical pixels
 */
export function getPixelSizeForLayoutSize(layoutSize: number): number {
  return PixelRatio.getPixelSizeForLayoutSize(layoutSize);
}

/**
 * Round to nearest pixel boundary
 * @param layoutSize - Size in density-independent pixels
 * @returns Rounded size for crisp rendering
 */
export function roundToNearestPixel(layoutSize: number): number {
  return PixelRatio.roundToNearestPixel(layoutSize);
}

//#endregion

//#region Device Type

/**
 * Map expo-device DeviceType to string enum
 */
function mapDeviceType(deviceType: Device.DeviceType | null): IDeviceType {
  switch (deviceType) {
    case Device.DeviceType.PHONE:
      return "phone";
    case Device.DeviceType.TABLET:
      return "tablet";
    case Device.DeviceType.TV:
      return "tv";
    case Device.DeviceType.DESKTOP:
      return "desktop";
    default:
      return "unknown";
  }
}

/**
 * Check if device is a tablet
 * @returns True if device is a tablet
 */
export function isTablet(): boolean {
  return Device.deviceType === Device.DeviceType.TABLET;
}

/**
 * Check if device is a phone
 * @returns True if device is a phone
 */
export function isPhone(): boolean {
  return Device.deviceType === Device.DeviceType.PHONE;
}

/**
 * Check if running on a physical device (not simulator/emulator)
 * @returns True if running on physical device
 */
export function isPhysicalDevice(): boolean {
  return Device.isDevice;
}

/**
 * Get device type asynchronously (more accurate on Android)
 * @returns Promise resolving to device type
 */
export async function getDeviceTypeAsync(): Promise<IDeviceType> {
  const deviceType = await Device.getDeviceTypeAsync();
  return mapDeviceType(deviceType);
}

/**
 * Get device type synchronously
 * @returns Device type (may be less accurate on Android)
 */
export function getDeviceType(): IDeviceType {
  return mapDeviceType(Device.deviceType);
}

//#endregion

//#region Device Info

/**
 * Get comprehensive device information
 * @returns Device info object with hardware and OS details
 */
export function getDeviceInfo(): IDeviceInfo {
  return {
    brand: Device.brand,
    manufacturer: Device.manufacturer,
    modelName: Device.modelName,
    modelId: Device.modelId,
    osName: Device.osName,
    osVersion: Device.osVersion,
    osBuildId: Device.osBuildId,
    platformApiLevel: Device.platformApiLevel,
    deviceName: Device.deviceName,
    deviceYearClass: Device.deviceYearClass,
    isDevice: Device.isDevice,
    supportedCpuArchitectures: Device.supportedCpuArchitectures,
    totalMemory: Device.totalMemory,
  };
}

/**
 * Get current platform
 * @returns "ios" | "android" | "web" | "windows" | "macos"
 */
export function getPlatform(): typeof Platform.OS {
  return Platform.OS;
}

// NOTE: isIos, isAndroid, isWeb are available from @/utils/platform (T3.01)
// Import from there directly, or use index.ts barrel exports

//#endregion

//#region Safe Area

/**
 * Default safe area insets (zero values)
 * Use useSafeAreaInsets hook for actual values in components
 */
export const DEFAULT_SAFE_AREA_INSETS: ISafeAreaInsets = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

/**
 * Get estimated safe area insets based on platform
 * Note: For accurate values, use useSafeAreaInsets hook from react-native-safe-area-context
 * @returns Estimated safe area insets
 */
export function getEstimatedSafeAreaInsets(): ISafeAreaInsets {
  if (Platform.OS === "ios") {
    // Rough estimates for iOS devices with notch
    // Actual values should come from useSafeAreaInsets hook
    return {
      top: 47,
      right: 0,
      bottom: 34,
      left: 0,
    };
  }

  if (Platform.OS === "android") {
    // Android status bar height estimate
    return {
      top: 24,
      right: 0,
      bottom: 0,
      left: 0,
    };
  }

  return DEFAULT_SAFE_AREA_INSETS;
}

//#endregion

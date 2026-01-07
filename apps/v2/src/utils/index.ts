// apps/v2/src/utils/index.ts

/**
 * L2 Pure Utils - Barrel exports
 *
 * Pure utility functions with no external dependencies
 * (no React, no state, no platform-specific code).
 */

//#region ID Generation
export { generateId } from "./id";
//#endregion

//#region String Utilities
export {
  latinise,
  mapLatinChar,
  replaceHtmlEntities,
  toTitleCase,
  isEmail,
  createSafeId,
} from "./string";
//#endregion

//#region Color Utilities
export {
  getComponents,
  changeOpacity,
  blendColors,
  toRgbValues,
  getContrastingSimpleColor,
} from "./color";
export type { IColorComponents } from "./color";
//#endregion

//#region File Utilities
export { fileSizeToString } from "./file";
//#endregion

//#region Object Utilities
export {
  isEmptyObject,
  shallowEqual,
  keyMirror,
  deleteKeysFromObject,
  pickKeysFromObject,
} from "./object";
//#endregion

//#region Math Utilities
export { mod, stringToNumber, numberToFixedDynamic } from "./math";
//#endregion

//#region Array Utilities
export {
  unique,
  uniqueBy,
  chunk,
  groupBy,
  insertWithoutDuplicates,
  removeItem,
} from "./array";
//#endregion

//#region Date Utilities
export {
  isSameDay,
  isSameMonth,
  isSameYear,
  isToday,
  isYesterday,
  toUTCUnixSeconds,
} from "./date";
//#endregion

//#region Timer Utilities
export {
  formatTimeRemaining,
  calculateRemainingTime,
  isTimerInWarningState,
  isTimerExpired,
  getAriaAnnouncementInterval,
  formatAriaAnnouncement,
} from "./timer";
export type { IAriaAnnouncement } from "./timer";
//#endregion

//#region Timezone Utilities
export {
  getBrowserTimezone,
  isValidTimezone,
  getUtcOffsetForTimezone,
  getTimezoneRegion,
} from "./timezone";
//#endregion

// ============================================================================
// L3 Platform Utils - Platform-specific utilities requiring native APIs
// ============================================================================

//#region Platform Detection (L3 Platform)
export {
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
export type { IPlatformOS, IPlatformInfo } from "./platform";
//#endregion

//#region Clipboard Utilities (L3 Platform)
export {
  copyToClipboard,
  getClipboardText,
  hasClipboardText,
  getClipboardContent,
} from "./clipboard";
export type { IClipboardContent } from "./clipboard";
//#endregion

//#region Keyboard Utilities (L3 Platform)
export {
  cmdOrCtrlPressed,
  isKeyPressed,
  isEnterPressed,
  isEscapePressed,
  KEY_CODES,
} from "./keyboard";
export type { IKeyCode, IKeyboardEvent } from "./keyboard";
//#endregion

//#region Device Utilities (L3 Platform)
export {
  // Types
  type IScreenDimensions,
  type IDeviceInfo,
  type ISafeAreaInsets,
  type IDeviceType,
  // Screen Dimensions
  getScreenDimensions,
  getScreenWidth,
  getScreenHeight,
  // Pixel Ratio
  getPixelRatio,
  getFontScale,
  getPixelSizeForLayoutSize,
  roundToNearestPixel,
  // Device Type
  isTablet,
  isPhone,
  isPhysicalDevice,
  getDeviceTypeAsync,
  getDeviceType,
  // Device Info
  getDeviceInfo,
  getPlatform,
  // Note: isIos, isAndroid, isWeb are exported from ./platform above
  // Safe Area
  DEFAULT_SAFE_AREA_INSETS,
  getEstimatedSafeAreaInsets,
} from "./device";
//#endregion

//#region Haptics Utilities (L3 Platform)
export {
  // Impact
  impactLight,
  impactMedium,
  impactHeavy,
  impact,
  // Notification
  notificationSuccess,
  notificationWarning,
  notificationError,
  notification,
  // Selection
  selectionChanged,
  // Utilities
  isHapticsSupported,
  withHaptic,
} from "./haptics";

export type {
  IImpactStyle,
  INotificationStyle,
  IHapticOptions,
} from "./haptics";
//#endregion

//#region Storage Utilities (L3 Platform)
export {
  // General Storage
  getItem as getStorageItem,
  setItem as setStorageItem,
  removeItem as removeStorageItem,
  getMultipleItems,
  setMultipleItems,
  clearStorage,
  getAllKeys,
  // Secure Storage
  isSecureStoreAvailable,
  getSecureItem,
  setSecureItem,
  removeSecureItem,
  // JSON Helpers
  getJsonItem,
  getValidatedJsonItem,
  setJsonItem,
  // Constants
  STORAGE_PREFIX,
  SECURE_STORAGE_PREFIX,
} from "./storage";

export type {
  IStorageKey,
  IStorageOptions,
  ISecureStoreOptions,
} from "./storage";
//#endregion

//#region Notification Utilities (L3 Platform)
export {
  // Permission
  requestNotificationPermission,
  getNotificationPermissionStatus,
  // Local Notifications
  showLocalNotification,
  // Management
  cancelNotification,
  cancelAllNotifications,
  getScheduledNotifications,
  // Android Channels
  createNotificationChannel,
  deleteNotificationChannel,
  // Badge
  setBadgeCount,
  getBadgeCount,
  // Configuration
  configureNotificationHandler,
  // Constants
  NOTIFICATION_PERMISSION_GRANTED,
  NOTIFICATION_PERMISSION_DENIED,
  NOTIFICATION_PERMISSION_UNDETERMINED,
  DEFAULT_CHANNEL_ID,
} from "./notifications";

export type {
  INotificationPermissionStatus,
  INotificationOptions,
  INotificationChannel,
} from "./notifications";
//#endregion

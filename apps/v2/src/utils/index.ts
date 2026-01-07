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

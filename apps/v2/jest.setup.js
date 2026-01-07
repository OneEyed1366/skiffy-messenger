// https://github.com/expo/expo/issues/36831#issuecomment-3107047371
// eslint-disable-next-line no-undef
jest.mock("expo/src/winter/ImportMetaRegistry", () => ({
  ImportMetaRegistry: {
    get url() {
      return null;
    },
  },
}));

// Mock expo-haptics for haptics utilities tests
// eslint-disable-next-line no-undef
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

// Mock expo-notifications for notification utilities tests
// eslint-disable-next-line no-undef
jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  dismissAllNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  deleteNotificationChannelAsync: jest.fn(),
  setBadgeCountAsync: jest.fn(),
  getBadgeCountAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  AndroidImportance: {
    DEFAULT: 3,
    HIGH: 4,
    LOW: 2,
    MIN: 1,
    MAX: 5,
  },
}));

// Mock @react-native-async-storage/async-storage
// eslint-disable-next-line no-undef
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(),
  clear: jest.fn(),
}));

// Mock expo-secure-store
// eslint-disable-next-line no-undef
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  isAvailableAsync: jest.fn(),
  AFTER_FIRST_UNLOCK: "afterFirstUnlock",
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: "afterFirstUnlockThisDeviceOnly",
  ALWAYS: "always",
  ALWAYS_THIS_DEVICE_ONLY: "alwaysThisDeviceOnly",
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: "whenPasscodeSetThisDeviceOnly",
  WHEN_UNLOCKED: "whenUnlocked",
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: "whenUnlockedThisDeviceOnly",
}));

// eslint-disable-next-line no-undef
if (typeof global.structuredClone === "undefined") {
  // eslint-disable-next-line no-undef
  global.structuredClone = (object) => JSON.parse(JSON.stringify(object));
}

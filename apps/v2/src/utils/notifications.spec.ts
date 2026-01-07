// apps/v2/src/utils/notifications.spec.ts

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  showLocalNotification,
  cancelNotification,
  cancelAllNotifications,
  getScheduledNotifications,
  createNotificationChannel,
  setBadgeCount,
  getBadgeCount,
  NOTIFICATION_PERMISSION_GRANTED,
  NOTIFICATION_PERMISSION_DENIED,
  NOTIFICATION_PERMISSION_UNDETERMINED,
} from "./notifications";

jest.mock("expo-notifications", () => ({
  ...jest.requireActual("expo-notifications"),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  dismissAllNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  setBadgeCountAsync: jest.fn(),
  getBadgeCountAsync: jest.fn(),
}));

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;

describe("notification utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //#region Permission Management

  describe("requestNotificationPermission", () => {
    it("returns true when permission already granted", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: "granted",
        expires: "never",
        granted: true,
        canAskAgain: true,
      } as Notifications.NotificationPermissionsStatus);

      const result = await requestNotificationPermission();

      expect(result).toBe(true);
      expect(mockNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it("requests permission when not granted", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: "undetermined",
        expires: "never",
        granted: false,
        canAskAgain: true,
      } as Notifications.NotificationPermissionsStatus);
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: "granted",
        expires: "never",
        granted: true,
        canAskAgain: true,
      } as Notifications.NotificationPermissionsStatus);

      const result = await requestNotificationPermission();

      expect(result).toBe(true);
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it("returns false when permission denied", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: "undetermined",
        expires: "never",
        granted: false,
        canAskAgain: true,
      } as Notifications.NotificationPermissionsStatus);
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: "denied",
        expires: "never",
        granted: false,
        canAskAgain: false,
      } as Notifications.NotificationPermissionsStatus);

      const result = await requestNotificationPermission();

      expect(result).toBe(false);
    });

    it("returns false on error", async () => {
      mockNotifications.getPermissionsAsync.mockRejectedValue(
        new Error("Failed"),
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await requestNotificationPermission();

      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe("getNotificationPermissionStatus", () => {
    it("returns granted when permission granted", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: "granted",
        expires: "never",
        granted: true,
        canAskAgain: true,
      } as Notifications.NotificationPermissionsStatus);

      const result = await getNotificationPermissionStatus();

      expect(result).toBe(NOTIFICATION_PERMISSION_GRANTED);
    });

    it("returns denied when permission denied", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: "denied",
        expires: "never",
        granted: false,
        canAskAgain: false,
      } as Notifications.NotificationPermissionsStatus);

      const result = await getNotificationPermissionStatus();

      expect(result).toBe(NOTIFICATION_PERMISSION_DENIED);
    });

    it("returns undetermined for new users", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: "undetermined",
        expires: "never",
        granted: false,
        canAskAgain: true,
      } as Notifications.NotificationPermissionsStatus);

      const result = await getNotificationPermissionStatus();

      expect(result).toBe(NOTIFICATION_PERMISSION_UNDETERMINED);
    });
  });

  //#endregion

  //#region Local Notifications

  describe("showLocalNotification", () => {
    it("schedules notification and returns ID", async () => {
      mockNotifications.scheduleNotificationAsync.mockResolvedValue(
        "notif-123",
      );

      const id = await showLocalNotification({
        title: "Test Title",
        body: "Test Body",
      });

      expect(id).toBe("notif-123");
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.objectContaining({
          title: "Test Title",
          body: "Test Body",
        }),
        trigger: null,
      });
    });

    it("includes data in notification", async () => {
      mockNotifications.scheduleNotificationAsync.mockResolvedValue(
        "notif-123",
      );

      await showLocalNotification({
        title: "Test",
        body: "Body",
        data: { channelId: "ch-123" },
      });

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.objectContaining({
          data: { channelId: "ch-123" },
        }),
        trigger: null,
      });
    });

    it("schedules delayed notification", async () => {
      mockNotifications.scheduleNotificationAsync.mockResolvedValue(
        "notif-123",
      );

      await showLocalNotification({
        title: "Reminder",
        body: "In 5 minutes",
        delaySeconds: 300,
      });

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.anything(),
        trigger: expect.objectContaining({ seconds: 300 }),
      });
    });

    it("throws on error", async () => {
      mockNotifications.scheduleNotificationAsync.mockRejectedValue(
        new Error("Schedule failed"),
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(
        showLocalNotification({ title: "Test", body: "Body" }),
      ).rejects.toThrow();

      consoleSpy.mockRestore();
    });
  });

  //#endregion

  //#region Notification Management

  describe("cancelNotification", () => {
    it("cancels notification by ID", async () => {
      mockNotifications.cancelScheduledNotificationAsync.mockResolvedValue();

      await cancelNotification("notif-123");

      expect(
        mockNotifications.cancelScheduledNotificationAsync,
      ).toHaveBeenCalledWith("notif-123");
    });

    it("does not throw on error", async () => {
      mockNotifications.cancelScheduledNotificationAsync.mockRejectedValue(
        new Error("Not found"),
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(cancelNotification("invalid")).resolves.not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe("cancelAllNotifications", () => {
    it("cancels all scheduled and displayed notifications", async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue();
      mockNotifications.dismissAllNotificationsAsync.mockResolvedValue();

      await cancelAllNotifications();

      expect(
        mockNotifications.cancelAllScheduledNotificationsAsync,
      ).toHaveBeenCalled();
      expect(mockNotifications.dismissAllNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe("getScheduledNotifications", () => {
    it("returns array of notification IDs", async () => {
      mockNotifications.getAllScheduledNotificationsAsync.mockResolvedValue([
        { identifier: "notif-1" } as Notifications.NotificationRequest,
        { identifier: "notif-2" } as Notifications.NotificationRequest,
      ]);

      const ids = await getScheduledNotifications();

      expect(ids).toEqual(["notif-1", "notif-2"]);
    });

    it("returns empty array on error", async () => {
      mockNotifications.getAllScheduledNotificationsAsync.mockRejectedValue(
        new Error("Failed"),
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const ids = await getScheduledNotifications();

      expect(ids).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  //#endregion

  //#region Badge Management

  describe("setBadgeCount", () => {
    it("sets badge count", async () => {
      mockNotifications.setBadgeCountAsync.mockResolvedValue(true);

      await setBadgeCount(5);

      expect(mockNotifications.setBadgeCountAsync).toHaveBeenCalledWith(5);
    });
  });

  describe("getBadgeCount", () => {
    it("returns badge count", async () => {
      mockNotifications.getBadgeCountAsync.mockResolvedValue(3);

      const count = await getBadgeCount();

      expect(count).toBe(3);
    });

    it("returns 0 on error", async () => {
      mockNotifications.getBadgeCountAsync.mockRejectedValue(
        new Error("Failed"),
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const count = await getBadgeCount();

      expect(count).toBe(0);
      consoleSpy.mockRestore();
    });
  });

  //#endregion
});

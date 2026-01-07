// apps/v2/src/utils/haptics.spec.ts

import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import {
  impactLight,
  impactMedium,
  impactHeavy,
  impact,
  notificationSuccess,
  notificationWarning,
  notificationError,
  notification,
  selectionChanged,
  isHapticsSupported,
  withHaptic,
} from "./haptics";

jest.mock("expo-haptics");

const mockHaptics = Haptics as jest.Mocked<typeof Haptics>;

describe("haptics utilities", () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, "OS", { value: "ios", writable: true });
  });

  afterEach(() => {
    Object.defineProperty(Platform, "OS", { value: originalPlatform });
  });

  //#region Impact Feedback

  describe("impactLight", () => {
    it("triggers light impact on iOS", async () => {
      mockHaptics.impactAsync.mockResolvedValue();

      await impactLight();

      expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light,
      );
    });

    it("does nothing on web", async () => {
      Object.defineProperty(Platform, "OS", { value: "web" });

      await impactLight();

      expect(mockHaptics.impactAsync).not.toHaveBeenCalled();
    });

    it("catches errors silently", async () => {
      mockHaptics.impactAsync.mockRejectedValue(new Error("Not supported"));
      const consoleSpy = jest.spyOn(console, "debug").mockImplementation();

      await expect(impactLight()).resolves.not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe("impactMedium", () => {
    it("triggers medium impact", async () => {
      mockHaptics.impactAsync.mockResolvedValue();

      await impactMedium();

      expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium,
      );
    });
  });

  describe("impactHeavy", () => {
    it("triggers heavy impact", async () => {
      mockHaptics.impactAsync.mockResolvedValue();

      await impactHeavy();

      expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy,
      );
    });
  });

  describe("impact", () => {
    it("calls correct function for each style", async () => {
      mockHaptics.impactAsync.mockResolvedValue();

      await impact("light");
      expect(mockHaptics.impactAsync).toHaveBeenLastCalledWith(
        Haptics.ImpactFeedbackStyle.Light,
      );

      await impact("medium");
      expect(mockHaptics.impactAsync).toHaveBeenLastCalledWith(
        Haptics.ImpactFeedbackStyle.Medium,
      );

      await impact("heavy");
      expect(mockHaptics.impactAsync).toHaveBeenLastCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy,
      );
    });
  });

  //#endregion

  //#region Notification Feedback

  describe("notificationSuccess", () => {
    it("triggers success notification", async () => {
      mockHaptics.notificationAsync.mockResolvedValue();

      await notificationSuccess();

      expect(mockHaptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success,
      );
    });

    it("does nothing on web", async () => {
      Object.defineProperty(Platform, "OS", { value: "web" });

      await notificationSuccess();

      expect(mockHaptics.notificationAsync).not.toHaveBeenCalled();
    });
  });

  describe("notificationWarning", () => {
    it("triggers warning notification", async () => {
      mockHaptics.notificationAsync.mockResolvedValue();

      await notificationWarning();

      expect(mockHaptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning,
      );
    });
  });

  describe("notificationError", () => {
    it("triggers error notification", async () => {
      mockHaptics.notificationAsync.mockResolvedValue();

      await notificationError();

      expect(mockHaptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error,
      );
    });
  });

  describe("notification", () => {
    it("calls correct function for each type", async () => {
      mockHaptics.notificationAsync.mockResolvedValue();

      await notification("success");
      expect(mockHaptics.notificationAsync).toHaveBeenLastCalledWith(
        Haptics.NotificationFeedbackType.Success,
      );

      await notification("warning");
      expect(mockHaptics.notificationAsync).toHaveBeenLastCalledWith(
        Haptics.NotificationFeedbackType.Warning,
      );

      await notification("error");
      expect(mockHaptics.notificationAsync).toHaveBeenLastCalledWith(
        Haptics.NotificationFeedbackType.Error,
      );
    });
  });

  //#endregion

  //#region Selection Feedback

  describe("selectionChanged", () => {
    it("triggers selection feedback", async () => {
      mockHaptics.selectionAsync.mockResolvedValue();

      await selectionChanged();

      expect(mockHaptics.selectionAsync).toHaveBeenCalled();
    });

    it("does nothing on web", async () => {
      Object.defineProperty(Platform, "OS", { value: "web" });

      await selectionChanged();

      expect(mockHaptics.selectionAsync).not.toHaveBeenCalled();
    });
  });

  //#endregion

  //#region Utility Functions

  describe("isHapticsSupported", () => {
    it("returns true on iOS", () => {
      Object.defineProperty(Platform, "OS", { value: "ios" });

      expect(isHapticsSupported()).toBe(true);
    });

    it("returns true on Android", () => {
      Object.defineProperty(Platform, "OS", { value: "android" });

      expect(isHapticsSupported()).toBe(true);
    });

    it("returns false on web", () => {
      Object.defineProperty(Platform, "OS", { value: "web" });

      expect(isHapticsSupported()).toBe(false);
    });
  });

  describe("withHaptic", () => {
    it("wraps function with haptic feedback", async () => {
      mockHaptics.impactAsync.mockResolvedValue();
      const handler = jest.fn().mockReturnValue("result");

      const wrappedHandler = withHaptic(handler);
      const result = await wrappedHandler("arg1", "arg2");

      expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light,
      );
      expect(handler).toHaveBeenCalledWith("arg1", "arg2");
      expect(result).toBe("result");
    });

    it("uses specified impact style", async () => {
      mockHaptics.impactAsync.mockResolvedValue();
      const handler = jest.fn();

      const wrappedHandler = withHaptic(handler, "heavy");
      await wrappedHandler();

      expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy,
      );
    });
  });

  //#endregion
});

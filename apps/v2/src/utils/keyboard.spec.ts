// apps/v2/src/utils/keyboard.spec.ts

import { Platform } from "react-native";

import {
  cmdOrCtrlPressed,
  isKeyPressed,
  isEnterPressed,
  isEscapePressed,
  KEY_CODES,
} from "./keyboard";
import * as platformUtils from "./platform";

jest.mock("./platform");

const mockPlatformUtils = platformUtils as jest.Mocked<typeof platformUtils>;

describe("keyboard utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlatformUtils.isMac.mockReturnValue(false);
  });

  //#region cmdOrCtrlPressed

  describe("cmdOrCtrlPressed", () => {
    it("returns true for Ctrl on non-Mac", () => {
      mockPlatformUtils.isMac.mockReturnValue(false);

      const event = { ctrlKey: true, altKey: false };
      expect(cmdOrCtrlPressed(event)).toBe(true);
    });

    it("returns false for Ctrl+Alt on non-Mac without allowAlt", () => {
      mockPlatformUtils.isMac.mockReturnValue(false);

      const event = { ctrlKey: true, altKey: true };
      expect(cmdOrCtrlPressed(event)).toBe(false);
    });

    it("returns true for Ctrl+Alt on non-Mac with allowAlt", () => {
      mockPlatformUtils.isMac.mockReturnValue(false);

      const event = { ctrlKey: true, altKey: true };
      expect(cmdOrCtrlPressed(event, true)).toBe(true);
    });

    it("returns true for Meta on Mac", () => {
      mockPlatformUtils.isMac.mockReturnValue(true);

      const event = { metaKey: true };
      expect(cmdOrCtrlPressed(event)).toBe(true);
    });

    it("returns false for Ctrl on Mac", () => {
      mockPlatformUtils.isMac.mockReturnValue(true);

      const event = { ctrlKey: true };
      expect(cmdOrCtrlPressed(event)).toBe(false);
    });

    it("returns false when no modifier pressed", () => {
      const event = { ctrlKey: false, metaKey: false };
      expect(cmdOrCtrlPressed(event)).toBe(false);
    });
  });

  //#endregion

  //#region isKeyPressed

  describe("isKeyPressed", () => {
    it("matches by key string", () => {
      const event = { key: "Enter" };
      expect(isKeyPressed(event, KEY_CODES.ENTER)).toBe(true);
    });

    it("matches by key string case-insensitive", () => {
      const event = { key: "A" };
      expect(isKeyPressed(event, KEY_CODES.A)).toBe(true);
    });

    it("matches by keyCode fallback", () => {
      const event = { key: "Unidentified", keyCode: 13 };
      expect(isKeyPressed(event, KEY_CODES.ENTER)).toBe(true);
    });

    it("returns false during IME composition", () => {
      const event = { keyCode: 229 };
      expect(isKeyPressed(event, KEY_CODES.ENTER)).toBe(false);
    });

    it("returns false for non-matching key", () => {
      const event = { key: "Enter", keyCode: 13 };
      expect(isKeyPressed(event, KEY_CODES.ESCAPE)).toBe(false);
    });

    it("handles Dead key events", () => {
      const event = { key: "Dead", keyCode: 65 };
      expect(isKeyPressed(event, KEY_CODES.A)).toBe(true);
    });
  });

  //#endregion

  //#region Helper Functions

  describe("isEnterPressed", () => {
    it("returns true for Enter without Shift", () => {
      const event = { key: "Enter", shiftKey: false };
      expect(isEnterPressed(event)).toBe(true);
    });

    it("returns false for Enter with Shift", () => {
      const event = { key: "Enter", shiftKey: true };
      expect(isEnterPressed(event)).toBe(false);
    });
  });

  describe("isEscapePressed", () => {
    it("returns true for Escape key", () => {
      const event = { key: "Escape" };
      expect(isEscapePressed(event)).toBe(true);
    });

    it("returns false for other keys", () => {
      const event = { key: "Enter" };
      expect(isEscapePressed(event)).toBe(false);
    });
  });

  //#endregion

  //#region KEY_CODES

  describe("KEY_CODES", () => {
    it("has correct ENTER definition", () => {
      expect(KEY_CODES.ENTER).toEqual(["Enter", 13]);
    });

    it("has correct ESCAPE definition", () => {
      expect(KEY_CODES.ESCAPE).toEqual(["Escape", 27]);
    });

    it("has correct modifier keys", () => {
      expect(KEY_CODES.CTRL).toEqual(["Control", 17]);
      expect(KEY_CODES.CMD).toEqual(["Meta", 91]);
      expect(KEY_CODES.ALT).toEqual(["Alt", 18]);
      expect(KEY_CODES.SHIFT).toEqual(["Shift", 16]);
    });
  });

  //#endregion
});

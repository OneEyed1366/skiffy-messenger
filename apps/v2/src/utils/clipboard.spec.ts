// apps/v2/src/utils/clipboard.spec.ts

import * as Clipboard from "expo-clipboard";

import {
  copyToClipboard,
  getClipboardText,
  hasClipboardText,
  getClipboardContent,
} from "./clipboard";

jest.mock("expo-clipboard");

const mockClipboard = Clipboard as jest.Mocked<typeof Clipboard>;

describe("clipboard utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //#region copyToClipboard

  describe("copyToClipboard", () => {
    it("returns true on successful copy", async () => {
      mockClipboard.setStringAsync.mockResolvedValue(true);

      const result = await copyToClipboard("test text");

      expect(result).toBe(true);
      expect(mockClipboard.setStringAsync).toHaveBeenCalledWith("test text");
    });

    it("returns false on error", async () => {
      mockClipboard.setStringAsync.mockRejectedValue(new Error("Copy failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await copyToClipboard("test text");

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("handles empty string", async () => {
      mockClipboard.setStringAsync.mockResolvedValue(true);

      const result = await copyToClipboard("");

      expect(result).toBe(true);
      expect(mockClipboard.setStringAsync).toHaveBeenCalledWith("");
    });
  });

  //#endregion

  //#region getClipboardText

  describe("getClipboardText", () => {
    it("returns clipboard text", async () => {
      mockClipboard.getStringAsync.mockResolvedValue("clipboard content");

      const result = await getClipboardText();

      expect(result).toBe("clipboard content");
    });

    it("returns empty string when clipboard is empty", async () => {
      mockClipboard.getStringAsync.mockResolvedValue("");

      const result = await getClipboardText();

      expect(result).toBe("");
    });

    it("returns empty string on error", async () => {
      mockClipboard.getStringAsync.mockRejectedValue(new Error("Read failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await getClipboardText();

      expect(result).toBe("");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("handles null response", async () => {
      mockClipboard.getStringAsync.mockResolvedValue(null as unknown as string);

      const result = await getClipboardText();

      expect(result).toBe("");
    });
  });

  //#endregion

  //#region hasClipboardText

  describe("hasClipboardText", () => {
    it("returns true when clipboard has text", async () => {
      mockClipboard.hasStringAsync.mockResolvedValue(true);

      const result = await hasClipboardText();

      expect(result).toBe(true);
    });

    it("returns false when clipboard is empty", async () => {
      mockClipboard.hasStringAsync.mockResolvedValue(false);

      const result = await hasClipboardText();

      expect(result).toBe(false);
    });

    it("returns false on error", async () => {
      mockClipboard.hasStringAsync.mockRejectedValue(new Error("Check failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await hasClipboardText();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  //#endregion

  //#region getClipboardContent

  describe("getClipboardContent", () => {
    it("returns content with text and hasText true", async () => {
      mockClipboard.getStringAsync.mockResolvedValue("content");
      mockClipboard.hasStringAsync.mockResolvedValue(true);

      const result = await getClipboardContent();

      expect(result).toEqual({
        text: "content",
        hasText: true,
      });
    });

    it("returns empty content when clipboard is empty", async () => {
      mockClipboard.getStringAsync.mockResolvedValue("");
      mockClipboard.hasStringAsync.mockResolvedValue(false);

      const result = await getClipboardContent();

      expect(result).toEqual({
        text: "",
        hasText: false,
      });
    });

    it("returns empty content on error", async () => {
      mockClipboard.getStringAsync.mockRejectedValue(new Error("Failed"));
      mockClipboard.hasStringAsync.mockRejectedValue(new Error("Failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await getClipboardContent();

      expect(result).toEqual({
        text: "",
        hasText: false,
      });
      consoleSpy.mockRestore();
    });
  });

  //#endregion
});

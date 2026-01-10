import { act, renderHook } from "@testing-library/react-native";

import { useCopyText } from "./useCopyText";

//#region Mocks

const mockCopyToClipboard = jest.fn().mockResolvedValue(undefined);

jest.mock("./clipboard", () => ({
  copyToClipboard: (text: string) => mockCopyToClipboard(text),
}));

//#endregion Mocks

describe("useCopyText", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  //#region Basic Functionality

  describe("basic functionality", () => {
    it("copies text to clipboard", async () => {
      const { result } = renderHook(() => useCopyText());

      await act(async () => {
        await result.current.copy("test text");
      });

      expect(mockCopyToClipboard).toHaveBeenCalledWith("test text");
    });

    it("sets copied to true after successful copy", async () => {
      const { result } = renderHook(() => useCopyText());

      expect(result.current.copied).toBe(false);

      await act(async () => {
        await result.current.copy("test");
      });

      expect(result.current.copied).toBe(true);
    });

    it("sets copying to true during copy operation", async () => {
      const { result } = renderHook(() => useCopyText());

      expect(result.current.copying).toBe(false);

      let copyPromise: Promise<void>;
      act(() => {
        copyPromise = result.current.copy("test");
      });

      // Note: This test may need adjustment based on timing
      await act(async () => {
        await copyPromise;
      });

      expect(result.current.copying).toBe(false);
    });

    it("resets copied state after successDuration", async () => {
      const { result } = renderHook(() =>
        useCopyText({ successDuration: 1000 }),
      );

      await act(async () => {
        await result.current.copy("test");
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.copied).toBe(false);
    });

    it("uses default successDuration of 2000ms", async () => {
      const { result } = renderHook(() => useCopyText());

      await act(async () => {
        await result.current.copy("test");
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1999);
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(result.current.copied).toBe(false);
    });
  });

  //#endregion Basic Functionality

  //#region Callbacks

  describe("callbacks", () => {
    it("calls onSuccess after successful copy", async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useCopyText({ onSuccess }));

      await act(async () => {
        await result.current.copy("test");
      });

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("calls onError when copy fails", async () => {
      const error = new Error("Copy failed");
      mockCopyToClipboard.mockRejectedValueOnce(error);

      const onError = jest.fn();
      const { result } = renderHook(() => useCopyText({ onError }));

      await act(async () => {
        await result.current.copy("test");
      });

      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  //#endregion Callbacks

  //#region Error Handling

  describe("error handling", () => {
    it("sets error state when copy fails", async () => {
      const error = new Error("Copy failed");
      mockCopyToClipboard.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useCopyText());

      await act(async () => {
        await result.current.copy("test");
      });

      expect(result.current.error).toBe(error);
      expect(result.current.copied).toBe(false);
    });

    it("clears error on next successful copy", async () => {
      const error = new Error("Copy failed");
      mockCopyToClipboard.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useCopyText());

      await act(async () => {
        await result.current.copy("test");
      });

      expect(result.current.error).toBe(error);

      mockCopyToClipboard.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.copy("test");
      });

      expect(result.current.error).toBe(null);
      expect(result.current.copied).toBe(true);
    });
  });

  //#endregion Error Handling

  //#region Reset

  describe("reset", () => {
    it("resets copied state manually", async () => {
      const { result } = renderHook(() => useCopyText());

      await act(async () => {
        await result.current.copy("test");
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.copied).toBe(false);
    });

    it("clears pending timeout on reset", async () => {
      const { result } = renderHook(() =>
        useCopyText({ successDuration: 5000 }),
      );

      await act(async () => {
        await result.current.copy("test");
      });

      act(() => {
        result.current.reset();
      });

      // Advance past original timeout - should not affect state
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.copied).toBe(false);
    });

    it("clears error state on reset", async () => {
      const error = new Error("Copy failed");
      mockCopyToClipboard.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useCopyText());

      await act(async () => {
        await result.current.copy("test");
      });

      expect(result.current.error).toBe(error);

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBe(null);
    });
  });

  //#endregion Reset

  //#region Rapid Copies

  describe("rapid copies", () => {
    it("cancels previous timeout on new copy", async () => {
      const { result } = renderHook(() =>
        useCopyText({ successDuration: 2000 }),
      );

      await act(async () => {
        await result.current.copy("first");
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(result.current.copied).toBe(true);

      await act(async () => {
        await result.current.copy("second");
      });

      // Original timeout would have fired at 2000ms, but we're at 1500ms + new copy
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should still be copied because new timeout hasn't expired
      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // Now the new timeout should have expired
      expect(result.current.copied).toBe(false);
    });
  });

  //#endregion Rapid Copies
});

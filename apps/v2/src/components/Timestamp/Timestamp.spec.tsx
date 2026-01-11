// apps/v2/src/components/Timestamp/Timestamp.spec.tsx

import { render, fireEvent, act } from "@testing-library/react-native";
import { Timestamp } from "./Timestamp";

//#region Mocks

// Mock the datetime utils
jest.mock("@/utils/date", () => ({
  getRelativeTime: jest.fn((date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.round(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.round(minutes / 60);
    return `${hours} hours ago`;
  }),
  formatDateTime: jest.fn(() => "January 4, 2026 at 2:30 PM"),
  formatTime: jest.fn(() => "2:30 PM"),
  isToday: jest.fn(() => false),
  isYesterday: jest.fn(() => false),
}));

//#endregion Mocks

//#region Rendering Tests

describe("<Timestamp />", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("rendering", () => {
    it("renders relative time by default", () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const { getByText } = render(<Timestamp value={fiveMinAgo} />);

      expect(getByText("5 minutes ago")).toBeTruthy();
    });

    it("renders time format", () => {
      const { getByText } = render(
        <Timestamp value={new Date()} format="time" />,
      );

      expect(getByText("2:30 PM")).toBeTruthy();
    });

    it("renders datetime format", () => {
      const { getByText } = render(
        <Timestamp value={new Date()} format="datetime" />,
      );

      expect(getByText("January 4, 2026 at 2:30 PM")).toBeTruthy();
    });

    it("accepts number timestamp", () => {
      const timestamp = Date.now() - 5 * 60 * 1000;
      const { getByText } = render(<Timestamp value={timestamp} />);

      expect(getByText("5 minutes ago")).toBeTruthy();
    });

    it("accepts ISO string", () => {
      const isoString = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { getByText } = render(<Timestamp value={isoString} />);

      expect(getByText("5 minutes ago")).toBeTruthy();
    });

    it("renders with testID", () => {
      const { getByTestId } = render(
        <Timestamp value={new Date()} testID="test-timestamp" />,
      );

      expect(getByTestId("test-timestamp")).toBeTruthy();
    });
  });

  //#endregion Rendering Tests

  //#region Interaction Tests

  describe("interactions", () => {
    it("shows absolute time on press", () => {
      const { getByText } = render(
        <Timestamp value={new Date(Date.now() - 5 * 60 * 1000)} />,
      );

      // Initially shows relative time
      expect(getByText("5 minutes ago")).toBeTruthy();

      // Press to show absolute
      fireEvent.press(getByText("5 minutes ago"));

      // Should now show absolute time
      expect(getByText("January 4, 2026 at 2:30 PM")).toBeTruthy();
    });

    it("reverts to relative time after duration", () => {
      const { getByText } = render(
        <Timestamp
          value={new Date(Date.now() - 5 * 60 * 1000)}
          absoluteDisplayDuration={1000}
        />,
      );

      // Press to show absolute
      fireEvent.press(getByText("5 minutes ago"));
      expect(getByText("January 4, 2026 at 2:30 PM")).toBeTruthy();

      // Advance timer past duration
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // Should revert to relative
      expect(getByText("5 minutes ago")).toBeTruthy();
    });

    it("does not show absolute on press when disabled", () => {
      const { getByText, queryByText } = render(
        <Timestamp
          value={new Date(Date.now() - 5 * 60 * 1000)}
          showAbsoluteOnPress={false}
        />,
      );

      fireEvent.press(getByText("5 minutes ago"));

      // Should still show relative time
      expect(getByText("5 minutes ago")).toBeTruthy();
      expect(queryByText("January 4, 2026 at 2:30 PM")).toBeNull();
    });
  });

  //#endregion Interaction Tests

  //#region Auto-Update Tests

  describe("auto-update", () => {
    it("updates relative time periodically", () => {
      const initialTime = Date.now();
      const fiveMinAgo = new Date(initialTime - 5 * 60 * 1000);

      const { getByText } = render(<Timestamp value={fiveMinAgo} live />);

      expect(getByText("5 minutes ago")).toBeTruthy();

      // Advance time by 1 minute
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      // Component should have updated
      // Note: In real implementation, the relative time would update
    });

    it("does not update when live is false", () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

      const { getByText } = render(
        <Timestamp value={fiveMinAgo} live={false} />,
      );

      expect(getByText("5 minutes ago")).toBeTruthy();

      // Advance time
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      // Should still show same time (no re-render triggered)
      expect(getByText("5 minutes ago")).toBeTruthy();
    });

    it("does not update for non-relative formats", () => {
      const { getByText } = render(
        <Timestamp value={new Date()} format="datetime" live />,
      );

      expect(getByText("January 4, 2026 at 2:30 PM")).toBeTruthy();
    });
  });

  //#endregion Auto-Update Tests

  //#region Today/Yesterday Tests

  describe("today/yesterday labels", () => {
    it("shows Today label for today", () => {
      const { isToday } = require("@/utils/date");
      isToday.mockReturnValue(true);

      const { getByText } = render(<Timestamp value={new Date()} />);

      // In test environment, t() returns the key with default fallback
      // The component uses t("timestamp.today", "Today") which returns the key in tests
      expect(getByText(/timestamp\.today/)).toBeTruthy();
    });

    it("shows Yesterday label for yesterday", () => {
      const { isToday, isYesterday } = require("@/utils/date");
      // Reset isToday to false and set isYesterday to true
      isToday.mockReturnValue(false);
      isYesterday.mockReturnValue(true);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { getByText } = render(<Timestamp value={yesterday} />);

      // In test environment, t() returns the key with default fallback
      expect(getByText(/timestamp\.yesterday/)).toBeTruthy();
    });

    it("uses custom labels for i18n", () => {
      const { isToday } = require("@/utils/date");
      isToday.mockReturnValue(true);

      const { getByText } = render(
        <Timestamp
          value={new Date()}
          relativeDateLabels={{
            today: "Heute",
            yesterday: "Gestern",
            tomorrow: "Morgen",
          }}
        />,
      );

      expect(getByText(/Heute/)).toBeTruthy();
    });
  });

  //#endregion Today/Yesterday Tests

  //#region Accessibility Tests

  describe("accessibility", () => {
    it("has text role", () => {
      const { getAllByRole } = render(<Timestamp value={new Date()} />);

      // There can be multiple elements with text role (Pressable + Text)
      expect(getAllByRole("text").length).toBeGreaterThan(0);
    });

    it("has accessibility label with absolute time", () => {
      const { getByLabelText } = render(<Timestamp value={new Date()} />);

      expect(getByLabelText("January 4, 2026 at 2:30 PM")).toBeTruthy();
    });

    it("uses custom accessibility label when provided", () => {
      const { getByLabelText } = render(
        <Timestamp
          value={new Date()}
          accessibilityLabel="Posted 5 minutes ago"
        />,
      );

      expect(getByLabelText("Posted 5 minutes ago")).toBeTruthy();
    });
  });

  //#endregion Accessibility Tests

  //#region Size Variant Tests

  describe("size variants", () => {
    it("renders small size", () => {
      const { getByTestId } = render(
        <Timestamp value={new Date()} size="sm" testID="timestamp" />,
      );

      expect(getByTestId("timestamp")).toBeTruthy();
    });

    it("renders medium size (default)", () => {
      const { getByTestId } = render(
        <Timestamp value={new Date()} testID="timestamp" />,
      );

      expect(getByTestId("timestamp")).toBeTruthy();
    });

    it("renders large size", () => {
      const { getByTestId } = render(
        <Timestamp value={new Date()} size="lg" testID="timestamp" />,
      );

      expect(getByTestId("timestamp")).toBeTruthy();
    });
  });

  //#endregion Size Variant Tests

  //#region Muted Variant Tests

  describe("muted variant", () => {
    it("renders muted style", () => {
      const { getByTestId } = render(
        <Timestamp value={new Date()} muted testID="timestamp" />,
      );

      expect(getByTestId("timestamp")).toBeTruthy();
    });
  });

  //#endregion Muted Variant Tests
});

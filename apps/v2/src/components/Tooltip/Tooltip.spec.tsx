// apps/v2/src/components/Tooltip/Tooltip.spec.tsx

import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";

import { Tooltip } from "./Tooltip";

//#region Test Setup

describe("<Tooltip />", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  //#endregion Test Setup

  //#region Rendering Tests

  describe("rendering", () => {
    it("renders children (trigger element)", () => {
      const { getByText } = render(
        <Tooltip content="Tooltip text">
          <Text>Trigger</Text>
        </Tooltip>,
      );

      expect(getByText("Trigger")).toBeTruthy();
    });

    it("does not show tooltip content initially", () => {
      const { queryByText } = render(
        <Tooltip content="Tooltip text">
          <Text>Trigger</Text>
        </Tooltip>,
      );

      expect(queryByText("Tooltip text")).toBeNull();
    });

    it("renders with testID", () => {
      const { getByTestId } = render(
        <Tooltip content="Tooltip text" testID="my-tooltip">
          <Text>Trigger</Text>
        </Tooltip>,
      );

      expect(getByTestId("my-tooltip")).toBeTruthy();
      expect(getByTestId("my-tooltip-trigger")).toBeTruthy();
    });
  });

  //#endregion Rendering Tests

  //#region Content Display Tests

  describe("content display", () => {
    it("displays content prop correctly", async () => {
      const { getByText, queryByText } = render(
        <Tooltip content="Hello tooltip" showDelay={0}>
          <Text>Trigger</Text>
        </Tooltip>,
      );

      fireEvent(getByText("Trigger"), "longPress");

      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(queryByText("Hello tooltip")).toBeTruthy();
      });
    });

    it("displays contentKey (i18n) correctly", async () => {
      const { getByText, queryByText } = render(
        <Tooltip contentKey="label.save" showDelay={0}>
          <Text>Trigger</Text>
        </Tooltip>,
      );

      fireEvent(getByText("Trigger"), "longPress");

      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        // "label.save" translates to "Save" in en.json
        expect(queryByText("Save")).toBeTruthy();
      });
    });
  });

  //#endregion Content Display Tests

  //#region Trigger Tests

  describe("trigger interactions", () => {
    it("shows tooltip on long press (mobile)", async () => {
      const { getByText, queryByText } = render(
        <Tooltip content="Tooltip content" showDelay={0}>
          <Text>Trigger</Text>
        </Tooltip>,
      );

      fireEvent(getByText("Trigger"), "longPress");

      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(queryByText("Tooltip content")).toBeTruthy();
      });
    });

    it("hides tooltip on press out", async () => {
      const { getByText, queryByText } = render(
        <Tooltip content="Tooltip content" showDelay={0} hideDelay={0}>
          <Text>Trigger</Text>
        </Tooltip>,
      );

      // Show tooltip
      fireEvent(getByText("Trigger"), "longPress");

      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(queryByText("Tooltip content")).toBeTruthy();
      });

      // Hide tooltip
      fireEvent(getByText("Trigger"), "pressOut");

      await act(async () => {
        jest.advanceTimersByTime(ANIMATION_DURATION);
      });

      await waitFor(() => {
        expect(queryByText("Tooltip content")).toBeNull();
      });
    });
  });

  //#endregion Trigger Tests

  //#region Delay Tests

  describe("delays", () => {
    it("respects showDelay prop", async () => {
      const { getByText, queryByText } = render(
        <Tooltip content="Delayed tooltip" showDelay={500}>
          <Text>Trigger</Text>
        </Tooltip>,
      );

      fireEvent(getByText("Trigger"), "longPress");

      // Not visible yet at 200ms
      await act(async () => {
        jest.advanceTimersByTime(200);
      });
      expect(queryByText("Delayed tooltip")).toBeNull();

      // Visible after full 500ms delay
      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(queryByText("Delayed tooltip")).toBeTruthy();
      });
    });

    it("respects hideDelay prop", async () => {
      const { getByText, queryByText } = render(
        <Tooltip content="Tooltip content" showDelay={0} hideDelay={200}>
          <Text>Trigger</Text>
        </Tooltip>,
      );

      // Show tooltip
      fireEvent(getByText("Trigger"), "longPress");

      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(queryByText("Tooltip content")).toBeTruthy();
      });

      // Trigger hide
      fireEvent(getByText("Trigger"), "pressOut");

      // Still visible at 100ms (hideDelay is 200ms)
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
      expect(queryByText("Tooltip content")).toBeTruthy();

      // Hidden after full delay + animation
      await act(async () => {
        jest.advanceTimersByTime(100 + ANIMATION_DURATION);
      });

      await waitFor(() => {
        expect(queryByText("Tooltip content")).toBeNull();
      });
    });
  });

  //#endregion Delay Tests

  //#region Disabled State Tests

  describe("disabled state", () => {
    it("does not show tooltip when disabled", async () => {
      const { getByText, queryByText } = render(
        <Tooltip content="Disabled tooltip" disabled showDelay={0}>
          <Text>Trigger</Text>
        </Tooltip>,
      );

      fireEvent(getByText("Trigger"), "longPress");

      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      expect(queryByText("Disabled tooltip")).toBeNull();
    });
  });

  //#endregion Disabled State Tests

  //#region Callback Tests

  describe("callbacks", () => {
    it("calls onOpen when tooltip shows", async () => {
      const onOpen = jest.fn();

      const { getByText } = render(
        <Tooltip content="Tooltip" onOpen={onOpen} showDelay={0}>
          <Text>Trigger</Text>
        </Tooltip>,
      );

      fireEvent(getByText("Trigger"), "longPress");

      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(onOpen).toHaveBeenCalledTimes(1);
      });
    });

    it("calls onClose when tooltip hides", async () => {
      const onClose = jest.fn();

      const { getByText } = render(
        <Tooltip
          content="Tooltip"
          onClose={onClose}
          showDelay={0}
          hideDelay={0}
        >
          <Text>Trigger</Text>
        </Tooltip>,
      );

      // Show tooltip
      fireEvent(getByText("Trigger"), "longPress");

      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      // Hide tooltip
      fireEvent(getByText("Trigger"), "pressOut");

      await act(async () => {
        jest.advanceTimersByTime(ANIMATION_DURATION);
      });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  //#endregion Callback Tests

  //#region Placement Tests

  describe("placement variants", () => {
    it.each(["top", "bottom", "left", "right"] as const)(
      "renders with placement %s",
      (placement) => {
        const { getByText } = render(
          <Tooltip content="Content" placement={placement}>
            <Text>Trigger</Text>
          </Tooltip>,
        );

        expect(getByText("Trigger")).toBeTruthy();
      },
    );

    it("uses top placement by default", () => {
      const { getByText } = render(
        <Tooltip content="Content">
          <Text>Trigger</Text>
        </Tooltip>,
      );

      expect(getByText("Trigger")).toBeTruthy();
    });
  });

  //#endregion Placement Tests

  //#region Accessibility Tests

  describe("accessibility", () => {
    it("has tooltip accessibilityRole on content", async () => {
      const { getByText, getByTestId } = render(
        <Tooltip
          content="Accessible tooltip"
          showDelay={0}
          testID="acc-tooltip"
        >
          <Text>Trigger</Text>
        </Tooltip>,
      );

      fireEvent(getByText("Trigger"), "longPress");

      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const content = getByTestId("acc-tooltip-content");
        expect(content.props.accessibilityRole).toBe("text");
      });
    });

    it("provides accessibility hint on trigger", () => {
      const { getByTestId } = render(
        <Tooltip content="Helpful hint" testID="hint-tooltip">
          <Text>Trigger</Text>
        </Tooltip>,
      );

      const trigger = getByTestId("hint-tooltip-trigger");
      expect(trigger.props.accessibilityHint).toBe("Helpful hint");
    });
  });

  //#endregion Accessibility Tests

  //#region Ref Tests

  describe("ref forwarding", () => {
    it("forwards ref to container View", () => {
      const ref = { current: null };
      render(
        <Tooltip content="Tooltip" ref={ref}>
          <Text>Trigger</Text>
        </Tooltip>,
      );

      expect(ref.current).toBeTruthy();
    });
  });

  //#endregion Ref Tests
});

//#region Constants

const ANIMATION_DURATION = 150;

//#endregion Constants

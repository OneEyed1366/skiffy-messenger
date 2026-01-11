// apps/v2/src/components/Toggle/Toggle.spec.tsx

import { render, fireEvent } from "@testing-library/react-native";
import { Toggle } from "./Toggle";

//#region Basic Rendering

describe("<Toggle />", () => {
  describe("default state", () => {
    it("renders with default state (off)", () => {
      const { getByTestId } = render(<Toggle testID="toggle" />);
      const toggle = getByTestId("toggle");

      expect(toggle.props.value).toBe(false);
    });

    it("renders on state when value is true", () => {
      const { getByTestId } = render(<Toggle value={true} testID="toggle" />);
      const toggle = getByTestId("toggle");

      expect(toggle.props.value).toBe(true);
    });
  });

  //#endregion Basic Rendering

  //#region Interaction

  describe("interaction", () => {
    it("calls onValueChange when toggled", () => {
      const onValueChange = jest.fn();
      const { getByTestId } = render(
        <Toggle value={false} onValueChange={onValueChange} testID="toggle" />,
      );

      const toggle = getByTestId("toggle");
      fireEvent(toggle, "valueChange", true);

      expect(onValueChange).toHaveBeenCalledWith(true);
    });

    it("calls onValueChange with false when toggled from on state", () => {
      const onValueChange = jest.fn();
      const { getByTestId } = render(
        <Toggle value={true} onValueChange={onValueChange} testID="toggle" />,
      );

      const toggle = getByTestId("toggle");
      fireEvent(toggle, "valueChange", false);

      expect(onValueChange).toHaveBeenCalledWith(false);
    });

    it("does not call onValueChange when disabled", () => {
      const onValueChange = jest.fn();
      const { getByTestId } = render(
        <Toggle
          value={false}
          onValueChange={onValueChange}
          disabled={true}
          testID="toggle"
        />,
      );

      const toggle = getByTestId("toggle");
      fireEvent(toggle, "valueChange", true);

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  //#endregion Interaction

  //#region Label

  describe("label", () => {
    it("renders label text", () => {
      const { getByText } = render(<Toggle label="Enable notifications" />);

      expect(getByText("Enable notifications")).toBeTruthy();
    });

    it("renders label from labelKey (i18n)", () => {
      const { getByText } = render(<Toggle labelKey="label.new" />);
      // The i18n mock uses actual translations from en.json
      expect(getByText("New")).toBeTruthy();
    });

    it("renders label on the right by default", () => {
      const { getByText, getByTestId } = render(
        <Toggle label="Enable" testID="toggle" />,
      );

      // Both should be present
      expect(getByText("Enable")).toBeTruthy();
      expect(getByTestId("toggle")).toBeTruthy();
    });

    it("renders label on the left when labelPosition is left", () => {
      const { getByText, getByTestId } = render(
        <Toggle label="Enable" labelPosition="left" testID="toggle" />,
      );

      expect(getByText("Enable")).toBeTruthy();
      expect(getByTestId("toggle")).toBeTruthy();
    });

    it("toggles when label container is pressed", () => {
      const onValueChange = jest.fn();
      const { getByTestId } = render(
        <Toggle
          value={false}
          onValueChange={onValueChange}
          label="Enable"
          testID="toggle"
        />,
      );

      // Press the container (which includes the label)
      const container = getByTestId("toggle-container");
      fireEvent.press(container);

      expect(onValueChange).toHaveBeenCalledWith(true);
    });
  });

  //#endregion Label

  //#region Disabled State

  describe("disabled state", () => {
    it("sets accessibility disabled state", () => {
      const { getByTestId } = render(<Toggle disabled testID="toggle" />);
      const toggle = getByTestId("toggle");

      expect(toggle.props.accessibilityState.disabled).toBe(true);
    });

    it("prevents label container press when disabled", () => {
      const onValueChange = jest.fn();
      const { getByTestId } = render(
        <Toggle
          value={false}
          onValueChange={onValueChange}
          disabled={true}
          label="Enable"
          testID="toggle"
        />,
      );

      const container = getByTestId("toggle-container");
      fireEvent.press(container);

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  //#endregion Disabled State

  //#region Size Variants

  describe("size variants", () => {
    it("renders sm size", () => {
      const { getByTestId } = render(<Toggle size="sm" testID="toggle" />);

      expect(getByTestId("toggle")).toBeTruthy();
    });

    it("renders md size by default", () => {
      const { getByTestId } = render(<Toggle testID="toggle" />);

      expect(getByTestId("toggle")).toBeTruthy();
    });

    it("renders lg size", () => {
      const { getByTestId } = render(<Toggle size="lg" testID="toggle" />);

      expect(getByTestId("toggle")).toBeTruthy();
    });
  });

  //#endregion Size Variants

  //#region Accessibility

  describe("accessibility", () => {
    it("has switch role", () => {
      const { getByTestId } = render(<Toggle testID="toggle" />);
      const toggle = getByTestId("toggle");

      expect(toggle.props.accessibilityRole).toBe("switch");
    });

    it("has correct accessibility state when on", () => {
      const { getByTestId } = render(<Toggle value={true} testID="toggle" />);
      const toggle = getByTestId("toggle");

      expect(toggle.props.accessibilityState).toEqual({
        checked: true,
        disabled: false,
      });
    });

    it("has correct accessibility state when off", () => {
      const { getByTestId } = render(<Toggle value={false} testID="toggle" />);
      const toggle = getByTestId("toggle");

      expect(toggle.props.accessibilityState).toEqual({
        checked: false,
        disabled: false,
      });
    });

    it("has correct accessibility state when disabled", () => {
      const { getByTestId } = render(
        <Toggle value={false} disabled={true} testID="toggle" />,
      );
      const toggle = getByTestId("toggle");

      expect(toggle.props.accessibilityState).toEqual({
        checked: false,
        disabled: true,
      });
    });

    it("uses label as accessibilityLabel", () => {
      const { getByTestId } = render(
        <Toggle label="Enable notifications" testID="toggle" />,
      );
      const toggle = getByTestId("toggle");

      expect(toggle.props.accessibilityLabel).toBe("Enable notifications");
    });

    it("uses translated labelKey as accessibilityLabel", () => {
      const { getByTestId } = render(
        <Toggle labelKey="label.new" testID="toggle" />,
      );
      const toggle = getByTestId("toggle");

      expect(toggle.props.accessibilityLabel).toBe("New");
    });
  });

  //#endregion Accessibility

  //#region Ref Forwarding

  describe("ref forwarding", () => {
    it("forwards ref to Switch", () => {
      const ref = { current: null };
      render(<Toggle ref={ref} testID="toggle" />);

      expect(ref.current).not.toBeNull();
    });
  });

  //#endregion Ref Forwarding
});

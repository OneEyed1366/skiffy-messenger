// apps/v2/src/components/Button/Button.spec.tsx

import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "./Button";

//#region Rendering Tests

describe("<Button />", () => {
  describe("rendering", () => {
    it("renders with titleKey", () => {
      const { getByText } = render(<Button titleKey="label.save" />);
      expect(getByText("Save")).toBeTruthy();
    });

    it("renders with direct title", () => {
      const { getByText } = render(<Button title="Click me" />);
      expect(getByText("Click me")).toBeTruthy();
    });

    it("renders with testID", () => {
      const { getByTestId } = render(
        <Button title="Test" testID="test-button" />,
      );
      expect(getByTestId("test-button")).toBeTruthy();
    });
  });

  //#endregion Rendering Tests

  //#region Interaction Tests

  describe("interactions", () => {
    it("calls onPress when pressed", () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button title="Press me" onPress={onPress} />,
      );

      fireEvent.press(getByText("Press me"));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("calls onLongPress when long pressed", () => {
      const onLongPress = jest.fn();
      const { getByText } = render(
        <Button title="Hold me" onLongPress={onLongPress} />,
      );

      fireEvent(getByText("Hold me"), "longPress");
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });

    it("does not call onPress when disabled", () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button title="Disabled" onPress={onPress} disabled />,
      );

      fireEvent.press(getByText("Disabled"));
      expect(onPress).not.toHaveBeenCalled();
    });

    it("does not call onPress when loading", () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button title="Loading" onPress={onPress} loading />,
      );

      fireEvent.press(getByText("Loading"));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  //#endregion Interaction Tests

  //#region Variant Tests

  describe("variants", () => {
    it("renders primary variant", () => {
      const { getByRole } = render(
        <Button title="Primary" variant="primary" />,
      );
      expect(getByRole("button")).toBeTruthy();
    });

    it("renders secondary variant", () => {
      const { getByRole } = render(
        <Button title="Secondary" variant="secondary" />,
      );
      expect(getByRole("button")).toBeTruthy();
    });

    it("renders tertiary variant", () => {
      const { getByRole } = render(
        <Button title="Tertiary" variant="tertiary" />,
      );
      expect(getByRole("button")).toBeTruthy();
    });

    it("renders destructive variant", () => {
      const { getByRole } = render(
        <Button title="Delete" variant="destructive" />,
      );
      expect(getByRole("button")).toBeTruthy();
    });

    it("renders link variant", () => {
      const { getByRole } = render(<Button title="Link" variant="link" />);
      expect(getByRole("button")).toBeTruthy();
    });
  });

  //#endregion Variant Tests

  //#region Size Tests

  describe("sizes", () => {
    it("renders small size", () => {
      const { getByRole } = render(<Button title="Small" size="sm" />);
      expect(getByRole("button")).toBeTruthy();
    });

    it("renders medium size (default)", () => {
      const { getByRole } = render(<Button title="Medium" />);
      expect(getByRole("button")).toBeTruthy();
    });

    it("renders large size", () => {
      const { getByRole } = render(<Button title="Large" size="lg" />);
      expect(getByRole("button")).toBeTruthy();
    });
  });

  //#endregion Size Tests

  //#region Loading State Tests

  describe("loading state", () => {
    it("shows loading indicator when loading", () => {
      const { getByTestId } = render(
        <Button title="Loading" loading testID="btn" />,
      );
      expect(getByTestId("btn-loading")).toBeTruthy();
    });

    it("shows loading text when loadingTitleKey provided", () => {
      const { getByText } = render(
        <Button title="Save" loading loadingTitleKey="label.saving" />,
      );
      expect(getByText("Saving")).toBeTruthy();
    });

    it("disables button when loading", () => {
      const { getByRole } = render(<Button title="Loading" loading />);
      expect(getByRole("button").props.accessibilityState.disabled).toBe(true);
    });
  });

  //#endregion Loading State Tests

  //#region Icon Tests

  describe("icons", () => {
    it("renders left icon", () => {
      const { getByTestId } = render(
        <Button title="With Icon" iconLeft={<></>} />,
      );
      expect(getByTestId("icon-left")).toBeTruthy();
    });

    it("renders right icon", () => {
      const { getByTestId } = render(
        <Button title="With Icon" iconRight={<></>} />,
      );
      expect(getByTestId("icon-right")).toBeTruthy();
    });

    it("does not render icons when loading", () => {
      const { queryByTestId } = render(
        <Button title="Loading" loading iconLeft={<></>} iconRight={<></>} />,
      );
      // Icons should be hidden during loading
      expect(queryByTestId("icon-left")).toBeNull();
      expect(queryByTestId("icon-right")).toBeNull();
    });
  });

  //#endregion Icon Tests

  //#region Accessibility Tests

  describe("accessibility", () => {
    it("has button role", () => {
      const { getByRole } = render(<Button title="Accessible" />);
      expect(getByRole("button")).toBeTruthy();
    });

    it("has disabled accessibility state when disabled", () => {
      const { getByRole } = render(<Button title="Disabled" disabled />);
      expect(getByRole("button").props.accessibilityState.disabled).toBe(true);
    });

    it("has enabled accessibility state when not disabled", () => {
      const { getByRole } = render(<Button title="Enabled" />);
      expect(getByRole("button").props.accessibilityState.disabled).toBe(false);
    });
  });

  //#endregion Accessibility Tests

  //#region Full Width Tests

  describe("fullWidth", () => {
    it("renders full width button", () => {
      const { getByRole } = render(<Button title="Full" fullWidth />);
      expect(getByRole("button")).toBeTruthy();
    });
  });

  //#endregion Full Width Tests

  //#region Ref Tests

  describe("ref forwarding", () => {
    it("forwards ref to Pressable", () => {
      const ref = { current: null };
      render(<Button title="With Ref" ref={ref} />);
      expect(ref.current).toBeTruthy();
    });
  });

  //#endregion Ref Tests
});

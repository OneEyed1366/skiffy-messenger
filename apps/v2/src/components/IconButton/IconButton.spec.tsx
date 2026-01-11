// apps/v2/src/components/IconButton/IconButton.spec.tsx

import { fireEvent, render } from "@testing-library/react-native";
import { createRef } from "react";
import { Pressable, View } from "react-native";

import { IconButton } from "./IconButton";

const MockIcon = () => <View testID="mock-icon" />;

//#region Rendering Tests

describe("<IconButton />", () => {
  describe("rendering", () => {
    it("renders icon", () => {
      const { getByTestId } = render(
        <IconButton icon={<MockIcon />} accessibilityLabel="Test button" />,
      );
      expect(getByTestId("mock-icon")).toBeTruthy();
    });

    it("renders with testID", () => {
      const { getByTestId } = render(
        <IconButton
          icon={<MockIcon />}
          accessibilityLabel="Test"
          testID="icon-button"
        />,
      );
      expect(getByTestId("icon-button")).toBeTruthy();
    });
  });

  //#endregion Rendering Tests

  //#region Interaction Tests

  describe("interactions", () => {
    it("calls onPress when pressed", () => {
      const onPress = jest.fn();
      const { getByRole } = render(
        <IconButton
          icon={<MockIcon />}
          accessibilityLabel="Press me"
          onPress={onPress}
        />,
      );

      fireEvent.press(getByRole("button"));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("calls onLongPress when long pressed", () => {
      const onLongPress = jest.fn();
      const { getByRole } = render(
        <IconButton
          icon={<MockIcon />}
          accessibilityLabel="Hold me"
          onLongPress={onLongPress}
        />,
      );

      fireEvent(getByRole("button"), "longPress");
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });

    it("does not call onPress when disabled", () => {
      const onPress = jest.fn();
      const { getByRole } = render(
        <IconButton
          icon={<MockIcon />}
          accessibilityLabel="Disabled"
          onPress={onPress}
          disabled
        />,
      );

      fireEvent.press(getByRole("button"));
      expect(onPress).not.toHaveBeenCalled();
    });

    it("does not call onLongPress when disabled", () => {
      const onLongPress = jest.fn();
      const { getByRole } = render(
        <IconButton
          icon={<MockIcon />}
          accessibilityLabel="Disabled"
          onLongPress={onLongPress}
          disabled
        />,
      );

      fireEvent(getByRole("button"), "longPress");
      expect(onLongPress).not.toHaveBeenCalled();
    });
  });

  //#endregion Interaction Tests

  //#region Size Tests

  describe("sizes", () => {
    it("renders small size", () => {
      const { getByRole } = render(
        <IconButton icon={<MockIcon />} accessibilityLabel="Small" size="sm" />,
      );
      expect(getByRole("button")).toBeTruthy();
    });

    it("renders medium size (default)", () => {
      const { getByRole } = render(
        <IconButton icon={<MockIcon />} accessibilityLabel="Medium" />,
      );
      expect(getByRole("button")).toBeTruthy();
    });

    it("renders large size", () => {
      const { getByRole } = render(
        <IconButton icon={<MockIcon />} accessibilityLabel="Large" size="lg" />,
      );
      expect(getByRole("button")).toBeTruthy();
    });
  });

  //#endregion Size Tests

  //#region Variant Tests

  describe("variants", () => {
    it("renders default variant", () => {
      const { getByRole } = render(
        <IconButton
          icon={<MockIcon />}
          accessibilityLabel="Default"
          variant="default"
        />,
      );
      expect(getByRole("button")).toBeTruthy();
    });

    it("renders filled variant", () => {
      const { getByRole } = render(
        <IconButton
          icon={<MockIcon />}
          accessibilityLabel="Filled"
          variant="filled"
        />,
      );
      expect(getByRole("button")).toBeTruthy();
    });

    it("renders outline variant", () => {
      const { getByRole } = render(
        <IconButton
          icon={<MockIcon />}
          accessibilityLabel="Outline"
          variant="outline"
        />,
      );
      expect(getByRole("button")).toBeTruthy();
    });
  });

  //#endregion Variant Tests

  //#region State Tests

  describe("states", () => {
    it("handles toggled state", () => {
      const { getByRole } = render(
        <IconButton icon={<MockIcon />} accessibilityLabel="Toggled" toggled />,
      );
      expect(getByRole("button").props.accessibilityState.selected).toBe(true);
    });

    it("renders badge when showBadge is true", () => {
      const { getByTestId } = render(
        <IconButton
          icon={<MockIcon />}
          accessibilityLabel="With badge"
          showBadge
          testID="btn"
        />,
      );
      expect(getByTestId("btn-badge")).toBeTruthy();
    });

    it("does not render badge when showBadge is false", () => {
      const { queryByTestId } = render(
        <IconButton
          icon={<MockIcon />}
          accessibilityLabel="Without badge"
          showBadge={false}
          testID="btn"
        />,
      );
      expect(queryByTestId("btn-badge")).toBeNull();
    });

    it("applies custom badge color", () => {
      const customColor = "#ff0000";
      const { getByTestId } = render(
        <IconButton
          icon={<MockIcon />}
          accessibilityLabel="Custom badge"
          showBadge
          badgeColor={customColor}
          testID="btn"
        />,
      );
      const badge = getByTestId("btn-badge");
      expect(badge.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ backgroundColor: customColor }),
        ]),
      );
    });
  });

  //#endregion State Tests

  //#region Accessibility Tests

  describe("accessibility", () => {
    it("has button role", () => {
      const { getByRole } = render(
        <IconButton icon={<MockIcon />} accessibilityLabel="Accessible" />,
      );
      expect(getByRole("button")).toBeTruthy();
    });

    it("uses accessibilityLabel", () => {
      const { getByLabelText } = render(
        <IconButton icon={<MockIcon />} accessibilityLabel="Close menu" />,
      );
      expect(getByLabelText("Close menu")).toBeTruthy();
    });

    it("has disabled accessibility state when disabled", () => {
      const { getByRole } = render(
        <IconButton
          icon={<MockIcon />}
          accessibilityLabel="Disabled"
          disabled
        />,
      );
      expect(getByRole("button").props.accessibilityState.disabled).toBe(true);
    });

    it("has selected accessibility state when toggled", () => {
      const { getByRole } = render(
        <IconButton
          icon={<MockIcon />}
          accessibilityLabel="Selected"
          toggled
        />,
      );
      expect(getByRole("button").props.accessibilityState.selected).toBe(true);
    });
  });

  //#endregion Accessibility Tests

  //#region Ref Tests

  describe("ref forwarding", () => {
    it("forwards ref to Pressable", () => {
      const ref = createRef<React.ComponentRef<typeof Pressable>>();
      render(
        <IconButton
          icon={<MockIcon />}
          accessibilityLabel="With ref"
          ref={ref}
        />,
      );
      expect(ref.current).toBeTruthy();
    });
  });

  //#endregion Ref Tests
});

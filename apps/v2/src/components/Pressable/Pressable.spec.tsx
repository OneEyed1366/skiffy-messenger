// apps/v2/src/components/Pressable/Pressable.spec.tsx

import { render, fireEvent } from "@testing-library/react-native";
import { Text } from "react-native";
import { Pressable } from "./Pressable";

//#region Rendering Tests

describe("<Pressable />", () => {
  describe("rendering", () => {
    it("renders children", () => {
      const { getByText } = render(
        <Pressable>
          <Text>Press me</Text>
        </Pressable>,
      );
      expect(getByText("Press me")).toBeTruthy();
    });

    it("renders with render prop children", () => {
      const { getByText } = render(
        <Pressable>
          {({ pressed }) => <Text>{pressed ? "Pressed" : "Not pressed"}</Text>}
        </Pressable>,
      );
      expect(getByText("Not pressed")).toBeTruthy();
    });

    it("renders with testID", () => {
      const { getByTestId } = render(
        <Pressable testID="pressable">
          <Text>Content</Text>
        </Pressable>,
      );
      expect(getByTestId("pressable")).toBeTruthy();
    });
  });

  //#endregion Rendering Tests

  //#region Interaction Tests

  describe("interactions", () => {
    it("calls onPress when pressed", () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Pressable onPress={onPress}>
          <Text>Press me</Text>
        </Pressable>,
      );

      fireEvent.press(getByText("Press me"));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("calls onLongPress when long pressed", () => {
      const onLongPress = jest.fn();
      const { getByText } = render(
        <Pressable onLongPress={onLongPress}>
          <Text>Hold me</Text>
        </Pressable>,
      );

      fireEvent(getByText("Hold me"), "longPress");
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });

    it("calls onPressIn and onPressOut", () => {
      const onPressIn = jest.fn();
      const onPressOut = jest.fn();
      const { getByText } = render(
        <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
          <Text>Touch me</Text>
        </Pressable>,
      );

      fireEvent(getByText("Touch me"), "pressIn");
      expect(onPressIn).toHaveBeenCalledTimes(1);

      fireEvent(getByText("Touch me"), "pressOut");
      expect(onPressOut).toHaveBeenCalledTimes(1);
    });

    it("does not call onPress when disabled", () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Pressable onPress={onPress} disabled>
          <Text>Disabled</Text>
        </Pressable>,
      );

      fireEvent.press(getByText("Disabled"));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  //#endregion Interaction Tests

  //#region Feedback Tests

  describe("feedback", () => {
    it("applies opacity feedback by default", () => {
      const { getByRole } = render(
        <Pressable>
          <Text>Content</Text>
        </Pressable>,
      );
      expect(getByRole("button")).toBeTruthy();
    });

    it("supports highlight feedback", () => {
      const { getByRole } = render(
        <Pressable feedback="highlight">
          <Text>Content</Text>
        </Pressable>,
      );
      expect(getByRole("button")).toBeTruthy();
    });

    it("supports none feedback", () => {
      const { getByRole } = render(
        <Pressable feedback="none">
          <Text>Content</Text>
        </Pressable>,
      );
      expect(getByRole("button")).toBeTruthy();
    });
  });

  //#endregion Feedback Tests

  //#region Accessibility Tests

  describe("accessibility", () => {
    it("has button role by default", () => {
      const { getByRole } = render(
        <Pressable>
          <Text>Button</Text>
        </Pressable>,
      );
      expect(getByRole("button")).toBeTruthy();
    });

    it("supports custom accessibility role", () => {
      const { getByRole } = render(
        <Pressable accessibilityRole="link">
          <Text>Link</Text>
        </Pressable>,
      );
      expect(getByRole("link")).toBeTruthy();
    });

    it("uses accessibilityLabel", () => {
      const { getByLabelText } = render(
        <Pressable accessibilityLabel="Custom action">
          <Text>Action</Text>
        </Pressable>,
      );
      expect(getByLabelText("Custom action")).toBeTruthy();
    });

    it("has disabled accessibility state when disabled", () => {
      const { getByRole } = render(
        <Pressable disabled>
          <Text>Disabled</Text>
        </Pressable>,
      );
      expect(getByRole("button").props.accessibilityState.disabled).toBe(true);
    });
  });

  //#endregion Accessibility Tests

  //#region Hit Slop Tests

  describe("hit slop", () => {
    it("accepts number hit slop", () => {
      const { getByRole } = render(
        <Pressable hitSlop={10}>
          <Text>Content</Text>
        </Pressable>,
      );
      expect(getByRole("button").props.hitSlop).toBe(10);
    });

    it("accepts object hit slop", () => {
      const hitSlop = { top: 10, bottom: 10, left: 20, right: 20 };
      const { getByRole } = render(
        <Pressable hitSlop={hitSlop}>
          <Text>Content</Text>
        </Pressable>,
      );
      expect(getByRole("button").props.hitSlop).toEqual(hitSlop);
    });
  });

  //#endregion Hit Slop Tests
});

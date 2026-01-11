// apps/v2/src/components/Pill/Pill.spec.tsx

import { render, fireEvent } from "@testing-library/react-native";
import { Pill } from "./Pill";

//#region Rendering Tests

describe("<Pill />", () => {
  describe("rendering", () => {
    it("renders with labelKey", () => {
      const { getByText } = render(<Pill labelKey="label.new" />);
      // The i18n mock uses actual translations from en.json
      expect(getByText("New")).toBeTruthy();
    });

    it("renders with direct label", () => {
      const { getByText } = render(<Pill label="Custom Label" />);
      expect(getByText("Custom Label")).toBeTruthy();
    });

    it("renders with testID", () => {
      const { getByTestId } = render(<Pill label="Test" testID="test-pill" />);
      expect(getByTestId("test-pill")).toBeTruthy();
    });
  });

  //#endregion Rendering Tests

  //#region Interaction Tests

  describe("interactions", () => {
    it("calls onPress when pressed", () => {
      const onPress = jest.fn();
      const { getByText } = render(<Pill label="Press me" onPress={onPress} />);

      fireEvent.press(getByText("Press me"));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("calls onDismiss when dismiss button pressed", () => {
      const onDismiss = jest.fn();
      const { getByTestId } = render(
        <Pill label="Dismissible" onDismiss={onDismiss} testID="pill" />,
      );

      fireEvent.press(getByTestId("pill-dismiss"));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("does not call onPress when disabled", () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Pill label="Disabled" onPress={onPress} disabled />,
      );

      fireEvent.press(getByText("Disabled"));
      expect(onPress).not.toHaveBeenCalled();
    });

    it("does not call onDismiss when disabled", () => {
      const onDismiss = jest.fn();
      const { getByTestId } = render(
        <Pill label="Disabled" onDismiss={onDismiss} disabled testID="pill" />,
      );

      fireEvent.press(getByTestId("pill-dismiss"));
      expect(onDismiss).not.toHaveBeenCalled();
    });
  });

  //#endregion Interaction Tests

  //#region Color Variant Tests

  describe("color variants", () => {
    it("renders neutral color", () => {
      const { getByRole } = render(<Pill label="Neutral" color="neutral" />);
      expect(getByRole("text")).toBeTruthy();
    });

    it("renders info color", () => {
      const { getByRole } = render(<Pill label="Info" color="info" />);
      expect(getByRole("text")).toBeTruthy();
    });

    it("renders success color", () => {
      const { getByRole } = render(<Pill label="Success" color="success" />);
      expect(getByRole("text")).toBeTruthy();
    });

    it("renders warning color", () => {
      const { getByRole } = render(<Pill label="Warning" color="warning" />);
      expect(getByRole("text")).toBeTruthy();
    });

    it("renders danger color", () => {
      const { getByRole } = render(<Pill label="Danger" color="danger" />);
      expect(getByRole("text")).toBeTruthy();
    });
  });

  //#endregion Color Variant Tests

  //#region Size Tests

  describe("sizes", () => {
    it("renders small size", () => {
      const { getByRole } = render(<Pill label="Small" size="sm" />);
      expect(getByRole("text")).toBeTruthy();
    });

    it("renders medium size (default)", () => {
      const { getByRole } = render(<Pill label="Medium" />);
      expect(getByRole("text")).toBeTruthy();
    });

    it("renders large size", () => {
      const { getByRole } = render(<Pill label="Large" size="lg" />);
      expect(getByRole("text")).toBeTruthy();
    });
  });

  //#endregion Size Tests

  //#region Icon Tests

  describe("icons", () => {
    it("renders left icon", () => {
      const Icon = () => <></>;
      const { UNSAFE_getByType } = render(
        <Pill label="With Icon" iconLeft={<Icon />} />,
      );
      expect(UNSAFE_getByType(Icon)).toBeTruthy();
    });
  });

  //#endregion Icon Tests

  //#region Dismiss Button Tests

  describe("dismiss button", () => {
    it("shows dismiss button when onDismiss provided", () => {
      const { getByTestId } = render(
        <Pill label="Dismissible" onDismiss={() => {}} testID="pill" />,
      );
      expect(getByTestId("pill-dismiss")).toBeTruthy();
    });

    it("hides dismiss button when onDismiss not provided", () => {
      const { queryByTestId } = render(
        <Pill label="Not Dismissible" testID="pill" />,
      );
      expect(queryByTestId("pill-dismiss")).toBeNull();
    });
  });

  //#endregion Dismiss Button Tests

  //#region Accessibility Tests

  describe("accessibility", () => {
    it("has text role when not interactive", () => {
      const { getByRole } = render(<Pill label="Static" />);
      expect(getByRole("text")).toBeTruthy();
    });

    it("has button role when onPress provided", () => {
      const { getByRole } = render(
        <Pill label="Interactive" onPress={() => {}} />,
      );
      expect(getByRole("button")).toBeTruthy();
    });

    it("has disabled accessibility state when disabled", () => {
      const { getByRole } = render(
        <Pill label="Disabled" onPress={() => {}} disabled />,
      );
      expect(getByRole("button").props.accessibilityState.disabled).toBe(true);
    });
  });

  //#endregion Accessibility Tests
});

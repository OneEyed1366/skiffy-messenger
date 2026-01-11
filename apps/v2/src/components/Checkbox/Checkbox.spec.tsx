// apps/v2/src/components/Checkbox/Checkbox.spec.tsx

import { render, fireEvent } from "@testing-library/react-native";
import { Checkbox } from "./Checkbox";

//#region State Tests

describe("<Checkbox />", () => {
  describe("checked state", () => {
    it("renders unchecked by default", () => {
      const { getByTestId } = render(<Checkbox testID="checkbox" />);
      const checkbox = getByTestId("checkbox");

      expect(checkbox.props.accessibilityState.checked).toBe(false);
    });

    it("renders checked when checked prop is true", () => {
      const { getByTestId } = render(<Checkbox checked testID="checkbox" />);
      const checkbox = getByTestId("checkbox");

      expect(checkbox.props.accessibilityState.checked).toBe(true);
    });

    it("renders indeterminate state with mixed accessibility state", () => {
      const { getByTestId } = render(
        <Checkbox indeterminate testID="checkbox" />,
      );
      const checkbox = getByTestId("checkbox");

      expect(checkbox.props.accessibilityState.checked).toBe("mixed");
    });

    it("prioritizes indeterminate over checked", () => {
      const { getByTestId } = render(
        <Checkbox checked indeterminate testID="checkbox" />,
      );
      const checkbox = getByTestId("checkbox");

      expect(checkbox.props.accessibilityState.checked).toBe("mixed");
    });
  });

  //#endregion State Tests

  //#region Label Tests

  describe("label", () => {
    it("renders label text", () => {
      const { getByText } = render(<Checkbox label="Accept terms" />);

      expect(getByText("Accept terms")).toBeTruthy();
    });

    it("renders label from labelKey (i18n)", () => {
      const { getByText } = render(<Checkbox labelKey="label.new" />);
      // The i18n mock uses actual translations from en.json
      expect(getByText("New")).toBeTruthy();
    });

    it("renders without label when not provided", () => {
      const { queryByText } = render(<Checkbox testID="checkbox" />);

      // Should only have the checkbox box, no text
      expect(queryByText(/./)).toBeNull();
    });
  });

  //#endregion Label Tests

  //#region onChange Tests

  describe("onChange", () => {
    it("calls onChange with true when unchecked checkbox is pressed", () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <Checkbox checked={false} onChange={onChange} testID="checkbox" />,
      );

      fireEvent.press(getByTestId("checkbox"));

      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("calls onChange with false when checked checkbox is pressed", () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <Checkbox checked onChange={onChange} testID="checkbox" />,
      );

      fireEvent.press(getByTestId("checkbox"));

      expect(onChange).toHaveBeenCalledWith(false);
    });

    it("does not call onChange when disabled", () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <Checkbox disabled onChange={onChange} testID="checkbox" />,
      );

      fireEvent.press(getByTestId("checkbox"));

      expect(onChange).not.toHaveBeenCalled();
    });

    it("clicking label toggles checkbox", () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <Checkbox label="Click me" onChange={onChange} />,
      );

      fireEvent.press(getByText("Click me"));

      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  //#endregion onChange Tests

  //#region Disabled State Tests

  describe("disabled state", () => {
    it("sets accessibility disabled state", () => {
      const { getByTestId } = render(<Checkbox disabled testID="checkbox" />);
      const checkbox = getByTestId("checkbox");

      expect(checkbox.props.accessibilityState.disabled).toBe(true);
    });

    it("prevents interaction when disabled", () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <Checkbox disabled onChange={onChange} testID="checkbox" />,
      );

      // Attempt to press the disabled checkbox
      fireEvent.press(getByTestId("checkbox"));

      // onChange should not be called bc Pressable is disabled
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  //#endregion Disabled State Tests

  //#region Error State Tests

  describe("error state", () => {
    it("renders error message when error and errorMessage provided", () => {
      const { getByText } = render(
        <Checkbox error errorMessage="This field is required" />,
      );

      expect(getByText("This field is required")).toBeTruthy();
    });

    it("does not render error message when error is false", () => {
      const { queryByText } = render(
        <Checkbox error={false} errorMessage="This field is required" />,
      );

      expect(queryByText("This field is required")).toBeNull();
    });

    it("does not render error message when errorMessage not provided", () => {
      const { queryByText } = render(<Checkbox error label="Test" />);

      // Only the label should be present
      expect(queryByText("Test")).toBeTruthy();
    });
  });

  //#endregion Error State Tests

  //#region Accessibility Tests

  describe("accessibility", () => {
    it("has checkbox role", () => {
      const { getByTestId } = render(<Checkbox testID="checkbox" />);
      const checkbox = getByTestId("checkbox");

      expect(checkbox.props.accessibilityRole).toBe("checkbox");
    });

    it("uses label as accessibilityLabel by default", () => {
      const { getByTestId } = render(
        <Checkbox label="Accept terms" testID="checkbox" />,
      );
      const checkbox = getByTestId("checkbox");

      expect(checkbox.props.accessibilityLabel).toBe("Accept terms");
    });

    it("prefers explicit accessibilityLabel over label", () => {
      const { getByTestId } = render(
        <Checkbox
          label="Accept terms"
          accessibilityLabel="Accept terms and conditions"
          testID="checkbox"
        />,
      );
      const checkbox = getByTestId("checkbox");

      expect(checkbox.props.accessibilityLabel).toBe(
        "Accept terms and conditions",
      );
    });

    it("uses translated labelKey as accessibilityLabel", () => {
      const { getByTestId } = render(
        <Checkbox labelKey="label.new" testID="checkbox" />,
      );
      const checkbox = getByTestId("checkbox");

      expect(checkbox.props.accessibilityLabel).toBe("New");
    });
  });

  //#endregion Accessibility Tests

  //#region Ref Forwarding Tests

  describe("ref forwarding", () => {
    it("forwards ref to Pressable", () => {
      const ref = { current: null };
      render(<Checkbox ref={ref} testID="checkbox" />);

      expect(ref.current).not.toBeNull();
    });
  });

  //#endregion Ref Forwarding Tests
});

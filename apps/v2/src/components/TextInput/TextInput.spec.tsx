// apps/v2/src/components/TextInput/TextInput.spec.tsx

import React from "react";
import { View } from "react-native";
import { render, fireEvent, screen } from "@testing-library/react-native";

import { TextInput } from "./TextInput";

//#region Rendering Tests

describe("<TextInput />", () => {
  describe("rendering", () => {
    it("renders with value", () => {
      render(<TextInput value="test value" testID="input" />);

      const input = screen.getByTestId("input-input");
      expect(input.props.value).toBe("test value");
    });

    it("renders with testID", () => {
      render(<TextInput testID="my-input" />);

      expect(screen.getByTestId("my-input")).toBeTruthy();
    });
  });

  //#endregion Rendering Tests

  //#region Value Change Tests

  describe("onChangeText", () => {
    it("calls onChangeText when typing", () => {
      const onChangeText = jest.fn();
      render(<TextInput onChangeText={onChangeText} testID="input" />);

      const input = screen.getByTestId("input-input");
      fireEvent.changeText(input, "new value");

      expect(onChangeText).toHaveBeenCalledWith("new value");
    });
  });

  //#endregion Value Change Tests

  //#region Label Tests

  describe("label", () => {
    it("renders label from labelKey", () => {
      render(<TextInput labelKey="label.save" testID="input" />);

      expect(screen.getByText("Save")).toBeTruthy();
    });

    it("renders direct label text", () => {
      render(<TextInput label="Email Address" testID="input" />);

      expect(screen.getByText("Email Address")).toBeTruthy();
    });

    it("prefers labelKey over label when both provided", () => {
      render(
        <TextInput labelKey="label.save" label="Direct Text" testID="input" />,
      );

      expect(screen.getByText("Save")).toBeTruthy();
      expect(screen.queryByText("Direct Text")).toBeNull();
    });
  });

  //#endregion Label Tests

  //#region Floating Label Tests

  describe("floating label behavior", () => {
    it("label is in default position when not focused and no value", () => {
      render(<TextInput label="Email" testID="input" />);

      // Label should exist
      expect(screen.getByTestId("input-label")).toBeTruthy();
    });

    it("label floats up when input has value", () => {
      render(
        <TextInput label="Email" value="test@example.com" testID="input" />,
      );

      // Label should still exist (floated)
      expect(screen.getByTestId("input-label")).toBeTruthy();
    });

    it("label floats up when input is focused", () => {
      render(<TextInput label="Email" testID="input" />);

      const input = screen.getByTestId("input-input");
      fireEvent(input, "focus");

      // Label should still exist (floated)
      expect(screen.getByTestId("input-label")).toBeTruthy();
    });
  });

  //#endregion Floating Label Tests

  //#region Placeholder Tests

  describe("placeholder", () => {
    it("renders placeholder from placeholderKey", () => {
      render(<TextInput placeholderKey="label.save" testID="input" />);

      const input = screen.getByTestId("input-input");
      expect(input.props.placeholder).toBe("Save");
    });

    it("renders direct placeholder text", () => {
      render(<TextInput placeholder="Enter your email" testID="input" />);

      const input = screen.getByTestId("input-input");
      expect(input.props.placeholder).toBe("Enter your email");
    });
  });

  //#endregion Placeholder Tests

  //#region Error State Tests

  describe("error state", () => {
    it("displays error message", () => {
      render(<TextInput errorMessage="Invalid email address" testID="input" />);

      expect(screen.getByText("Invalid email address")).toBeTruthy();
    });

    it("has alert role for error message", () => {
      render(<TextInput errorMessage="Invalid email address" testID="input" />);

      expect(screen.getByRole("alert")).toBeTruthy();
    });

    it("hides helper text when error is present", () => {
      render(
        <TextInput
          helperText="We'll never share your email"
          errorMessage="Invalid email"
          testID="input"
        />,
      );

      expect(screen.queryByText("We'll never share your email")).toBeNull();
      expect(screen.getByText("Invalid email")).toBeTruthy();
    });
  });

  //#endregion Error State Tests

  //#region Helper Text Tests

  describe("helper text", () => {
    it("displays helper text from helperTextKey", () => {
      render(<TextInput helperTextKey="label.save" testID="input" />);

      expect(screen.getByText("Save")).toBeTruthy();
    });

    it("displays direct helper text", () => {
      render(<TextInput helperText="Enter a valid email" testID="input" />);

      expect(screen.getByText("Enter a valid email")).toBeTruthy();
    });
  });

  //#endregion Helper Text Tests

  //#region Icon Tests

  describe("icons", () => {
    it("renders left icon", () => {
      render(
        <TextInput
          leftIcon={<View testID="custom-left-icon" />}
          testID="input"
        />,
      );

      expect(screen.getByTestId("custom-left-icon")).toBeTruthy();
      expect(screen.getByTestId("input-left-icon")).toBeTruthy();
    });

    it("renders right icon", () => {
      render(
        <TextInput
          rightIcon={<View testID="custom-right-icon" />}
          testID="input"
        />,
      );

      expect(screen.getByTestId("custom-right-icon")).toBeTruthy();
      expect(screen.getByTestId("input-right-icon")).toBeTruthy();
    });

    it("renders both left and right icons", () => {
      render(
        <TextInput
          leftIcon={<View testID="left" />}
          rightIcon={<View testID="right" />}
          testID="input"
        />,
      );

      expect(screen.getByTestId("left")).toBeTruthy();
      expect(screen.getByTestId("right")).toBeTruthy();
    });
  });

  //#endregion Icon Tests

  //#region Clear Button Tests

  describe("clear button", () => {
    it("shows clear button when clearable and has value", () => {
      render(
        <TextInput
          clearable
          value="test"
          onChangeText={jest.fn()}
          testID="input"
        />,
      );

      expect(screen.getByTestId("input-clear")).toBeTruthy();
    });

    it("hides clear button when empty", () => {
      render(
        <TextInput
          clearable
          value=""
          onChangeText={jest.fn()}
          testID="input"
        />,
      );

      expect(screen.queryByTestId("input-clear")).toBeNull();
    });

    it("hides clear button when clearable is false", () => {
      render(
        <TextInput
          clearable={false}
          value="test"
          onChangeText={jest.fn()}
          testID="input"
        />,
      );

      expect(screen.queryByTestId("input-clear")).toBeNull();
    });

    it("calls onClear when pressed", () => {
      const onClear = jest.fn();
      render(
        <TextInput
          clearable
          value="test"
          onChangeText={jest.fn()}
          onClear={onClear}
          testID="input"
        />,
      );

      fireEvent.press(screen.getByTestId("input-clear"));

      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("hides right icon when clear button is shown", () => {
      render(
        <TextInput
          clearable
          value="test"
          rightIcon={<View testID="right-icon" />}
          onChangeText={jest.fn()}
          testID="input"
        />,
      );

      expect(screen.getByTestId("input-clear")).toBeTruthy();
      expect(screen.queryByTestId("input-right-icon")).toBeNull();
    });
  });

  //#endregion Clear Button Tests

  //#region Password Toggle Tests

  describe("password toggle", () => {
    it("hides text by default in secure mode", () => {
      render(
        <TextInput
          secureTextEntry
          showPasswordToggle
          value="password123"
          onChangeText={jest.fn()}
          testID="input"
        />,
      );

      const input = screen.getByTestId("input-input");
      expect(input.props.secureTextEntry).toBe(true);
    });

    it("shows password toggle button when showPasswordToggle is true", () => {
      render(
        <TextInput
          secureTextEntry
          showPasswordToggle
          value="password123"
          onChangeText={jest.fn()}
          testID="input"
        />,
      );

      expect(screen.getByTestId("input-password-toggle")).toBeTruthy();
    });

    it("toggles password visibility on press", () => {
      render(
        <TextInput
          secureTextEntry
          showPasswordToggle
          value="password123"
          onChangeText={jest.fn()}
          testID="input"
        />,
      );

      // Initially hidden
      let input = screen.getByTestId("input-input");
      expect(input.props.secureTextEntry).toBe(true);

      // Press toggle
      fireEvent.press(screen.getByTestId("input-password-toggle"));

      // Now visible
      input = screen.getByTestId("input-input");
      expect(input.props.secureTextEntry).toBe(false);

      // Press toggle again
      fireEvent.press(screen.getByTestId("input-password-toggle"));

      // Hidden again
      input = screen.getByTestId("input-input");
      expect(input.props.secureTextEntry).toBe(true);
    });

    it("hides toggle when showPasswordToggle is false", () => {
      render(
        <TextInput
          secureTextEntry
          showPasswordToggle={false}
          value="password123"
          onChangeText={jest.fn()}
          testID="input"
        />,
      );

      expect(screen.queryByTestId("input-password-toggle")).toBeNull();
    });

    it("does not show clear button when password mode", () => {
      render(
        <TextInput
          secureTextEntry
          showPasswordToggle
          clearable
          value="password123"
          onChangeText={jest.fn()}
          testID="input"
        />,
      );

      expect(screen.queryByTestId("input-clear")).toBeNull();
      expect(screen.getByTestId("input-password-toggle")).toBeTruthy();
    });
  });

  //#endregion Password Toggle Tests

  //#region Multiline Tests

  describe("multiline", () => {
    it("enables multiline mode", () => {
      render(
        <TextInput
          multiline
          value="line1\nline2"
          onChangeText={jest.fn()}
          testID="input"
        />,
      );

      const input = screen.getByTestId("input-input");
      expect(input.props.multiline).toBe(true);
    });

    it("sets numberOfLines", () => {
      render(
        <TextInput
          multiline
          numberOfLines={6}
          value="text"
          onChangeText={jest.fn()}
          testID="input"
        />,
      );

      const input = screen.getByTestId("input-input");
      expect(input.props.numberOfLines).toBe(6);
    });

    it("defaults to 4 lines in multiline mode", () => {
      render(
        <TextInput
          multiline
          value="text"
          onChangeText={jest.fn()}
          testID="input"
        />,
      );

      const input = screen.getByTestId("input-input");
      expect(input.props.numberOfLines).toBe(4);
    });
  });

  //#endregion Multiline Tests

  //#region Disabled State Tests

  describe("disabled state", () => {
    it("prevents editing when disabled", () => {
      render(
        <TextInput
          disabled
          value="readonly"
          onChangeText={jest.fn()}
          testID="input"
        />,
      );

      const input = screen.getByTestId("input-input");
      expect(input.props.editable).toBe(false);
    });

    it("sets accessibility state disabled", () => {
      render(
        <TextInput
          disabled
          value="readonly"
          onChangeText={jest.fn()}
          testID="input"
        />,
      );

      const container = screen.getByTestId("input");
      expect(container.props.accessibilityState.disabled).toBe(true);
    });
  });

  //#endregion Disabled State Tests

  //#region Focus State Tests

  describe("focus state", () => {
    it("calls onFocus when focused", () => {
      const onFocus = jest.fn();
      render(<TextInput onFocus={onFocus} testID="input" />);

      const input = screen.getByTestId("input-input");
      fireEvent(input, "focus");

      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it("calls onBlur when blurred", () => {
      const onBlur = jest.fn();
      render(<TextInput onBlur={onBlur} testID="input" />);

      const input = screen.getByTestId("input-input");
      fireEvent(input, "blur");

      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  //#endregion Focus State Tests

  //#region Ref Tests

  describe("ref forwarding", () => {
    it("forwards ref to TextInput", () => {
      const ref = { current: null };
      render(<TextInput ref={ref} testID="input" />);

      expect(ref.current).toBeTruthy();
    });
  });

  //#endregion Ref Tests

  //#region Accessibility Tests

  describe("accessibility", () => {
    it("sets accessibilityLabel from label", () => {
      render(<TextInput label="Email" testID="input" />);

      const input = screen.getByTestId("input-input");
      expect(input.props.accessibilityLabel).toBe("Email");
    });

    it("sets accessibilityHint from helperText", () => {
      render(
        <TextInput helperText="Enter your email address" testID="input" />,
      );

      const input = screen.getByTestId("input-input");
      expect(input.props.accessibilityHint).toBe("Enter your email address");
    });
  });

  //#endregion Accessibility Tests

  //#region AutoFocus Tests

  describe("autoFocus", () => {
    it("passes autoFocus prop to input", () => {
      render(<TextInput autoFocus testID="input" />);

      const input = screen.getByTestId("input-input");
      expect(input.props.autoFocus).toBe(true);
    });
  });

  //#endregion AutoFocus Tests
});

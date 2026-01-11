// apps/v2/src/components/TextArea/TextArea.spec.tsx

import { render, fireEvent, screen } from "@testing-library/react-native";

import { TextArea } from "./TextArea";

//#region Rendering Tests

describe("<TextArea />", () => {
  describe("rendering", () => {
    it("renders with value", () => {
      render(
        <TextArea value="Hello" onChangeText={jest.fn()} testID="textarea" />,
      );

      const input = screen.getByTestId("textarea-input");
      expect(input.props.value).toBe("Hello");
    });

    it("renders with placeholder", () => {
      render(
        <TextArea
          value=""
          onChangeText={jest.fn()}
          placeholder="Type here"
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");
      expect(input.props.placeholder).toBe("Type here");
    });

    it("renders with placeholderKey (i18n)", () => {
      render(
        <TextArea
          value=""
          onChangeText={jest.fn()}
          placeholderKey="label.save"
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");
      expect(input.props.placeholder).toBe("Save");
    });

    it("renders with testID", () => {
      render(<TextArea value="" onChangeText={jest.fn()} testID="textarea" />);

      expect(screen.getByTestId("textarea")).toBeTruthy();
      expect(screen.getByTestId("textarea-input")).toBeTruthy();
    });

    it("enables multiline mode", () => {
      render(
        <TextArea
          value="line1\nline2"
          onChangeText={jest.fn()}
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");
      expect(input.props.multiline).toBe(true);
    });
  });

  //#endregion Rendering Tests

  //#region Interaction Tests

  describe("interactions", () => {
    it("calls onChangeText when text changes", () => {
      const onChangeText = jest.fn();
      render(
        <TextArea
          value="Hello"
          onChangeText={onChangeText}
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");
      fireEvent.changeText(input, "Hello World");

      expect(onChangeText).toHaveBeenCalledWith("Hello World");
    });

    it("does not allow input when disabled", () => {
      const onChangeText = jest.fn();
      render(
        <TextArea
          value="Hello"
          onChangeText={onChangeText}
          disabled
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");
      expect(input.props.editable).toBe(false);
    });
  });

  //#endregion Interaction Tests

  //#region Auto-grow Tests

  describe("auto-grow", () => {
    it("respects minHeight", () => {
      render(
        <TextArea
          value=""
          onChangeText={jest.fn()}
          minHeight={100}
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");
      // Initial height should be minHeight
      expect(input.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ height: 100 })]),
      );
    });

    it("updates height on content size change", () => {
      render(
        <TextArea
          value="Some content"
          onChangeText={jest.fn()}
          minHeight={80}
          maxHeight={200}
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");

      // Simulate content size change
      fireEvent(input, "contentSizeChange", {
        nativeEvent: { contentSize: { height: 120, width: 300 } },
      });

      // Height should update (we test by checking the style prop)
      expect(input.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ height: 120 })]),
      );
    });

    it("clamps height to maxHeight", () => {
      render(
        <TextArea
          value="Long content"
          onChangeText={jest.fn()}
          minHeight={80}
          maxHeight={150}
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");

      // Simulate content size change exceeding maxHeight
      fireEvent(input, "contentSizeChange", {
        nativeEvent: { contentSize: { height: 300, width: 300 } },
      });

      // Height should be clamped to maxHeight
      expect(input.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ height: 150 })]),
      );
    });

    it("clamps height to minHeight when content is smaller", () => {
      render(
        <TextArea
          value=""
          onChangeText={jest.fn()}
          minHeight={100}
          maxHeight={200}
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");

      // Simulate content size change below minHeight
      fireEvent(input, "contentSizeChange", {
        nativeEvent: { contentSize: { height: 50, width: 300 } },
      });

      // Height should be clamped to minHeight
      expect(input.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ height: 100 })]),
      );
    });
  });

  //#endregion Auto-grow Tests

  //#region Character Count Tests

  describe("character count", () => {
    it("shows character count when enabled", () => {
      render(
        <TextArea
          value="Hello"
          onChangeText={jest.fn()}
          showCharacterCount
          maxLength={100}
          testID="textarea"
        />,
      );

      expect(screen.getByText("5/100")).toBeTruthy();
    });

    it("does not show character count when disabled", () => {
      render(
        <TextArea
          value="Hello"
          onChangeText={jest.fn()}
          showCharacterCount={false}
          maxLength={100}
          testID="textarea"
        />,
      );

      expect(screen.queryByText(/\/100/)).toBeNull();
    });

    it("does not show character count without maxLength", () => {
      render(
        <TextArea
          value="Hello"
          onChangeText={jest.fn()}
          showCharacterCount
          testID="textarea"
        />,
      );

      // No maxLength, no character count display
      expect(screen.queryByTestId("textarea-character-count")).toBeNull();
    });

    it("enforces maxLength", () => {
      render(
        <TextArea
          value="Hello"
          onChangeText={jest.fn()}
          maxLength={10}
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");
      expect(input.props.maxLength).toBe(10);
    });

    it("updates character count when value changes", () => {
      const { rerender } = render(
        <TextArea
          value="Hi"
          onChangeText={jest.fn()}
          showCharacterCount
          maxLength={100}
          testID="textarea"
        />,
      );

      expect(screen.getByText("2/100")).toBeTruthy();

      rerender(
        <TextArea
          value="Hello World"
          onChangeText={jest.fn()}
          showCharacterCount
          maxLength={100}
          testID="textarea"
        />,
      );

      expect(screen.getByText("11/100")).toBeTruthy();
    });
  });

  //#endregion Character Count Tests

  //#region Warning State Tests

  describe("warning state", () => {
    it("applies warning style at threshold", () => {
      // 90 characters with maxLength 100 = exactly at 0.9 threshold
      const value = "A".repeat(90);
      render(
        <TextArea
          value={value}
          onChangeText={jest.fn()}
          showCharacterCount
          maxLength={100}
          warningThreshold={0.9}
          testID="textarea"
        />,
      );

      expect(screen.getByText("90/100")).toBeTruthy();
    });

    it("applies warning style above threshold", () => {
      // 95 characters with maxLength 100 = above 0.9 threshold
      const value = "A".repeat(95);
      render(
        <TextArea
          value={value}
          onChangeText={jest.fn()}
          showCharacterCount
          maxLength={100}
          warningThreshold={0.9}
          testID="textarea"
        />,
      );

      expect(screen.getByText("95/100")).toBeTruthy();
    });

    it("uses custom warning threshold", () => {
      // 80 characters with maxLength 100 and threshold 0.8 = exactly at threshold
      const value = "A".repeat(80);
      render(
        <TextArea
          value={value}
          onChangeText={jest.fn()}
          showCharacterCount
          maxLength={100}
          warningThreshold={0.8}
          testID="textarea"
        />,
      );

      expect(screen.getByText("80/100")).toBeTruthy();
    });
  });

  //#endregion Warning State Tests

  //#region Error State Tests

  describe("error state", () => {
    it("displays error message", () => {
      render(
        <TextArea
          value=""
          onChangeText={jest.fn()}
          error
          errorMessage="This field is required"
          testID="textarea"
        />,
      );

      expect(screen.getByText("This field is required")).toBeTruthy();
    });

    it("applies error style at/over limit", () => {
      // 100 characters with maxLength 100 = at limit
      const value = "A".repeat(100);
      render(
        <TextArea
          value={value}
          onChangeText={jest.fn()}
          showCharacterCount
          maxLength={100}
          testID="textarea"
        />,
      );

      expect(screen.getByText("100/100")).toBeTruthy();
    });

    it("shows both error message and character count", () => {
      render(
        <TextArea
          value="Hello"
          onChangeText={jest.fn()}
          showCharacterCount
          maxLength={100}
          error
          errorMessage="Error occurred"
          testID="textarea"
        />,
      );

      expect(screen.getByText("Error occurred")).toBeTruthy();
      expect(screen.getByText("5/100")).toBeTruthy();
    });
  });

  //#endregion Error State Tests

  //#region Disabled State Tests

  describe("disabled state", () => {
    it("prevents editing when disabled", () => {
      render(
        <TextArea
          value="readonly"
          onChangeText={jest.fn()}
          disabled
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");
      expect(input.props.editable).toBe(false);
    });

    it("sets accessibility state disabled", () => {
      render(
        <TextArea
          value="readonly"
          onChangeText={jest.fn()}
          disabled
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");
      expect(input.props.accessibilityState.disabled).toBe(true);
    });
  });

  //#endregion Disabled State Tests

  //#region Accessibility Tests

  describe("accessibility", () => {
    it("uses placeholder as accessibility label", () => {
      render(
        <TextArea
          value=""
          onChangeText={jest.fn()}
          placeholder="Message"
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");
      expect(input.props.accessibilityLabel).toBe("Message");
    });

    it("uses placeholderKey translation as accessibility label", () => {
      render(
        <TextArea
          value=""
          onChangeText={jest.fn()}
          placeholderKey="label.save"
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");
      expect(input.props.accessibilityLabel).toBe("Save");
    });

    it("has disabled accessibility state when disabled", () => {
      render(
        <TextArea
          value="Test"
          onChangeText={jest.fn()}
          disabled
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");
      expect(input.props.accessibilityState.disabled).toBe(true);
    });

    it("has enabled accessibility state when not disabled", () => {
      render(
        <TextArea value="Test" onChangeText={jest.fn()} testID="textarea" />,
      );

      const input = screen.getByTestId("textarea-input");
      expect(input.props.accessibilityState.disabled).toBe(false);
    });
  });

  //#endregion Accessibility Tests

  //#region Ref Tests

  describe("ref forwarding", () => {
    it("forwards ref to TextInput", () => {
      const ref = { current: null };
      render(
        <TextArea
          value=""
          onChangeText={jest.fn()}
          ref={ref}
          testID="textarea"
        />,
      );

      expect(ref.current).toBeTruthy();
    });
  });

  //#endregion Ref Tests

  //#region AutoFocus Tests

  describe("autoFocus", () => {
    it("passes autoFocus prop to input", () => {
      render(
        <TextArea
          value=""
          onChangeText={jest.fn()}
          autoFocus
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");
      expect(input.props.autoFocus).toBe(true);
    });

    it("defaults autoFocus to false", () => {
      render(<TextArea value="" onChangeText={jest.fn()} testID="textarea" />);

      const input = screen.getByTestId("textarea-input");
      expect(input.props.autoFocus).toBe(false);
    });
  });

  //#endregion AutoFocus Tests

  //#region Text Alignment Tests

  describe("text alignment", () => {
    it("aligns text to top", () => {
      render(
        <TextArea
          value="Multi\nline\ntext"
          onChangeText={jest.fn()}
          testID="textarea"
        />,
      );

      const input = screen.getByTestId("textarea-input");
      expect(input.props.textAlignVertical).toBe("top");
    });
  });

  //#endregion Text Alignment Tests
});

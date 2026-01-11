// apps/v2/src/components/Text/Text.spec.tsx

import { render } from "@testing-library/react-native";
import { Text } from "./Text";

//#region Rendering Tests

describe("<Text />", () => {
  describe("rendering", () => {
    it("renders children", () => {
      const { getByText } = render(<Text>Hello World</Text>);
      expect(getByText("Hello World")).toBeTruthy();
    });

    it("renders with textKey (i18n)", () => {
      const { getByText } = render(<Text textKey="label.save" />);
      expect(getByText("Save")).toBeTruthy();
    });

    it("renders with textKey and params", () => {
      const { getByText } = render(
        <Text
          textKey="main.badge.unreadMentions"
          textParams={{ mentionCount: "5" }}
        />,
      );
      expect(getByText("You have unread mentions (5)")).toBeTruthy();
    });

    it("renders with testID", () => {
      const { getByTestId } = render(<Text testID="test-text">Content</Text>);
      expect(getByTestId("test-text")).toBeTruthy();
    });
  });

  //#endregion Rendering Tests

  //#region Variant Tests

  describe("variants", () => {
    it("renders heading variant", () => {
      const { getByText } = render(<Text variant="heading">Heading</Text>);
      expect(getByText("Heading")).toBeTruthy();
    });

    it("renders body variant (default)", () => {
      const { getByText } = render(<Text>Body text</Text>);
      expect(getByText("Body text")).toBeTruthy();
    });

    it("renders caption variant", () => {
      const { getByText } = render(<Text variant="caption">Caption</Text>);
      expect(getByText("Caption")).toBeTruthy();
    });

    it("renders label variant", () => {
      const { getByText } = render(<Text variant="label">Label</Text>);
      expect(getByText("Label")).toBeTruthy();
    });
  });

  //#endregion Variant Tests

  //#region Size Tests

  describe("sizes", () => {
    const sizes = ["xs", "sm", "md", "lg", "xl", "xxl"] as const;

    sizes.forEach((size) => {
      it(`renders ${size} size`, () => {
        const { getByText } = render(<Text size={size}>{size} text</Text>);
        expect(getByText(`${size} text`)).toBeTruthy();
      });
    });
  });

  //#endregion Size Tests

  //#region Weight Tests

  describe("weights", () => {
    const weights = ["regular", "medium", "semiBold", "bold"] as const;

    weights.forEach((weight) => {
      it(`renders ${weight} weight`, () => {
        const { getByText } = render(<Text weight={weight}>{weight}</Text>);
        expect(getByText(weight)).toBeTruthy();
      });
    });
  });

  //#endregion Weight Tests

  //#region Color Tests

  describe("colors", () => {
    const colors = ["primary", "secondary", "muted", "error", "link"] as const;

    colors.forEach((color) => {
      it(`renders ${color} color`, () => {
        const { getByText } = render(<Text color={color}>{color}</Text>);
        expect(getByText(color)).toBeTruthy();
      });
    });
  });

  //#endregion Color Tests

  //#region Truncation Tests

  describe("truncation", () => {
    it("applies numberOfLines", () => {
      const { getByText } = render(
        <Text numberOfLines={2}>
          This is a very long text that should be truncated after two lines
        </Text>,
      );
      expect(getByText(/This is a very long/)).toBeTruthy();
    });

    it("applies ellipsizeMode", () => {
      const { getByText } = render(
        <Text numberOfLines={1} ellipsizeMode="middle">
          Long text
        </Text>,
      );
      expect(getByText("Long text")).toBeTruthy();
    });
  });

  //#endregion Truncation Tests

  //#region Alignment Tests

  describe("alignment", () => {
    it("renders left aligned (default)", () => {
      const { getByText } = render(<Text>Left</Text>);
      expect(getByText("Left")).toBeTruthy();
    });

    it("renders center aligned", () => {
      const { getByText } = render(<Text align="center">Center</Text>);
      expect(getByText("Center")).toBeTruthy();
    });

    it("renders right aligned", () => {
      const { getByText } = render(<Text align="right">Right</Text>);
      expect(getByText("Right")).toBeTruthy();
    });
  });

  //#endregion Alignment Tests

  //#region Accessibility Tests

  describe("accessibility", () => {
    it("has text role", () => {
      const { getByRole } = render(<Text>Accessible</Text>);
      expect(getByRole("text")).toBeTruthy();
    });

    it("supports accessibilityLabel", () => {
      const { getByLabelText } = render(
        <Text accessibilityLabel="Custom label">Content</Text>,
      );
      expect(getByLabelText("Custom label")).toBeTruthy();
    });
  });

  //#endregion Accessibility Tests
});

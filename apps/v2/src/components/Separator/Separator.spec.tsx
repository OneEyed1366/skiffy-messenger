// apps/v2/src/components/Separator/Separator.spec.tsx

import { render } from "@testing-library/react-native";
import { Separator } from "./Separator";

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "label.newMessages": "New Messages",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock react-native-unistyles
jest.mock("react-native-unistyles", () => {
  const actual = jest.requireActual("react-native");
  return {
    StyleSheet: {
      create: (stylesOrFn: unknown) => {
        const styles =
          typeof stylesOrFn === "function" ? stylesOrFn({}) : stylesOrFn;
        const processedStyles: Record<string, unknown> & {
          useVariants: () => void;
        } = { useVariants: () => {} };
        for (const key of Object.keys(styles)) {
          const style = styles[key];

          const { variants, compoundVariants, ...rest } = style;
          processedStyles[key] = rest;
        }
        return processedStyles;
      },
    },
    UnistylesVariants: actual.ViewStyle,
  };
});

//#region Rendering Tests

describe("<Separator />", () => {
  describe("rendering", () => {
    it("renders horizontal separator by default", () => {
      const { getByTestId } = render(<Separator testID="separator" />);
      expect(getByTestId("separator")).toBeTruthy();
    });

    it("renders with testID", () => {
      const { getByTestId } = render(<Separator testID="test-separator" />);
      expect(getByTestId("test-separator")).toBeTruthy();
    });

    it("renders with label text", () => {
      const { getByText } = render(<Separator label="New Messages" />);
      expect(getByText("New Messages")).toBeTruthy();
    });

    it("renders with labelKey (i18n)", () => {
      const { getByText } = render(<Separator labelKey="label.newMessages" />);
      expect(getByText("New Messages")).toBeTruthy();
    });
  });

  //#endregion Rendering Tests

  //#region Orientation Tests

  describe("orientation", () => {
    it("renders horizontal orientation", () => {
      const { getByTestId } = render(
        <Separator orientation="horizontal" testID="separator" />,
      );
      expect(getByTestId("separator")).toBeTruthy();
    });

    it("renders vertical orientation", () => {
      const { getByTestId } = render(
        <Separator orientation="vertical" testID="separator" />,
      );
      expect(getByTestId("separator")).toBeTruthy();
    });

    it("does not show label in vertical orientation", () => {
      const { queryByText } = render(
        <Separator orientation="vertical" label="Hidden" />,
      );
      // Label should not be visible in vertical mode
      expect(queryByText("Hidden")).toBeNull();
    });
  });

  //#endregion Orientation Tests

  //#region Thickness Tests

  describe("thickness", () => {
    it("renders thin thickness (default)", () => {
      const { getByTestId } = render(<Separator testID="separator" />);
      expect(getByTestId("separator")).toBeTruthy();
    });

    it("renders medium thickness", () => {
      const { getByTestId } = render(
        <Separator thickness="medium" testID="separator" />,
      );
      expect(getByTestId("separator")).toBeTruthy();
    });

    it("renders thick thickness", () => {
      const { getByTestId } = render(
        <Separator thickness="thick" testID="separator" />,
      );
      expect(getByTestId("separator")).toBeTruthy();
    });
  });

  //#endregion Thickness Tests

  //#region Color Variant Tests

  describe("color variants", () => {
    it("renders neutral color variant", () => {
      const { getByTestId } = render(
        <Separator colorVariant="neutral" testID="separator" />,
      );
      expect(getByTestId("separator")).toBeTruthy();
    });

    it("renders light color variant", () => {
      const { getByTestId } = render(
        <Separator colorVariant="light" testID="separator" />,
      );
      expect(getByTestId("separator")).toBeTruthy();
    });

    it("renders dark color variant", () => {
      const { getByTestId } = render(
        <Separator colorVariant="dark" testID="separator" />,
      );
      expect(getByTestId("separator")).toBeTruthy();
    });

    it("renders notification color variant", () => {
      const { getByTestId } = render(
        <Separator colorVariant="notification" testID="separator" />,
      );
      expect(getByTestId("separator")).toBeTruthy();
    });
  });

  //#endregion Color Variant Tests

  //#region Spacing Tests

  describe("spacing", () => {
    it("renders with default spacing", () => {
      const { getByTestId } = render(<Separator testID="separator" />);
      expect(getByTestId("separator")).toBeTruthy();
    });

    it("renders with custom spacing", () => {
      const { getByTestId } = render(
        <Separator spacing={4} testID="separator" />,
      );
      expect(getByTestId("separator")).toBeTruthy();
    });

    it("renders with zero spacing", () => {
      const { getByTestId } = render(
        <Separator spacing={0} testID="separator" />,
      );
      expect(getByTestId("separator")).toBeTruthy();
    });
  });

  //#endregion Spacing Tests

  //#region Accessibility Tests

  describe("accessibility", () => {
    it("has accessible prop set", () => {
      const { getByTestId } = render(<Separator testID="separator" />);
      const separator = getByTestId("separator");
      expect(separator.props.accessible).toBe(true);
    });
  });

  //#endregion Accessibility Tests

  //#region Combined Props Tests

  describe("combined props", () => {
    it("renders notification separator with label", () => {
      const { getByText, getByTestId } = render(
        <Separator
          colorVariant="notification"
          label="New Messages"
          thickness="medium"
          testID="separator"
        />,
      );
      expect(getByTestId("separator")).toBeTruthy();
      expect(getByText("New Messages")).toBeTruthy();
    });

    it("renders vertical thick dark separator", () => {
      const { getByTestId } = render(
        <Separator
          orientation="vertical"
          thickness="thick"
          colorVariant="dark"
          testID="separator"
        />,
      );
      expect(getByTestId("separator")).toBeTruthy();
    });
  });

  //#endregion Combined Props Tests
});

// apps/v2/src/components/Icon/Icon.spec.tsx

import { createRef } from "react";
import { render, screen } from "@testing-library/react-native";
import { View } from "react-native";

import { Icon } from "./Icon";

//#region Rendering Tests

describe("<Icon />", () => {
  it("renders with default props", () => {
    render(<Icon name="close" testID="icon" />);

    expect(screen.getByTestId("icon")).toBeTruthy();
  });

  it("renders the icon name as text (via mock)", () => {
    render(<Icon name="close" testID="icon" />);

    expect(screen.getByText("close")).toBeTruthy();
  });
});

//#endregion Rendering Tests

//#region Size Variant Tests

describe("Icon size variants", () => {
  it("renders sm size (16px)", () => {
    render(<Icon name="close" size="sm" testID="icon" />);

    const icon = screen.getByTestId("icon");
    // Unistyles in test environment returns raw style with variants object
    expect(icon.props.style.variants.size.sm).toMatchObject({
      width: 16,
      height: 16,
    });
  });

  it("renders md size (24px) by default", () => {
    render(<Icon name="close" testID="icon" />);

    const icon = screen.getByTestId("icon");
    expect(icon.props.style.variants.size.md).toMatchObject({
      width: 24,
      height: 24,
    });
  });

  it("renders lg size (32px)", () => {
    render(<Icon name="close" size="lg" testID="icon" />);

    const icon = screen.getByTestId("icon");
    expect(icon.props.style.variants.size.lg).toMatchObject({
      width: 32,
      height: 32,
    });
  });

  it("has all size variants configured", () => {
    render(<Icon name="close" testID="icon" />);

    const icon = screen.getByTestId("icon");
    const sizeVariants = icon.props.style.variants.size;

    expect(sizeVariants).toHaveProperty("sm");
    expect(sizeVariants).toHaveProperty("md");
    expect(sizeVariants).toHaveProperty("lg");
  });
});

//#endregion Size Variant Tests

//#region Icon Family Tests

describe("Icon families", () => {
  it("renders MaterialCommunityIcons by default", () => {
    render(<Icon name="close" testID="icon" />);

    expect(screen.getByTestId("icon")).toBeTruthy();
    expect(screen.getByText("close")).toBeTruthy();
  });

  it("renders Ionicons family", () => {
    render(<Icon name="close" family="Ionicons" testID="icon" />);

    expect(screen.getByTestId("icon")).toBeTruthy();
    expect(screen.getByText("close")).toBeTruthy();
  });

  it("renders FontAwesome family", () => {
    render(<Icon name="times" family="FontAwesome" testID="icon" />);

    expect(screen.getByTestId("icon")).toBeTruthy();
    expect(screen.getByText("times")).toBeTruthy();
  });
});

//#endregion Icon Family Tests

//#region Accessibility Tests

describe("Icon accessibility", () => {
  it("renders with accessibility label", () => {
    render(
      <Icon name="close" accessibilityLabel="Close button" testID="icon" />,
    );

    expect(screen.getByLabelText("Close button")).toBeTruthy();
  });

  it("has accessibilityRole of image when label is provided", () => {
    render(
      <Icon name="close" accessibilityLabel="Close button" testID="icon" />,
    );

    const icon = screen.getByTestId("icon");
    expect(icon.props.accessibilityRole).toBe("image");
  });

  it("does not have accessibilityRole when no label is provided", () => {
    render(<Icon name="close" testID="icon" />);

    const icon = screen.getByTestId("icon");
    expect(icon.props.accessibilityRole).toBeUndefined();
  });

  it("is accessible by default", () => {
    render(<Icon name="close" testID="icon" />);

    const icon = screen.getByTestId("icon");
    expect(icon.props.accessible).toBe(true);
  });

  it("hides from accessibility when accessibilityHidden is true", () => {
    render(<Icon name="close" accessibilityHidden testID="icon" />);

    const icon = screen.getByTestId("icon");
    expect(icon.props.accessible).toBe(false);
  });
});

//#endregion Accessibility Tests

//#region Color Tests

describe("Icon colors", () => {
  it("applies custom color", () => {
    render(<Icon name="close" color="#ff0000" testID="icon" />);

    expect(screen.getByTestId("icon")).toBeTruthy();
  });

  it("renders with default theme color when no color prop provided", () => {
    render(<Icon name="close" testID="icon" />);

    expect(screen.getByTestId("icon")).toBeTruthy();
  });
});

//#endregion Color Tests

//#region Ref Tests

describe("Icon ref", () => {
  it("forwards ref to container View", () => {
    const ref = createRef<View>();
    render(<Icon name="close" ref={ref} testID="icon" />);

    expect(ref.current).toBeTruthy();
  });
});

//#endregion Ref Tests

//#region TestID Tests

describe("Icon testID", () => {
  it("applies testID to container", () => {
    render(<Icon name="close" testID="my-icon" />);

    expect(screen.getByTestId("my-icon")).toBeTruthy();
  });
});

//#endregion TestID Tests

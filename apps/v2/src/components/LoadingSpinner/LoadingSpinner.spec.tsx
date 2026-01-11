// apps/v2/src/components/LoadingSpinner/LoadingSpinner.spec.tsx

import { render, screen } from "@testing-library/react-native";

import { LoadingSpinner } from "./LoadingSpinner";

//#region Rendering Tests

describe("<LoadingSpinner />", () => {
  it("renders spinner with default props", () => {
    render(<LoadingSpinner />);

    expect(screen.getByTestId("loadingSpinner")).toBeTruthy();
    expect(screen.getByTestId("loadingSpinner-indicator")).toBeTruthy();
  });

  it("renders without label by default", () => {
    render(<LoadingSpinner />);

    expect(screen.queryByTestId("loadingSpinner-label")).toBeNull();
  });

  it("renders label when labelKey provided", () => {
    render(<LoadingSpinner labelKey="loadingSpinner.loading" />);

    expect(screen.getByTestId("loadingSpinner-label")).toBeTruthy();
    expect(screen.getByText("Loading")).toBeTruthy();
  });

  it("applies custom testID", () => {
    render(<LoadingSpinner testID="customSpinner" />);

    expect(screen.getByTestId("customSpinner")).toBeTruthy();
    expect(screen.getByTestId("customSpinner-indicator")).toBeTruthy();
  });
});

//#endregion Rendering Tests

//#region Size Variant Tests

describe("size variants", () => {
  it("renders small size", () => {
    render(<LoadingSpinner size="small" />);

    expect(screen.getByTestId("loadingSpinner")).toBeTruthy();
  });

  it("renders medium size (default)", () => {
    render(<LoadingSpinner size="medium" />);

    expect(screen.getByTestId("loadingSpinner")).toBeTruthy();
  });

  it("renders large size", () => {
    render(<LoadingSpinner size="large" />);

    expect(screen.getByTestId("loadingSpinner")).toBeTruthy();
  });
});

//#endregion Size Variant Tests

//#region Color Variant Tests

describe("color variants", () => {
  it("renders primary color (default)", () => {
    render(<LoadingSpinner color="primary" />);

    expect(screen.getByTestId("loadingSpinner")).toBeTruthy();
  });

  it("renders secondary color", () => {
    render(<LoadingSpinner color="secondary" />);

    expect(screen.getByTestId("loadingSpinner")).toBeTruthy();
  });

  it("renders neutral color", () => {
    render(<LoadingSpinner color="neutral" />);

    expect(screen.getByTestId("loadingSpinner")).toBeTruthy();
  });

  it("renders button color", () => {
    render(<LoadingSpinner color="button" />);

    expect(screen.getByTestId("loadingSpinner")).toBeTruthy();
  });
});

//#endregion Color Variant Tests

//#region Fullscreen Variant Tests

describe("fullscreen variant", () => {
  it("renders inline by default", () => {
    render(<LoadingSpinner fullscreen={false} />);

    expect(screen.getByTestId("loadingSpinner")).toBeTruthy();
  });

  it("renders fullscreen overlay when enabled", () => {
    render(<LoadingSpinner fullscreen={true} />);

    expect(screen.getByTestId("loadingSpinner")).toBeTruthy();
  });

  it("renders fullscreen with label", () => {
    render(
      <LoadingSpinner fullscreen={true} labelKey="loadingSpinner.loading" />,
    );

    expect(screen.getByTestId("loadingSpinner")).toBeTruthy();
    expect(screen.getByText("Loading")).toBeTruthy();
  });
});

//#endregion Fullscreen Variant Tests

//#region Accessibility Tests

describe("accessibility", () => {
  it("has progressbar role", () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId("loadingSpinner");
    expect(spinner.props.accessibilityRole).toBe("progressbar");
  });

  it("has accessibility label", () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId("loadingSpinner");
    expect(spinner.props.accessibilityLabel).toBe("Loading");
  });
});

//#endregion Accessibility Tests

// apps/v2/src/components/Badge/Badge.spec.tsx

import { render, screen } from "@testing-library/react-native";
import { Badge } from "./Badge";

//#region Rendering Tests

describe("<Badge />", () => {
  describe("default variant", () => {
    it("renders count", () => {
      render(<Badge count={5} testID="badge" />);

      expect(screen.getByText("5")).toBeTruthy();
    });

    it("renders max+ when count exceeds max", () => {
      render(<Badge count={150} max={99} testID="badge" />);

      expect(screen.getByText("99+")).toBeTruthy();
    });

    it("renders custom max", () => {
      render(<Badge count={15} max={10} testID="badge" />);

      expect(screen.getByText("10+")).toBeTruthy();
    });

    it("does not render when count is 0 by default", () => {
      render(<Badge count={0} testID="badge" />);

      expect(screen.queryByTestId("badge")).toBeNull();
    });

    it("renders when count is 0 and showZero is true", () => {
      render(<Badge count={0} showZero testID="badge" />);

      expect(screen.getByText("0")).toBeTruthy();
    });
  });

  describe("dot variant", () => {
    it("renders dot without count", () => {
      render(<Badge variant="dot" testID="badge" />);

      expect(screen.getByTestId("badge")).toBeTruthy();
      expect(screen.queryByText(/\d/)).toBeNull();
    });

    it("renders dot even when count is 0", () => {
      render(<Badge variant="dot" count={0} testID="badge" />);

      expect(screen.getByTestId("badge")).toBeTruthy();
    });
  });

  describe("accessibility", () => {
    it("has default accessibility label for count", () => {
      render(<Badge count={5} testID="badge" />);

      expect(screen.getByLabelText("5 notifications")).toBeTruthy();
    });

    it("has default accessibility label for dot", () => {
      render(<Badge variant="dot" testID="badge" />);

      expect(screen.getByLabelText("New notification")).toBeTruthy();
    });

    it("accepts custom accessibility label", () => {
      render(
        <Badge
          count={3}
          accessibilityLabel="3 unread messages"
          testID="badge"
        />,
      );

      expect(screen.getByLabelText("3 unread messages")).toBeTruthy();
    });
  });

  describe("color variants", () => {
    it("renders with primary color", () => {
      render(<Badge count={5} color="primary" testID="badge" />);

      expect(screen.getByTestId("badge")).toBeTruthy();
    });

    it("renders with mention color", () => {
      render(<Badge count={5} color="mention" testID="badge" />);

      expect(screen.getByTestId("badge")).toBeTruthy();
    });

    it("renders with urgent color", () => {
      render(<Badge count={5} color="urgent" testID="badge" />);

      expect(screen.getByTestId("badge")).toBeTruthy();
    });
  });

  describe("position variants", () => {
    it("renders with inline position", () => {
      render(<Badge count={5} position="inline" testID="badge" />);

      expect(screen.getByTestId("badge")).toBeTruthy();
    });

    it("renders with topRight position", () => {
      render(<Badge count={5} position="topRight" testID="badge" />);

      expect(screen.getByTestId("badge")).toBeTruthy();
    });
  });

  describe("size variants", () => {
    it("renders with sm size", () => {
      render(<Badge count={5} size="sm" testID="badge" />);

      expect(screen.getByTestId("badge")).toBeTruthy();
    });

    it("renders with md size", () => {
      render(<Badge count={5} size="md" testID="badge" />);

      expect(screen.getByTestId("badge")).toBeTruthy();
    });

    it("renders with lg size", () => {
      render(<Badge count={5} size="lg" testID="badge" />);

      expect(screen.getByTestId("badge")).toBeTruthy();
    });
  });
});

//#endregion Rendering Tests

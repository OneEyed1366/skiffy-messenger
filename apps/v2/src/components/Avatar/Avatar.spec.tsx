// apps/v2/src/components/Avatar/Avatar.spec.tsx

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import { Avatar } from "./Avatar";

//#region Rendering Tests

describe("<Avatar />", () => {
  describe("rendering", () => {
    it("renders image when source is provided", () => {
      render(
        <Avatar
          source="https://example.com/avatar.png"
          username="testuser"
          testID="avatar"
        />,
      );

      expect(screen.getByTestId("avatar")).toBeTruthy();
    });

    it("renders initials when no source provided", () => {
      render(<Avatar initials="JD" testID="avatar" />);

      expect(screen.getByText("JD")).toBeTruthy();
    });

    it("truncates initials to 2 characters", () => {
      render(<Avatar initials="JOHN" testID="avatar" />);

      expect(screen.getByText("JO")).toBeTruthy();
    });

    it("uppercases initials", () => {
      render(<Avatar initials="ab" testID="avatar" />);

      expect(screen.getByText("AB")).toBeTruthy();
    });

    it("generates initials from username when initials not provided", () => {
      render(<Avatar username="johndoe" testID="avatar" />);

      expect(screen.getByText("JO")).toBeTruthy();
    });

    it("prefers initials over username-generated initials", () => {
      render(<Avatar initials="XY" username="johndoe" testID="avatar" />);

      expect(screen.getByText("XY")).toBeTruthy();
    });
  });

  //#endregion Rendering Tests

  //#region Size Variants Tests

  describe("size variants", () => {
    it("renders xs size", () => {
      render(<Avatar initials="JD" size="xs" testID="avatar" />);

      expect(screen.getByTestId("avatar")).toBeTruthy();
    });

    it("renders sm size", () => {
      render(<Avatar initials="JD" size="sm" testID="avatar" />);

      expect(screen.getByTestId("avatar")).toBeTruthy();
    });

    it("renders md size (default)", () => {
      render(<Avatar initials="JD" testID="avatar" />);

      expect(screen.getByTestId("avatar")).toBeTruthy();
    });

    it("renders lg size", () => {
      render(<Avatar initials="JD" size="lg" testID="avatar" />);

      expect(screen.getByTestId("avatar")).toBeTruthy();
    });

    it("renders xl size", () => {
      render(<Avatar initials="JD" size="xl" testID="avatar" />);

      expect(screen.getByTestId("avatar")).toBeTruthy();
    });

    it("renders xxl size", () => {
      render(<Avatar initials="JD" size="xxl" testID="avatar" />);

      expect(screen.getByTestId("avatar")).toBeTruthy();
    });
  });

  //#endregion Size Variants Tests

  //#region Shape Variants Tests

  describe("shape variants", () => {
    it("renders circle shape (default)", () => {
      render(<Avatar initials="JD" testID="avatar" />);

      expect(screen.getByTestId("avatar")).toBeTruthy();
    });

    it("renders rounded shape", () => {
      render(<Avatar initials="JD" shape="rounded" testID="avatar" />);

      expect(screen.getByTestId("avatar")).toBeTruthy();
    });
  });

  //#endregion Shape Variants Tests

  //#region Status Indicator Tests

  describe("status indicator", () => {
    it("shows online status", () => {
      render(<Avatar initials="JD" status="online" testID="avatar" />);

      expect(screen.getByLabelText("Status: online")).toBeTruthy();
    });

    it("shows away status", () => {
      render(<Avatar initials="JD" status="away" testID="avatar" />);

      expect(screen.getByLabelText("Status: away")).toBeTruthy();
    });

    it("shows offline status", () => {
      render(<Avatar initials="JD" status="offline" testID="avatar" />);

      expect(screen.getByLabelText("Status: offline")).toBeTruthy();
    });

    it("shows dnd status", () => {
      render(<Avatar initials="JD" status="dnd" testID="avatar" />);

      expect(screen.getByLabelText("Status: dnd")).toBeTruthy();
    });

    it("hides status when hideStatus is true", () => {
      render(
        <Avatar initials="JD" status="online" hideStatus testID="avatar" />,
      );

      expect(screen.queryByLabelText("Status: online")).toBeNull();
    });

    it("does not show status when not provided", () => {
      render(<Avatar initials="JD" testID="avatar" />);

      expect(screen.queryByLabelText(/Status:/)).toBeNull();
    });
  });

  //#endregion Status Indicator Tests

  //#region Bot Badge Tests

  describe("bot badge", () => {
    it("shows bot badge when isBot is true", () => {
      render(<Avatar initials="BT" isBot testID="avatar" />);

      expect(screen.getByText("BOT")).toBeTruthy();
    });

    it("hides bot badge when isBot is false", () => {
      render(<Avatar initials="JD" testID="avatar" />);

      expect(screen.queryByText("BOT")).toBeNull();
    });
  });

  //#endregion Bot Badge Tests

  //#region Accessibility Tests

  describe("accessibility", () => {
    it("uses username for accessibility label", () => {
      render(<Avatar initials="JD" username="johndoe" testID="avatar" />);

      expect(screen.getByLabelText("johndoe profile image")).toBeTruthy();
    });

    it("uses custom accessibility label when provided", () => {
      render(
        <Avatar
          initials="JD"
          username="johndoe"
          accessibilityLabel="Custom label"
          testID="avatar"
        />,
      );

      expect(screen.getByLabelText("Custom label")).toBeTruthy();
    });

    it("uses default label when no username", () => {
      render(<Avatar initials="JD" testID="avatar" />);

      expect(screen.getByLabelText("User profile image")).toBeTruthy();
    });

    it("has image accessibility role", () => {
      render(<Avatar initials="JD" testID="avatar" />);

      const avatar = screen.getByTestId("avatar");
      expect(avatar.props.accessibilityRole).toBe("image");
    });
  });

  //#endregion Accessibility Tests

  //#region Error Handling Tests

  describe("error handling", () => {
    it("calls onImageError when image fails to load", () => {
      const onImageError = jest.fn();
      render(
        <Avatar
          source="https://example.com/broken.png"
          initials="JD"
          onImageError={onImageError}
          testID="avatar"
        />,
      );

      // Find the Image component and trigger error
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const images = screen.UNSAFE_getAllByType(require("react-native").Image);
      fireEvent(images[0], "error", {
        nativeEvent: { error: "Failed to load" },
      });

      expect(onImageError).toHaveBeenCalled();
    });

    it("falls back to initials when image fails", () => {
      render(
        <Avatar
          source="https://example.com/broken.png"
          initials="JD"
          testID="avatar"
        />,
      );

      // Initially should show image (no initials visible)
      expect(screen.queryByText("JD")).toBeNull();

      // Trigger image error
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const images = screen.UNSAFE_getAllByType(require("react-native").Image);
      fireEvent(images[0], "error", {
        nativeEvent: { error: "Failed to load" },
      });

      // After error, should show initials
      expect(screen.getByText("JD")).toBeTruthy();
    });
  });

  //#endregion Error Handling Tests

  //#region Ref Forwarding Tests

  describe("ref forwarding", () => {
    it("forwards ref to container View", () => {
      const ref =
        React.createRef<
          React.ComponentRef<typeof import("react-native").View>
        >();
      render(<Avatar initials="JD" ref={ref} testID="avatar" />);

      expect(ref.current).toBeTruthy();
    });
  });

  //#endregion Ref Forwarding Tests
});

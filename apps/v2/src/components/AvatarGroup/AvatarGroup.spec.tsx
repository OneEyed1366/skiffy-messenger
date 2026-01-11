// apps/v2/src/components/AvatarGroup/AvatarGroup.spec.tsx

import React from "react";
import { render, screen } from "@testing-library/react-native";
import { View } from "react-native";

import { AvatarGroup, type IAvatarData } from "./AvatarGroup";

//#region Test Data

const mockAvatars: IAvatarData[] = [
  { id: "1", username: "Alice", source: "https://example.com/alice.jpg" },
  { id: "2", username: "Bob", source: "https://example.com/bob.jpg" },
  { id: "3", username: "Charlie", source: "https://example.com/charlie.jpg" },
  { id: "4", username: "Diana", source: "https://example.com/diana.jpg" },
  { id: "5", username: "Eve", source: "https://example.com/eve.jpg" },
];

//#endregion Test Data

//#region Rendering Tests

describe("<AvatarGroup />", () => {
  describe("rendering", () => {
    it("renders avatars up to max", () => {
      render(
        <AvatarGroup avatars={mockAvatars} max={3} testID="avatar-group" />,
      );

      expect(screen.getByTestId("avatar-group")).toBeTruthy();
      // Should show 3 avatars - Avatar component creates 2 elements per avatar with the label
      // (container View and Image), so we check that at least the expected labels exist
      expect(
        screen.getAllByLabelText("Alice profile image").length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByLabelText("Bob profile image").length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByLabelText("Charlie profile image").length,
      ).toBeGreaterThan(0);
      // Diana should NOT be visible (4th avatar, max=3)
      expect(screen.queryAllByLabelText("Diana profile image")).toHaveLength(0);
    });

    it("renders overflow count when exceeding max", () => {
      render(<AvatarGroup avatars={mockAvatars} max={3} />);

      expect(screen.getByText("+2")).toBeTruthy();
    });

    it("does not show overflow when avatars <= max", () => {
      render(<AvatarGroup avatars={mockAvatars.slice(0, 2)} max={3} />);

      expect(screen.queryByText(/\+/)).toBeNull();
    });

    it("renders with testID", () => {
      render(<AvatarGroup avatars={mockAvatars} testID="avatar-group" />);

      expect(screen.getByTestId("avatar-group")).toBeTruthy();
    });

    it("renders single avatar without overflow badge", () => {
      render(<AvatarGroup avatars={[mockAvatars[0]]} max={3} />);

      expect(
        screen.getAllByLabelText("Alice profile image").length,
      ).toBeGreaterThan(0);
      expect(screen.queryByText(/\+/)).toBeNull();
    });
  });

  //#endregion Rendering Tests

  //#region Size Tests

  describe("sizes", () => {
    const sizes = ["xs", "sm", "md", "lg"] as const;

    sizes.forEach((size) => {
      it(`renders ${size} size`, () => {
        render(
          <AvatarGroup
            avatars={mockAvatars.slice(0, 2)}
            size={size}
            testID="avatar-group"
          />,
        );

        expect(screen.getByTestId("avatar-group")).toBeTruthy();
      });
    });
  });

  //#endregion Size Tests

  //#region Configuration Tests

  describe("configuration", () => {
    it("respects max prop", () => {
      render(<AvatarGroup avatars={mockAvatars} max={2} />);

      // Should show +3 overflow (5 total - 2 visible = 3 overflow)
      expect(screen.getByText("+3")).toBeTruthy();
    });

    it("renders all avatars when max >= avatars.length", () => {
      render(<AvatarGroup avatars={mockAvatars} max={10} />);

      // All 5 should be visible
      expect(
        screen.getAllByLabelText("Alice profile image").length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByLabelText("Eve profile image").length,
      ).toBeGreaterThan(0);
      expect(screen.queryByText(/\+/)).toBeNull();
    });

    it("uses default max of 3", () => {
      render(<AvatarGroup avatars={mockAvatars} />);

      // 5 avatars with default max=3 should show +2
      expect(screen.getByText("+2")).toBeTruthy();
    });

    it("supports left stack direction (default)", () => {
      render(
        <AvatarGroup
          avatars={mockAvatars.slice(0, 3)}
          stackDirection="left"
          testID="avatar-group"
        />,
      );

      expect(screen.getByTestId("avatar-group")).toBeTruthy();
    });

    it("supports right stack direction", () => {
      render(
        <AvatarGroup
          avatars={mockAvatars.slice(0, 3)}
          stackDirection="right"
          testID="avatar-group"
        />,
      );

      expect(screen.getByTestId("avatar-group")).toBeTruthy();
    });

    it("supports custom overlap ratio", () => {
      render(
        <AvatarGroup
          avatars={mockAvatars.slice(0, 3)}
          overlapRatio={0.5}
          testID="avatar-group"
        />,
      );

      expect(screen.getByTestId("avatar-group")).toBeTruthy();
    });
  });

  //#endregion Configuration Tests

  //#region Accessibility Tests

  describe("accessibility", () => {
    it("announces total participant count with overflow", () => {
      render(<AvatarGroup avatars={mockAvatars} max={3} />);

      expect(screen.getByLabelText("5 users, showing 3")).toBeTruthy();
    });

    it("announces total participant count without overflow", () => {
      render(<AvatarGroup avatars={mockAvatars.slice(0, 3)} max={5} />);

      expect(screen.getByLabelText("3 users")).toBeTruthy();
    });

    it("handles singular participant", () => {
      render(<AvatarGroup avatars={[mockAvatars[0]]} />);

      expect(screen.getByLabelText("1 user")).toBeTruthy();
    });

    it("handles no participants", () => {
      render(<AvatarGroup avatars={[]} />);

      expect(screen.getByLabelText("No users")).toBeTruthy();
    });

    it("has text accessibility role on container", () => {
      render(<AvatarGroup avatars={mockAvatars} testID="avatar-group" />);

      const container = screen.getByTestId("avatar-group");
      expect(container.props.accessibilityRole).toBe("text");
    });
  });

  //#endregion Accessibility Tests

  //#region Empty State Tests

  describe("empty state", () => {
    it("renders empty container when avatars array is empty", () => {
      render(<AvatarGroup avatars={[]} testID="avatar-group" />);

      const container = screen.getByTestId("avatar-group");
      expect(container).toBeTruthy();
      expect(screen.queryByText(/\+/)).toBeNull();
    });
  });

  //#endregion Empty State Tests

  //#region Avatar Data Tests

  describe("avatar data", () => {
    it("renders avatars with initials when no source", () => {
      const avatarsWithInitials: IAvatarData[] = [
        { id: "1", initials: "AB" },
        { id: "2", initials: "CD" },
      ];

      render(<AvatarGroup avatars={avatarsWithInitials} />);

      expect(screen.getByText("AB")).toBeTruthy();
      expect(screen.getByText("CD")).toBeTruthy();
    });

    it("renders avatars with status indicators", () => {
      const avatarsWithStatus: IAvatarData[] = [
        { id: "1", username: "Alice", status: "online" },
        { id: "2", username: "Bob", status: "away" },
      ];

      render(<AvatarGroup avatars={avatarsWithStatus} />);

      expect(screen.getByLabelText("Status: online")).toBeTruthy();
      expect(screen.getByLabelText("Status: away")).toBeTruthy();
    });
  });

  //#endregion Avatar Data Tests

  //#region Ref Forwarding Tests

  describe("ref forwarding", () => {
    it("forwards ref to container View", () => {
      const ref = React.createRef<React.ComponentRef<typeof View>>();

      render(
        <AvatarGroup avatars={mockAvatars} ref={ref} testID="avatar-group" />,
      );

      expect(ref.current).toBeTruthy();
    });

    it("forwards ref when avatars array is empty", () => {
      const ref = React.createRef<React.ComponentRef<typeof View>>();

      render(<AvatarGroup avatars={[]} ref={ref} testID="avatar-group" />);

      expect(ref.current).toBeTruthy();
    });
  });

  //#endregion Ref Forwarding Tests

  //#region Overflow Badge Tests

  describe("overflow badge", () => {
    it("shows correct overflow count for various max values", () => {
      const { rerender } = render(
        <AvatarGroup avatars={mockAvatars} max={1} />,
      );
      expect(screen.getByText("+4")).toBeTruthy();

      rerender(<AvatarGroup avatars={mockAvatars} max={2} />);
      expect(screen.getByText("+3")).toBeTruthy();

      rerender(<AvatarGroup avatars={mockAvatars} max={4} />);
      expect(screen.getByText("+1")).toBeTruthy();
    });

    it("does not show overflow badge when exactly at max", () => {
      render(<AvatarGroup avatars={mockAvatars.slice(0, 3)} max={3} />);

      expect(screen.queryByText(/\+/)).toBeNull();
    });
  });

  //#endregion Overflow Badge Tests
});

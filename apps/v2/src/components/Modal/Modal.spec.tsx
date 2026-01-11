// apps/v2/src/components/Modal/Modal.spec.tsx

import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import { Text, View } from "react-native";

import { Modal } from "./Modal";

//#region Test Setup

describe("<Modal />", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  //#endregion Test Setup

  //#region Visibility Tests

  describe("visibility", () => {
    it("renders when visible is true", () => {
      const { getByTestId } = render(
        <Modal visible onClose={jest.fn()} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      expect(getByTestId("modal")).toBeTruthy();
    });

    it("does not render when visible is false", () => {
      const { queryByTestId } = render(
        <Modal visible={false} onClose={jest.fn()} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      // RN Modal with visible=false should not render children
      expect(queryByTestId("modal-content")).toBeNull();
    });
  });

  //#endregion Visibility Tests

  //#region Backdrop Tests

  describe("backdrop", () => {
    it("calls onClose when backdrop is pressed and dismissOnBackdrop is true", () => {
      const onClose = jest.fn();
      const { getByLabelText } = render(
        <Modal visible onClose={onClose} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      fireEvent.press(getByLabelText("Close modal"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when backdrop is pressed and dismissOnBackdrop is false", () => {
      const onClose = jest.fn();
      const { getByLabelText } = render(
        <Modal visible onClose={onClose} dismissOnBackdrop={false} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      fireEvent.press(getByLabelText("Close modal"));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  //#endregion Backdrop Tests

  //#region Close Button Tests

  describe("close button", () => {
    it("renders close button by default", () => {
      const { getByLabelText } = render(
        <Modal visible onClose={jest.fn()} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      expect(getByLabelText("Close")).toBeTruthy();
    });

    it("hides close button when showCloseButton is false", () => {
      const { queryByLabelText } = render(
        <Modal visible onClose={jest.fn()} showCloseButton={false} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      expect(queryByLabelText("Close")).toBeNull();
    });

    it("calls onClose when close button is pressed", () => {
      const onClose = jest.fn();
      const { getByLabelText } = render(
        <Modal visible onClose={onClose} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      fireEvent.press(getByLabelText("Close"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  //#endregion Close Button Tests

  //#region Title Tests

  describe("title", () => {
    it("renders title string", () => {
      const { getByText } = render(
        <Modal visible onClose={jest.fn()} title="Modal Title" testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      expect(getByText("Modal Title")).toBeTruthy();
    });

    it("renders title from titleKey (i18n)", () => {
      const { getByText } = render(
        <Modal visible onClose={jest.fn()} titleKey="label.save" testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      // "label.save" translates to "Save" in en.json
      expect(getByText("Save")).toBeTruthy();
    });

    it("prioritizes titleKey over title when both provided", () => {
      const { getByText, queryByText } = render(
        <Modal visible onClose={jest.fn()} title="String Title" titleKey="label.save" testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      expect(getByText("Save")).toBeTruthy();
      expect(queryByText("String Title")).toBeNull();
    });

    it("renders without header when no title and showCloseButton is false", () => {
      const { queryByTestId } = render(
        <Modal visible onClose={jest.fn()} showCloseButton={false} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      expect(queryByTestId("modal-header")).toBeNull();
    });
  });

  //#endregion Title Tests

  //#region Children Tests

  describe("children", () => {
    it("renders children in body", () => {
      const { getByText } = render(
        <Modal visible onClose={jest.fn()} testID="modal">
          <Text>Body Content</Text>
        </Modal>,
      );

      expect(getByText("Body Content")).toBeTruthy();
    });

    it("renders complex children", () => {
      const { getByTestId } = render(
        <Modal visible onClose={jest.fn()} testID="modal">
          <View testID="child-view">
            <Text>Nested Content</Text>
          </View>
        </Modal>,
      );

      expect(getByTestId("child-view")).toBeTruthy();
    });
  });

  //#endregion Children Tests

  //#region Footer Tests

  describe("footer", () => {
    it("renders footer content", () => {
      const { getByText } = render(
        <Modal
          visible
          onClose={jest.fn()}
          footer={<Text>Footer Actions</Text>}
          testID="modal"
        >
          <Text>Content</Text>
        </Modal>,
      );

      expect(getByText("Footer Actions")).toBeTruthy();
    });

    it("does not render footer when not provided", () => {
      const { queryByTestId } = render(
        <Modal visible onClose={jest.fn()} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      expect(queryByTestId("modal-footer")).toBeNull();
    });
  });

  //#endregion Footer Tests

  //#region Size Variant Tests

  describe("size variants", () => {
    it.each(["sm", "md", "lg", "fullscreen"] as const)(
      "renders with size %s",
      (size) => {
        const { getByTestId } = render(
          <Modal visible onClose={jest.fn()} size={size} testID="modal">
            <Text>Content</Text>
          </Modal>,
        );

        expect(getByTestId("modal")).toBeTruthy();
      },
    );

    it("uses md size by default", () => {
      const { getByTestId } = render(
        <Modal visible onClose={jest.fn()} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      expect(getByTestId("modal")).toBeTruthy();
    });
  });

  //#endregion Size Variant Tests

  //#region Animation Callback Tests

  describe("animation callbacks", () => {
    it("calls onEntered after enter animation completes", async () => {
      const onEntered = jest.fn();

      render(
        <Modal visible onClose={jest.fn()} onEntered={onEntered} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      await act(async () => {
        jest.advanceTimersByTime(ANIMATION_DURATION);
      });

      await waitFor(() => {
        expect(onEntered).toHaveBeenCalledTimes(1);
      });
    });

    it("calls onExited after exit animation completes", async () => {
      const onExited = jest.fn();

      const { rerender } = render(
        <Modal visible onClose={jest.fn()} onExited={onExited} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      // Allow enter animation to complete
      await act(async () => {
        jest.advanceTimersByTime(ANIMATION_DURATION);
      });

      // Close modal
      rerender(
        <Modal visible={false} onClose={jest.fn()} onExited={onExited} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      await act(async () => {
        jest.advanceTimersByTime(ANIMATION_DURATION);
      });

      await waitFor(() => {
        expect(onExited).toHaveBeenCalledTimes(1);
      });
    });
  });

  //#endregion Animation Callback Tests

  //#region Accessibility Tests

  describe("accessibility", () => {
    it("has accessibilityViewIsModal on RNModal", () => {
      const { getByTestId } = render(
        <Modal visible onClose={jest.fn()} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      const modal = getByTestId("modal");
      expect(modal.props.accessibilityViewIsModal).toBe(true);
    });

    it("close button has accessibilityLabel", () => {
      const { getByLabelText } = render(
        <Modal visible onClose={jest.fn()} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      const closeButton = getByLabelText("Close");
      expect(closeButton).toBeTruthy();
    });

    it("backdrop has accessibilityLabel", () => {
      const { getByLabelText } = render(
        <Modal visible onClose={jest.fn()} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      const backdrop = getByLabelText("Close modal");
      expect(backdrop).toBeTruthy();
    });
  });

  //#endregion Accessibility Tests

  //#region Ref Tests

  describe("ref forwarding", () => {
    it("forwards ref to container View", () => {
      const ref = { current: null };

      render(
        <Modal visible onClose={jest.fn()} ref={ref} testID="modal">
          <Text>Content</Text>
        </Modal>,
      );

      expect(ref.current).toBeTruthy();
    });
  });

  //#endregion Ref Tests

  //#region testID Tests

  describe("testID propagation", () => {
    it("applies testID to modal and subcomponents", () => {
      const { getByTestId } = render(
        <Modal
          visible
          onClose={jest.fn()}
          title="Title"
          footer={<Text>Footer</Text>}
          testID="test-modal"
        >
          <Text>Content</Text>
        </Modal>,
      );

      expect(getByTestId("test-modal")).toBeTruthy();
      expect(getByTestId("test-modal-backdrop")).toBeTruthy();
      expect(getByTestId("test-modal-content")).toBeTruthy();
      expect(getByTestId("test-modal-header")).toBeTruthy();
      expect(getByTestId("test-modal-title")).toBeTruthy();
      expect(getByTestId("test-modal-close-button")).toBeTruthy();
      expect(getByTestId("test-modal-body")).toBeTruthy();
      expect(getByTestId("test-modal-footer")).toBeTruthy();
    });
  });

  //#endregion testID Tests
});

//#region Constants

const ANIMATION_DURATION = 200;

//#endregion Constants

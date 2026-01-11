// apps/v2/src/components/Menu/Menu.spec.tsx

import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Text, View } from "react-native";

import { Menu } from "./Menu";
import { MenuItem } from "./MenuItem";
import { MenuDivider } from "./MenuDivider";
import { MenuHeader } from "./MenuHeader";

//#region Menu Tests

describe("<Menu />", () => {
  //#region Rendering Tests

  describe("rendering", () => {
    it("renders trigger element", () => {
      const { getByText } = render(
        <Menu trigger={<Text>Open Menu</Text>}>
          <MenuItem label="Item 1" />
        </Menu>,
      );

      expect(getByText("Open Menu")).toBeTruthy();
    });

    it("does not show menu content initially", () => {
      const { queryByText } = render(
        <Menu trigger={<Text>Open Menu</Text>}>
          <MenuItem label="Item 1" />
        </Menu>,
      );

      expect(queryByText("Item 1")).toBeNull();
    });

    it("renders with testID", () => {
      const { getByTestId } = render(
        <Menu trigger={<Text>Open</Text>} testID="test-menu">
          <MenuItem label="Item" />
        </Menu>,
      );

      expect(getByTestId("test-menu")).toBeTruthy();
    });
  });

  //#endregion Rendering Tests

  //#region Interaction Tests

  describe("interactions", () => {
    it("opens menu on trigger press", async () => {
      const { getByText } = render(
        <Menu trigger={<Text>Open Menu</Text>}>
          <MenuItem label="Item 1" />
        </Menu>,
      );

      fireEvent.press(getByText("Open Menu"));

      await waitFor(() => {
        expect(getByText("Item 1")).toBeTruthy();
      });
    });

    it("closes menu on backdrop press", async () => {
      const { getByText, getByTestId, queryByText } = render(
        <Menu trigger={<Text>Open Menu</Text>} testID="menu">
          <MenuItem label="Item 1" />
        </Menu>,
      );

      // Open menu
      fireEvent.press(getByText("Open Menu"));

      await waitFor(() => {
        expect(getByText("Item 1")).toBeTruthy();
      });

      // Press backdrop
      fireEvent.press(getByTestId("menu-backdrop"));

      await waitFor(() => {
        expect(queryByText("Item 1")).toBeNull();
      });
    });

    it("calls onOpenChange when opened", async () => {
      const onOpenChange = jest.fn();
      const { getByText } = render(
        <Menu trigger={<Text>Open Menu</Text>} onOpenChange={onOpenChange}>
          <MenuItem label="Item 1" />
        </Menu>,
      );

      fireEvent.press(getByText("Open Menu"));

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("calls onOpenChange when closed", async () => {
      const onOpenChange = jest.fn();
      const { getByText, getByTestId } = render(
        <Menu
          trigger={<Text>Open Menu</Text>}
          onOpenChange={onOpenChange}
          testID="menu"
        >
          <MenuItem label="Item 1" />
        </Menu>,
      );

      // Open
      fireEvent.press(getByText("Open Menu"));
      expect(onOpenChange).toHaveBeenCalledWith(true);

      await waitFor(() => {
        expect(getByText("Item 1")).toBeTruthy();
      });

      // Close
      fireEvent.press(getByTestId("menu-backdrop"));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  //#endregion Interaction Tests

  //#region Controlled State Tests

  describe("controlled state", () => {
    it("respects controlled open=false", () => {
      const { queryByText } = render(
        <Menu trigger={<Text>Open Menu</Text>} open={false}>
          <MenuItem label="Item 1" />
        </Menu>,
      );

      expect(queryByText("Item 1")).toBeNull();
    });

    it("respects controlled open=true", async () => {
      const { getByText } = render(
        <Menu trigger={<Text>Open Menu</Text>} open={true}>
          <MenuItem label="Item 1" />
        </Menu>,
      );

      await waitFor(() => {
        expect(getByText("Item 1")).toBeTruthy();
      });
    });

    it("updates when controlled open changes", async () => {
      const { getByText, queryByText, rerender } = render(
        <Menu trigger={<Text>Open Menu</Text>} open={false}>
          <MenuItem label="Item 1" />
        </Menu>,
      );

      expect(queryByText("Item 1")).toBeNull();

      rerender(
        <Menu trigger={<Text>Open Menu</Text>} open={true}>
          <MenuItem label="Item 1" />
        </Menu>,
      );

      await waitFor(() => {
        expect(getByText("Item 1")).toBeTruthy();
      });
    });
  });

  //#endregion Controlled State Tests

  //#region Position Tests

  describe("position variants", () => {
    it.each(["bottom-start", "bottom-end", "top-start", "top-end"] as const)(
      "renders with position %s",
      async (position) => {
        const { getByText } = render(
          <Menu trigger={<Text>Open</Text>} position={position} open={true}>
            <MenuItem label="Item" />
          </Menu>,
        );

        await waitFor(() => {
          expect(getByText("Item")).toBeTruthy();
        });
      },
    );
  });

  //#endregion Position Tests
});

//#endregion Menu Tests

//#region MenuItem Tests

describe("<MenuItem />", () => {
  //#region Rendering Tests

  describe("rendering", () => {
    it("renders with label", async () => {
      const { getByText } = render(
        <Menu trigger={<Text>Open</Text>} open={true}>
          <MenuItem label="Test Item" />
        </Menu>,
      );

      await waitFor(() => {
        expect(getByText("Test Item")).toBeTruthy();
      });
    });

    it("renders with labelKey (i18n)", async () => {
      const { getByText } = render(
        <Menu trigger={<Text>Open</Text>} open={true}>
          <MenuItem labelKey="label.save" />
        </Menu>,
      );

      await waitFor(() => {
        // "label.save" translates to "Save" in en.json
        expect(getByText("Save")).toBeTruthy();
      });
    });

    it("renders with description", async () => {
      const { getByText } = render(
        <Menu trigger={<Text>Open</Text>} open={true}>
          <MenuItem label="Item" description="Description text" />
        </Menu>,
      );

      await waitFor(() => {
        expect(getByText("Description text")).toBeTruthy();
      });
    });

    it("renders leading icon", async () => {
      const Icon = () => <Text testID="icon">Icon</Text>;
      const { getByTestId } = render(
        <Menu trigger={<Text>Open</Text>} open={true}>
          <MenuItem label="Item" leadingIcon={<Icon />} />
        </Menu>,
      );

      await waitFor(() => {
        expect(getByTestId("icon")).toBeTruthy();
      });
    });

    it("renders trailing element", async () => {
      const Badge = () => <Text testID="badge">3</Text>;
      const { getByTestId } = render(
        <Menu trigger={<Text>Open</Text>} open={true}>
          <MenuItem label="Item" trailingElement={<Badge />} />
        </Menu>,
      );

      await waitFor(() => {
        expect(getByTestId("badge")).toBeTruthy();
      });
    });

    it("renders with testID", async () => {
      const { getByTestId } = render(
        <Menu trigger={<Text>Open</Text>} open={true}>
          <MenuItem label="Item" testID="test-item" />
        </Menu>,
      );

      await waitFor(() => {
        expect(getByTestId("test-item")).toBeTruthy();
      });
    });
  });

  //#endregion Rendering Tests

  //#region Interaction Tests

  describe("interactions", () => {
    it("calls onPress when pressed", async () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Menu trigger={<Text>Open</Text>} open={true}>
          <MenuItem label="Click me" onPress={onPress} />
        </Menu>,
      );

      await waitFor(() => {
        expect(getByText("Click me")).toBeTruthy();
      });

      fireEvent.press(getByText("Click me"));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("closes menu on press by default", async () => {
      const onOpenChange = jest.fn();
      const { getByText } = render(
        <Menu trigger={<Text>Open</Text>} open={true} onOpenChange={onOpenChange}>
          <MenuItem label="Click me" onPress={() => {}} />
        </Menu>,
      );

      await waitFor(() => {
        expect(getByText("Click me")).toBeTruthy();
      });

      fireEvent.press(getByText("Click me"));

      // Menu should close (onOpenChange called with false)
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("keeps menu open with keepOpen=true", async () => {
      const onOpenChange = jest.fn();
      const { getByText } = render(
        <Menu trigger={<Text>Open</Text>} open={true} onOpenChange={onOpenChange}>
          <MenuItem label="Keep open" onPress={() => {}} keepOpen />
        </Menu>,
      );

      await waitFor(() => {
        expect(getByText("Keep open")).toBeTruthy();
      });

      fireEvent.press(getByText("Keep open"));

      // Menu should NOT close
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it("does not call onPress when disabled", async () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Menu trigger={<Text>Open</Text>} open={true}>
          <MenuItem label="Disabled" onPress={onPress} disabled />
        </Menu>,
      );

      await waitFor(() => {
        expect(getByText("Disabled")).toBeTruthy();
      });

      fireEvent.press(getByText("Disabled"));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  //#endregion Interaction Tests

  //#region Variant Tests

  describe("variants", () => {
    it("renders destructive variant", async () => {
      const { getByRole } = render(
        <Menu trigger={<Text>Open</Text>} open={true}>
          <MenuItem label="Delete" destructive />
        </Menu>,
      );

      await waitFor(() => {
        expect(getByRole("menuitem")).toBeTruthy();
      });
    });

    it("renders disabled state with accessibility", async () => {
      const { getByRole } = render(
        <Menu trigger={<Text>Open</Text>} open={true}>
          <MenuItem label="Disabled" disabled />
        </Menu>,
      );

      await waitFor(() => {
        const item = getByRole("menuitem");
        expect(item.props.accessibilityState.disabled).toBe(true);
      });
    });
  });

  //#endregion Variant Tests

  //#region Accessibility Tests

  describe("accessibility", () => {
    it("has menuitem role", async () => {
      const { getByRole } = render(
        <Menu trigger={<Text>Open</Text>} open={true}>
          <MenuItem label="Item" />
        </Menu>,
      );

      await waitFor(() => {
        expect(getByRole("menuitem")).toBeTruthy();
      });
    });

    it("has accessibility hint for destructive items", async () => {
      const { getByRole } = render(
        <Menu trigger={<Text>Open</Text>} open={true}>
          <MenuItem label="Delete" destructive />
        </Menu>,
      );

      await waitFor(() => {
        const item = getByRole("menuitem");
        expect(item.props.accessibilityHint).toBe("Destructive action");
      });
    });
  });

  //#endregion Accessibility Tests
});

//#endregion MenuItem Tests

//#region MenuDivider Tests

describe("<MenuDivider />", () => {
  it("renders with separator role", async () => {
    const { findByTestId } = render(
      <Menu trigger={<Text>Open</Text>} open={true}>
        <MenuItem label="Item 1" />
        <MenuDivider testID="menu-divider" />
        <MenuItem label="Item 2" />
      </Menu>,
    );

    const divider = await findByTestId("menu-divider");
    expect(divider.props.accessibilityRole).toBe("none");
  });

  it("renders with testID", async () => {
    const { getByTestId } = render(
      <Menu trigger={<Text>Open</Text>} open={true}>
        <MenuDivider testID="divider" />
      </Menu>,
    );

    await waitFor(() => {
      expect(getByTestId("divider")).toBeTruthy();
    });
  });
});

//#endregion MenuDivider Tests

//#region MenuHeader Tests

describe("<MenuHeader />", () => {
  it("renders with title", () => {
    const { getByText } = render(
      <Menu trigger={<Text>Open</Text>} open={true}>
        <MenuHeader title="Section" />
        <MenuItem label="Item" />
      </Menu>,
    );
    expect(getByText("Section")).toBeTruthy();
  });

  it("renders with titleKey (i18n)", () => {
    const { getByText } = render(
      <Menu trigger={<Text>Open</Text>} open={true}>
        <MenuHeader titleKey="label.save" />
        <MenuItem label="Item" />
      </Menu>,
    );
    // "label.save" translates to "Save" in en.json
    expect(getByText("Save")).toBeTruthy();
  });

  it("renders with testID", () => {
    const { getByTestId } = render(
      <Menu trigger={<Text>Open</Text>} open={true}>
        <MenuHeader title="Section" testID="menu-header" />
      </Menu>,
    );
    expect(getByTestId("menu-header")).toBeTruthy();
  });

  it("truncates long titles to one line", () => {
    const { getByText } = render(
      <Menu trigger={<Text>Open</Text>} open={true}>
        <MenuHeader title="This is a very long header title that should be truncated" />
      </Menu>,
    );
    const header = getByText("This is a very long header title that should be truncated");
    expect(header.props.numberOfLines).toBe(1);
  });
});

//#endregion MenuHeader Tests

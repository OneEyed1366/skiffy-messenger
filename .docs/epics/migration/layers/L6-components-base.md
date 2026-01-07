# L6: Base Components

## Overview

Foundational UI components used throughout the application. These are the building blocks for all other components.

## Target Location

`apps/v2/src/components/`

## Dependencies

- L0-L5: Types, constants, utils, hooks

## Tasks

| ID                                                   | Name           | Status  | Parallel | Est. | Assignee |
| ---------------------------------------------------- | -------------- | ------- | -------- | ---- | -------- |
| [T6.01](../tasks/T6.01-component-avatar.md)          | Avatar         | pending | ✓        | 4h   | -        |
| [T6.02](../tasks/T6.02-component-badge.md)           | Badge          | pending | ✓        | 1h   | -        |
| [T6.03](../tasks/T6.03-component-loading-spinner.md) | LoadingSpinner | pending | ✓        | 1h   | -        |
| [T6.04](../tasks/T6.04-component-tooltip.md)         | Tooltip        | pending | ✓        | 2h   | -        |
| [T6.05](../tasks/T6.05-component-icon.md)            | Icon           | pending | ✓        | 2h   | -        |
| [T6.06](../tasks/T6.06-component-button.md)          | Button         | pending | ✓        | 4h   | -        |
| [T6.07](../tasks/T6.07-component-text-input.md)      | TextInput      | pending | ✓        | 3h   | -        |
| [T6.08](../tasks/T6.08-component-checkbox.md)        | Checkbox       | pending | ✓        | 1h   | -        |
| [T6.09](../tasks/T6.09-component-toggle.md)          | Toggle         | pending | ✓        | 1h   | -        |
| [T6.10](../tasks/T6.10-component-modal.md)           | Modal          | pending | ✓        | 3h   | -        |
| [T6.11](../tasks/T6.11-component-menu.md)            | Menu           | pending | ✓        | 2h   | -        |
| [T6.12](../tasks/T6.12-component-pill.md)            | Pill           | pending | ✓        | 1h   | -        |
| [T6.13](../tasks/T6.13-component-timestamp.md)       | Timestamp      | pending | ✓        | 2h   | -        |
| [T6.14](../tasks/T6.14-component-separator.md)       | Separator      | pending | ✓        | 0.5h | -        |
| [T6.15](../tasks/T6.15-component-skeleton.md)        | Skeleton       | pending | ✓        | 1h   | -        |
| [T6.16](../tasks/T6.16-component-text.md)            | Text           | pending | ✓        | 2h   | -        |
| [T6.17](../tasks/T6.17-component-icon-button.md)     | IconButton     | pending | ✓        | 1.5h | -        |
| [T6.18](../tasks/T6.18-component-avatar-group.md)    | AvatarGroup    | pending | ✓        | 2h   | -        |
| [T6.19](../tasks/T6.19-component-textarea.md)        | TextArea       | pending | ✓        | 2.5h | -        |
| [T6.20](../tasks/T6.20-component-pressable.md)       | Pressable      | pending | ✓        | 1h   | -        |

## Progress

- Total: 20
- Done: 0
- In Progress: 0
- Pending: 20
- Estimated: 36.5h

## File Structure

Each component follows the standard pattern:

```
apps/v2/src/components/
├── Text/
│   ├── Text.tsx
│   ├── Text.spec.tsx
│   ├── Text.stories.tsx
│   └── index.ts
├── Button/
│   ├── Button.tsx
│   ├── Button.spec.tsx
│   ├── Button.stories.tsx
│   └── index.ts
├── Icon/
│   └── ...
├── Avatar/
│   └── ...
└── ... (other components)
```

## Component Patterns

### Standard Component Template

```typescript
// ComponentName.tsx
import { View } from 'react-native';
import { StyleSheet, UnistylesVariants } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';

//#region Types

type IProps = {
  // Required props
  children: React.ReactNode;

  // Optional props with defaults
  testID?: string;

  // Ref forwarding (React 19 style)
  ref?: React.Ref<React.ComponentRef<typeof View>>;
} & UnistylesVariants<typeof styles>;

//#endregion

//#region Component

export function ComponentName({
  children,
  variant = 'default',
  size = 'md',
  testID,
  ref,
}: IProps) {
  styles.useVariants({ variant, size });

  return (
    <View ref={ref} style={styles.container} testID={testID}>
      {children}
    </View>
  );
}

//#endregion

//#region Styles

const styles = StyleSheet.create((theme) => ({
  container: {
    // Base styles
    variants: {
      variant: {
        default: {},
        primary: {},
      },
      size: {
        sm: {},
        md: {},
        lg: {},
      },
    },
  },
}));

//#endregion
```

### Standard Test Template

```typescript
// ComponentName.spec.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { ComponentName } from './ComponentName';

describe('<ComponentName />', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ComponentName>Test content</ComponentName>
    );
    expect(getByText('Test content')).toBeTruthy();
  });

  it('applies variant styles', () => {
    // Test variants
  });

  it('forwards ref', () => {
    // Test ref forwarding
  });
});
```

### Standard Story Template

```typescript
// ComponentName.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ComponentName } from "./ComponentName";

const meta: Meta<typeof ComponentName> = {
  title: "Components/ComponentName",
  component: ComponentName,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: {
    children: "Content",
  },
};
```

## Priority Order

Build in this order (dependencies):

1. **Icon** (T6.05) - Used by Button, Avatar, Menu, etc.
2. **LoadingSpinner** (T6.03) - Used by Button loading states
3. **Button** (T6.06) - Critical interaction component
4. **Avatar** (T6.01) - User display, used everywhere
5. **Badge** (T6.02) - Notification counts, often paired with Avatar
6. **TextInput** (T6.07) - Core form input
7. **Checkbox** (T6.08) - Form control
8. **Toggle** (T6.09) - Switch control (on/off settings)
9. **Separator** (T6.14) - Visual divider
10. **Pill** (T6.12) - Tags, status indicators
11. **Skeleton** (T6.15) - Loading placeholders
12. **Timestamp** (T6.13) - Relative/absolute time display
13. **Menu** (T6.11) - Dropdown/context menus
14. **Modal** (T6.10) - Dialogs/overlays
15. **Tooltip** (T6.04) - Help text (more complex, needs portal)

## Notes

- All components must have Storybook stories
- All components must have unit tests
- Use Unistyles variants for visual variations
- No useCallback/useMemo (React Compiler)
- Ref as regular prop (React 19)

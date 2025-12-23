# Coding Standards

## Overview

This document defines coding standards for the Mattermost Platform Migration project during the transition from Electron to Expo + Tauri architecture.

## Dual System Standards

### Legacy System (vendor/desktop) - READ-ONLY

- **Status**: Maintenance mode only, no new development
- **Standards**: Existing Electron + React 17 + SCSS patterns preserved
- **Modifications**: Only critical bug fixes, no feature additions

### Modern System (apps/v2) - ACTIVE DEVELOPMENT

- **Status**: Primary development target
- **Standards**: Modern React Native + TypeScript + Unistyles patterns

## TypeScript Standards

### Configuration

- **Strict Mode**: Enabled (`"strict": true`)
- **Target**: ES2022 for modern JavaScript features
- **Module**: ESNext with proper imports/exports
- **Path Mapping**: Use `@/*` aliases for clean imports

```typescript
// ✅ Good - Use path aliases
import { theme } from "@/theme";
import { UserService } from "@/services/UserService";

// ❌ Bad - Relative imports
import { theme } from "../../../theme";
import { UserService } from "./services/UserService";
```

### Type Safety

- **No `any` types**: Use proper TypeScript types
- **Interface over type**: Prefer interfaces for object shapes
- **Generics**: Use generics for reusable components

```typescript
// ✅ Good - Proper typing
interface UserProps {
  user: User;
  onSelect: (userId: string) => void;
}

function UserComponent({ user, onSelect }: UserProps) {
  return <Text onPress={() => onSelect(user.id)}>{user.name}</Text>;
}

// ❌ Bad - Any types
function UserComponent({ user, onSelect }: any) {
  return <Text onPress={() => onSelect(user.id)}>{user.name}</Text>;
}
```

## React Standards

### Component Structure (Component-Per-Folder Pattern)

Each component should follow the component-per-folder structure based on Stories 1.2 and 1.3:

#### Required Files in Each Component Folder:

1. **`ComponentName.tsx`** - Main React component implementation
2. **`styles.ts`** - Co-located Unistyles with exported styles constant and `UnistylesVariant` types
3. **`ComponentName.spec.tsx`** - Jest tests using React Native Testing Library
4. **`index.ts`** - Barrel export for external consumption

#### Optional Files (when applicable):

5. **`LocalSubComponent.tsx`** - Sub-components specific to this component
6. **`ComponentName.stories.tsx`** - Storybook stories demonstrating component states
7. **`types.ts`** - Component-specific TypeScript interfaces

#### Component Implementation Standards:

- **Functional Components**: Use function declarations with explicit types
- **Hooks Order**: useState, useEffect, custom hooks, then callbacks
- **File Organization**: Props interface, component logic, then export
- **Styles**: Always in separate `styles.ts` file with theme integration

```typescript
// ✅ Good - React 19 component structure
interface MessageProps {
  message: Message;
  onEdit?: (id: string) => void;
  ref?: React.Ref<View>; // ref as regular prop in React 19
}

export function MessageComponent({ message, onEdit, ref }: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useTranslation();

  // React Compiler handles memoization automatically - no useCallback needed
  const handleEdit = () => {
    if (onEdit) onEdit(message.id);
    setIsEditing(true);
  };

  return (
    <View ref={ref} style={styles.container}>
      <Text style={styles.text}>{message.content}</Text>
      {onEdit && (
        <Pressable onPress={handleEdit}>
          <Text>{t('message.edit')}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.gap(2),
    backgroundColor: theme.colors.centerChannelBg,
  },
  text: {
    color: theme.colors.centerChannelColor,
  },
}));
```

### React 19 Compatibility and New Patterns

- **React Compiler Optimization**: Let React Compiler handle memoization, but understand its limitations
- **Modern Ref Patterns**: Use ref callbacks with cleanup and ref as props
- **New Hooks Integration**: Leverage useActionState, useOptimistic, and enhanced useTransition
- **Context Simplification**: Use Context directly without Provider wrapper

#### React 19 Specific Patterns

**✅ React Compiler Compatible Patterns**:

```typescript
// Compiler handles memoization automatically
function Component({ data }) {
  // No need for useMemo/useCallback in new code
  const processedData = data.map(item => processItem(item));
  const handleClick = () => setSelected(data.id);

  return <Child data={processedData} onClick={handleClick} />;
}

// Extract React Query mutations properly
function UserActions() {
  const { mutate: deleteUser } = useMutation(deleteUserMutation);

  const handleDelete = (id) => {
    deleteUser(id); // Compiler memoizes correctly
  };
}
```

**❌ Patterns That Break React Compiler**:

```typescript
// Don't do this - breaks memoization
function Component() {
  const mutation = useMutation(config);

  const handleAction = () => {
    mutation.mutate(data); // Compiler can't memoize this properly
  };
}
```

**Modern Form Handling**:

```typescript
function ContactForm() {
  const [result, submitAction, isPending] = useActionState(
    async (prevState, formData) => {
      const name = formData.get('name');
      const email = formData.get('email');

      // Validation and submission logic
      if (!name || !email) {
        return { error: 'Please fill all fields' };
      }

      await submitForm({ name, email });
      return { success: 'Form submitted successfully' };
    },
    null
  );

  return (
    <form action={submitAction}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
      {result?.error && <p>{result.error}</p>}
      {result?.success && <p>{result.success}</p>}
    </form>
  );
}
```

**Ref Callbacks with Cleanup**:

```typescript
function Component() {
  const refCallback = (node) => {
    if (!node) return;

    // Setup
    const observer = new IntersectionObserver(handleIntersection);
    observer.observe(node);

    // Cleanup function - called automatically
    return () => {
      observer.disconnect();
    };
  };

  return <div ref={refCallback}>Content</div>;
}
```

**Optimistic Updates**:

```typescript
function LikeButton({ post }) {
  const [likes, setLikes] = useState(post.likes);
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(likes);

  const handleLike = async () => {
    // Instant UI update
    setOptimisticLikes(optimisticLikes + 1);

    try {
      const newLikes = await likePost(post.id);
      setLikes(newLikes);
    } catch (error) {
      // Automatic rollback
      console.error('Like failed:', error);
    }
  };

  return (
    <button onClick={handleLike}>
      👍 {optimisticLikes}
    </button>
  );
}
```

```typescript
// ✅ Good - Let React Compiler optimize
function ExpensiveComponent({ data, onProcess }) {
  // React Compiler automatically memoizes this
  const processedData = data.map(item => expensiveCalculation(item));

  return <ProcessedView data={processedData} onProcess={onProcess} />;
}

// ❌ Bad - Manual memoization (React Compiler conflicts)
function ExpensiveComponent({ data, onProcess }) {
  const processedData = useMemo(
    () => data.map(item => expensiveCalculation(item)),
    [data]
  );

  return <ProcessedView data={processedData} onProcess={onProcess} />;
}
```

## Styling Standards (Unistyles)

### Theme Usage

- **Always use theme**: Access colors, spacing, fonts from theme object
- **Responsive Design**: Use breakpoints for cross-platform compatibility
- **Consistent Spacing**: Use `theme.gap()` function for spacing

```typescript
// ✅ Good - Theme-based styling
const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.centerChannelBg,
    padding: theme.gap(2), // 16px
    borderRadius: theme.radius.m,
    ...(theme.breakpoints.md && {
      padding: theme.gap(3), // 24px on medium screens+
    }),
  },
  text: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    color: theme.colors.centerChannelColor,
  },
}));

// ❌ Bad - Hardcoded values
const styles = StyleSheet.create(() => ({
  container: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
  },
  text: {
    fontFamily: "Arial",
    fontSize: 16,
    color: "#333333",
  },
}));
```

### Component Styling Patterns

- **Co-located Styles**: Define styles at component bottom
- **Conditional Styles**: Use theme breakpoints and conditions
- **Naming Convention**: Use descriptive style names

```typescript
const styles = StyleSheet.create((theme) => ({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.centerChannelBg,
  },

  // Layout styles
  header: {
    paddingVertical: theme.gap(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDefault,
  },

  // Content styles
  messageText: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.centerChannelColor,
  },

  // Interactive styles
  button: {
    backgroundColor: theme.colors.buttonBg,
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1.5),
    borderRadius: theme.radius.m,
  },

  buttonText: {
    color: theme.colors.buttonColor,
    fontWeight: theme.fontWeights.semiBold,
  },
}));
```

## Internationalization Standards

### Translation Usage

- **useTranslation Hook**: Use `useTranslation()` in components
- **Namespace Organization**: Group related translations logically
- **Key Naming**: Use descriptive, hierarchical keys

```typescript
// ✅ Good - Proper i18n usage
import { useTranslation } from 'react-i18next';

function SettingsModal() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('settings.modal.title')}</Text>
      <Text>{t('settings.modal.description')}</Text>
      <Button title={t('common.save')} onPress={handleSave} />
      <Button title={t('common.cancel')} onPress={handleCancel} />
    </View>
  );
}

// ❌ Bad - Hardcoded strings
function SettingsModal() {
  return (
    <View>
      <Text>Settings</Text>
      <Text>Configure your application settings</Text>
      <Button title="Save" onPress={handleSave} />
      <Button title="Cancel" onPress={handleCancel} />
    </View>
  );
}
```

### Translation Key Structure

```json
{
  "app": {
    "navigationManager": {
      "viewLimitReached": "View limit reached",
      "viewLimitReached.description": "You have reached the maximum number of open windows and tabs for this server."
    }
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading..."
  },
  "settings": {
    "modal": {
      "title": "Settings",
      "description": "Configure your application settings"
    }
  }
}
```

## Import Standards

### Import Order (ESLint Enforced)

1. **Built-in modules**: Node.js built-ins
2. **External modules**: npm packages
3. **Internal modules**: Project modules with path aliases
4. **Sibling modules**: Same directory
5. **Parent modules**: Parent directories

```typescript
// ✅ Good - Proper import order
import React, { useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";

import { UserService } from "@/services/UserService";
import { theme } from "@/theme";

import { MessageInput } from "./MessageInput";
import { MessageList } from "../MessageList";

// ❌ Bad - Mixed import order
import { MessageInput } from "./MessageInput";
import React, { useState } from "react";
import { UserService } from "@/services/UserService";
import { View, Text } from "react-native";
```

### Path Aliases

```typescript
// tsconfig.json paths configuration
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

## File Naming Conventions

### Component Files (Component-Per-Folder Structure)

- **Component Folders**: PascalCase (e.g., `Button/`, `MessageList/`, `UserProfile/`)
- **Main Components**: PascalCase matching folder name (e.g., `Button/Button.tsx`)
- **Sub-components**: PascalCase with descriptive names (e.g., `Button/ButtonIcon.tsx`)
- **Styles**: Always `styles.ts` (e.g., `Button/styles.ts`)
- **Tests**: Component name + `.spec.tsx` (e.g., `Button/Button.spec.tsx`)
- **Stories**: Component name + `.stories.tsx` (e.g., `Button/Button.stories.tsx`)
- **Types**: Always `types.ts` (e.g., `Button/types.ts`)
- **Barrel Export**: Always `index.ts` (e.g., `Button/index.ts`)

### Other Files

- **Hooks**: camelCase with "use" prefix (e.g., `useUserProfile.ts`)
- **Services**: PascalCase with "Service" suffix (e.g., `UserService.ts`)
- **Global Types**: PascalCase (e.g., `User.ts`, `ApiResponse.ts`)
- **Utilities**: camelCase with co-located tests (e.g., `formatDate.ts`, `formatDate.spec.ts`)

### Directory Structure (Component-Per-Folder Pattern)

Based on Stories 1.2 (Jest Testing) and 1.3 (Storybook Integration), each component should be organized in its own folder with co-located files:

```
src/
├── components/                    # Component-per-folder structure
│   ├── common/                   # Shared components
│   │   ├── Button/               # Button component folder
│   │   │   ├── Button.tsx        # Main component
│   │   │   ├── styles.ts         # Co-located Unistyles
│   │   │   ├── Button.spec.tsx   # Jest tests
│   │   │   ├── Button.stories.tsx # Storybook stories
│   │   │   ├── types.ts          # Component types
│   │   │   └── index.ts          # Barrel export
│   │   ├── Input/                # Input component folder
│   │   │   ├── Input.tsx         # Main component
│   │   │   ├── styles.ts         # Co-located Unistyles
│   │   │   ├── InputLabel.tsx    # Sub-component
│   │   │   ├── InputError.tsx    # Sub-component
│   │   │   ├── Input.spec.tsx    # Jest tests
│   │   │   ├── Input.stories.tsx # Storybook stories
│   │   │   ├── types.ts          # Component types
│   │   │   └── index.ts          # Barrel export
│   │   └── Modal/                # Modal component folder
│   │       ├── Modal.tsx         # Main component
│   │       ├── styles.ts         # Co-located Unistyles
│   │       ├── ModalHeader.tsx   # Sub-component
│   │       ├── ModalFooter.tsx   # Sub-component
│   │       ├── Modal.spec.tsx    # Jest tests
│   │       ├── Modal.stories.tsx # Storybook stories
│   │       ├── types.ts          # Component types
│   │       └── index.ts          # Barrel export
│   ├── chat/                     # Chat-specific components
│   │   ├── MessageList/          # Message list component folder
│   │   │   ├── MessageList.tsx   # Main component
│   │   │   ├── styles.ts         # Co-located Unistyles
│   │   │   ├── MessageItem.tsx   # Sub-component
│   │   │   ├── MessageList.spec.tsx # Jest tests
│   │   │   ├── MessageList.stories.tsx # Storybook stories
│   │   │   ├── types.ts          # Component types
│   │   │   └── index.ts          # Barrel export
│   │   └── MessageInput/         # Message input component folder
│   │       ├── MessageInput.tsx  # Main component
│   │       ├── styles.ts         # Co-located Unistyles
│   │       ├── MessageInput.spec.tsx # Jest tests
│   │       ├── MessageInput.stories.tsx # Storybook stories
│   │       ├── types.ts          # Component types
│   │       └── index.ts          # Barrel export
│   ├── forms/                    # Form-specific components
│   └── layout/                   # Layout components
├── services/                     # Business logic and API calls
├── hooks/                        # Custom React hooks
├── types/                        # Global TypeScript type definitions
├── utils/                        # Pure utility functions (with co-located .spec.ts)
│   ├── formatters.ts             # Utility functions
│   ├── formatters.spec.ts        # Co-located unit tests
│   ├── validators.ts             # Validation utilities
│   └── validators.spec.ts        # Co-located unit tests
├── constants/                    # App constants
├── locales/                      # Internationalization files
└── i18nextForTests.ts            # Test-specific i18n configuration
```

## Validation Standards

### Form Validation (Valibot)

- **Schema Definition**: Define validation schemas with Valibot
- **Type Safety**: Use schema types for TypeScript integration
- **Error Handling**: Provide clear validation error messages

```typescript
// ✅ Good - Valibot validation
import * as v from "valibot";

const UserSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2), v.maxLength(50)),
  email: v.pipe(v.string(), v.email()),
  age: v.pipe(v.number(), v.minValue(18), v.maxValue(120)),
});

type User = v.InferInput<typeof UserSchema>;

function validateUser(userData: unknown): User {
  return v.parse(UserSchema, userData);
}
```

## Testing Standards (Based on Story 1.2)

### Test Configuration Requirements

- **Jest Framework**: jest-expo preset with React Native Testing Library
- **TypeScript Support**: @types/jest for proper type definitions
- **Unistyles Integration**: react-native-unistyles/mocks + actual theme configuration
- **i18n Integration**: Real i18next configuration without stubbing
- **Router Testing**: expo-router/testing-library for navigation tests

### Test File Organization

- **Component Tests**: Co-located `.spec.tsx` files alongside components
- **Unit Tests**: Co-located `.spec.ts` files alongside utilities
- **Router Tests**: Must be in `__tests__/` directory (NOT in `app/` directory)
- **Integration Tests**: In `__tests__/integration/` directory
- **E2E Tests**: In `__tests__/e2e/` directory

### Component Test Pattern

```typescript
// Button/Button.spec.tsx - Component test with theme and i18n
import { render, fireEvent } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18nextForTests';
import { Button } from './Button';

// Test wrapper for i18n (Unistyles handled by Jest setup)
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

describe('<Button />', () => {
  it('should render translated button text correctly', () => {
    const { getByText } = render(
      <TestWrapper>
        <Button titleKey="common.save" onPress={() => {}} />
      </TestWrapper>
    );
    getByText('Save'); // Tests actual translation
  });

  it('should call onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <Button titleKey="common.save" onPress={onPressMock} />
      </TestWrapper>
    );

    fireEvent.press(getByText('Save'));
    expect(onPressMock).toHaveBeenCalled();
  });

  it('should handle disabled state correctly', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <Button titleKey="common.save" onPress={onPressMock} disabled />
      </TestWrapper>
    );

    fireEvent.press(getByText('Save'));
    expect(onPressMock).not.toHaveBeenCalled(); // Test behavior, not styles
  });
});
```

### Unit Test Pattern

```typescript
// utils/formatters.spec.ts - Co-located unit test
import { formatDate, formatMessage } from "./formatters";

describe("formatters", () => {
  describe("formatDate", () => {
    it("should format date correctly", () => {
      const date = new Date("2023-10-20");
      const result = formatDate(date);
      expect(result).toBe("Oct 20, 2023");
    });
  });

  describe("formatMessage", () => {
    it("should truncate long messages", () => {
      const longMessage =
        "This is a very long message that should be truncated";
      const result = formatMessage(longMessage, 20);
      expect(result).toBe("This is a very long...");
    });
  });
});
```

### Router Test Pattern

```typescript
// __tests__/navigation.test.tsx - Router tests (MUST be in __tests__, not app/)
import { renderRouter, screen } from 'expo-router/testing-library';
import { View, Text } from 'react-native';

// Mock components for testing
const MockIndexComponent = () => <Text>Home Screen</Text>;
const MockProfileComponent = () => <Text>Profile Screen</Text>;

describe('Expo Router Navigation', () => {
  it('should navigate to correct route', async () => {
    renderRouter(
      {
        index: MockIndexComponent,
        'profile': MockProfileComponent,
      },
      {
        initialUrl: '/profile',
      }
    );

    expect(screen).toHavePathname('/profile');
    expect(screen.getByText('Profile Screen')).toBeTruthy();
  });

  it('should handle route parameters', async () => {
    const MockUserComponent = () => <Text>User Details</Text>;

    renderRouter(
      {
        'user/[id]': MockUserComponent,
      },
      {
        initialUrl: '/user/123',
      }
    );

    expect(screen).toHavePathname('/user/123');
    expect(screen).toHaveSegments(['user', '[id]']);
  });
});
```

### Jest Configuration (package.json)

```json
{
  "scripts": {
    "test": "jest --watchAll",
    "test:ci": "jest"
  },
  "jest": {
    "preset": "jest-expo",
    "setupFiles": ["react-native-unistyles/mocks", "./src/theme.ts"],
    "transformIgnorePatterns": [
      "node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg))"
    ],
    "collectCoverage": true,
    "collectCoverageFrom": [
      "**/*.{ts,tsx,js,jsx}",
      "!**/coverage/**",
      "!**/node_modules/**",
      "!**/babel.config.js",
      "!**/expo-env.d.ts",
      "!**/.expo/**"
    ]
  }
}
```

### Testing Focus Guidelines

- ✅ **Do test**: Component rendering, user interactions, accessibility, business logic
- ✅ **Do test**: Translation key usage with actual translations
- ✅ **Do test**: Component behavior and state changes
- ❌ **Don't test**: Style parsing, specific CSS values, visual appearance
- ❌ **Don't test**: Theme system internals (use E2E for visual verification)

## Storybook Standards (Based on Story 1.3)

### Storybook Configuration

- **Framework**: @storybook/react-native for React Native components
- **Environment Control**: Only accessible when `EXPO_PUBLIC_ENVIRONMENT='storybook'`
- **Route Integration**: `/storybook` route accessible within the app during development
- **Metro Integration**: withStorybook wrapper for proper bundling

### Story File Organization

- **Location**: Co-located `.stories.tsx` files alongside components
- **Naming**: `ComponentName.stories.tsx` suffix
- **Structure**: Meta configuration with multiple story variations

### Component Story Pattern

```typescript
// Button/Button.stories.tsx - Storybook stories
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    titleKey: 'common.save',
    variant: 'primary',
    onPress: () => console.log('Primary clicked'),
  },
};

export const Secondary: Story = {
  args: {
    titleKey: 'common.cancel',
    variant: 'secondary',
    onPress: () => console.log('Secondary clicked'),
  },
};

export const Disabled: Story = {
  args: {
    titleKey: 'common.save',
    variant: 'primary',
    disabled: true,
    onPress: () => console.log('Should not fire'),
  },
};

export const Loading: Story = {
  args: {
    titleKey: 'common.loading',
    variant: 'primary',
    isLoading: true,
    onPress: () => console.log('Loading state'),
  },
};
```

### Story Organization Guidelines

- **Title Structure**: Use hierarchical naming (e.g., `Common/Button`, `Chat/MessageList`)
- **Multiple Variations**: Create stories for different states (normal, error, disabled, loading)
- **Decorators**: Use decorators for consistent spacing and theme context
- **Args**: Use args for interactive controls in Storybook UI
- **Actions**: Use console.log or Storybook actions for interaction testing

### Storybook Development Workflow

```bash
# Start app in storybook mode
pnpm storybook

# Access storybook within the app
# Navigate to /storybook route when EXPO_PUBLIC_ENVIRONMENT='storybook'

# Regular development (storybook not accessible)
pnpm start
```

### Environment Configuration

```bash
# .env.local - Enable storybook access
EXPO_PUBLIC_ENVIRONMENT=storybook

# package.json scripts
{
  "scripts": {
    "start": "expo start",
    "storybook": "EXPO_PUBLIC_ENVIRONMENT='storybook' expo start"
  }
}
```

## Performance Standards

### React Compiler Optimization

- **Trust the Compiler**: Avoid manual memoization patterns
- **Follow React Rules**: Ensure components follow React rules for optimization
- **Component Splitting**: Split large components for better compilation

### Bundle Optimization

- **Dynamic Imports**: Use dynamic imports for code splitting
- **Tree Shaking**: Ensure unused code is eliminated
- **Asset Optimization**: Optimize images and static assets

## Error Handling Standards

### Error Boundaries

```typescript
// ErrorBoundary.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View>
          <Text>Something went wrong.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
```

## Migration-Specific Standards

### React 17 to React 19 Migration Rules

Based on the comprehensive React Compiler documentation, here are the essential migration patterns and rules for upgrading from React 17 to React 19:

#### 1. React Compiler Automatic Memoization

**Key Insight**: React Compiler automatically memoizes components, but it's not a silver bullet. Real-world tests show effectiveness in only ~20% of cases.

**Before (React 17 - Manual Memoization)**:

```typescript
const VerySlowComponentMemo = React.memo(VerySlowComponent);

const SimpleCase = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Manual memoization required
  const onSubmit = useCallback(() => {}, []);
  const data = useMemo(() => [{ id: "bla" }], []);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>toggle dialog</button>
      <VerySlowComponentMemo onSubmit={onSubmit} data={data} />
    </div>
  );
};
```

**After (React 19 - Compiler Handles Memoization)**:

```typescript
// Compiler automatically memoizes everything
const SimpleCase = () => {
  const [isOpen, setIsOpen] = useState(false);

  // No longer need useMemo and useCallback
  const onSubmit = () => {};
  const data = [{ id: "bla" }];

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>toggle dialog</button>
      <VerySlowComponent onSubmit={onSubmit} data={data} />
    </div>
  );
};
```

**Critical Rule for React Query**: Extract `mutate` directly to avoid memoization issues:

```typescript
// ❌ Problematic - compiler doesn't memoize correctly
const Countries = () => {
  const deleteCountryMutation = useMutation({...});

  const onDelete = (name) => {
    deleteCountryMutation.mutate(name); // This breaks memoization
  };
};

// ✅ Fixed - extract mutate directly
const Countries = () => {
  const { mutate: deleteCountry } = useMutation({...});

  const onDelete = (name) => {
    deleteCountry(name); // Now compiler memoizes correctly
  };
};
```

#### 2. Form Handling with useActionState

**Before (React 17 - Complex State Management)**:

```typescript
const NewsletterSubscribe = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email) {
      setResult({
        type: "error",
        message: "Please fill in your name and email.",
      });
      return;
    }

    setIsPending(true);
    fakeSendEmail().then(() => {
      setResult({ type: "success", message: "Successfully subscribed!" });
      setName("");
      setEmail("");
      setIsPending(false);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Subscribe</button>
    </form>
  );
};
```

**After (React 19 - useActionState)**:

```typescript
const NewsletterSubscribe = () => {
  const [result, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const email = formData.get("email");
      const name = formData.get("name");

      if (!name || !email) {
        return {
          type: "error",
          message: "Please fill in your name and email.",
        };
      }

      await fakeSendEmail();

      return {
        type: "success",
        message: "Successfully subscribed!",
      };
    },
    null,
  );

  // Uncontrolled inputs, automatic cleanup
  return (
    <form action={submitAction}>
      <input type="text" name="name" />
      <input type="email" name="email" />
      <button type="submit" disabled={isPending}>Subscribe</button>
    </form>
  );
};
```

**What Disappears**: `e.preventDefault()`, controlled inputs, 4 `useState` calls, manual form cleanup, manual `isPending` management.

#### 3. Ref Callbacks with Cleanup

**Before (React 17 - useEffect for DOM Operations)**:

```typescript
function ScrollTracker() {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;

    const handleScroll = () => {
      console.log("Scrolling...");
    };

    scrollRef.current.addEventListener("scroll", handleScroll);

    return () => {
      scrollRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div ref={scrollRef} style={{ overflow: "scroll", height: "100px" }}>
      <div style={{ height: "300px" }}>Scroll Me</div>
    </div>
  );
}
```

**After (React 19 - Ref Callbacks with Cleanup)**:

```typescript
function ScrollTracker() {
  const refCallback = (node) => {
    if (!node) return;

    const handleScroll = () => {
      console.log("Scrolling...");
    };

    node.addEventListener("scroll", handleScroll);

    // Cleanup automatically called on unmount
    return () => {
      node.removeEventListener("scroll", handleScroll);
      console.log("Removed scroll listener");
    };
  };

  return (
    <div ref={refCallback} style={{ overflow: "scroll", height: "100px" }}>
      <div style={{ height: "300px" }}>Scroll Me</div>
    </div>
  );
}
```

#### 4. PropTypes and defaultProps Removal

**Before (React 17)**:

```typescript
import PropTypes from "prop-types";

function Heading({ text }) {
  return <h1>{text}</h1>;
}

Heading.propTypes = {
  text: PropTypes.string,
};

Heading.defaultProps = {
  text: "Hello, world!",
};
```

**After (React 19)**:

```typescript
interface Props {
  text?: string;
}

function Heading({ text = 'Hello, world!' }: Props) {
  return <h1>{text}</h1>;
}
```

#### 5. Ref as Props - No More forwardRef

**Before (React 17)**:

```typescript
import { forwardRef } from "react";

const MyInput = forwardRef(function MyInput(props, ref) {
  return (
    <label>
      {props.label}
      <input ref={ref} />
    </label>
  );
});
```

**After (React 19)**:

```typescript
// ref is now a regular prop
function MyInput({ label, ref }) {
  return (
    <label>
      {label}
      <input ref={ref} />
    </label>
  );
}
```

#### 6. Context without Provider

**Before (React 17)**:

```typescript
const ThemeContext = createContext("light");

function App() {
  const [theme, setTheme] = useState("dark");

  return (
    <ThemeContext.Provider value={theme}>
      <Page />
    </ThemeContext.Provider>
  );
}

function Page() {
  const theme = useContext(ThemeContext);
  return <div className={`theme-${theme}`}>Content</div>;
}
```

**After (React 19)**:

```typescript
const ThemeContext = createContext("light");

function App() {
  const [theme, setTheme] = useState("dark");

  // Render Context directly, without .Provider
  return (
    <ThemeContext value={theme}>
      <Page />
    </ThemeContext>
  );
}

function Page() {
  // use() instead of useContext - works in if/for
  const theme = use(ThemeContext);
  return <div className={`theme-${theme}`}>Content</div>;
}
```

#### 7. Document Metadata - Built-in SEO

**Before (React 17 + React Helmet)**:

```typescript
import { Helmet } from "react-helmet";

function ProductPage({ product }) {
  return (
    <>
      <Helmet>
        <title>{product.name} - MyShop</title>
        <meta name="description" content={product.description} />
        <meta name="keywords" content={product.keywords} />
      </Helmet>

      <div className="product">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
      </div>
    </>
  );
}
```

**After (React 19)**:

```typescript
// No imports, no wrapper components
function ProductPage({ product }) {
  return (
    <div className="product">
      <title>{product.name} - MyShop</title>
      <meta name="description" content={product.description} />
      <meta name="keywords" content={product.keywords} />

      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}
```

### Migration Strategy for React 17 → 19

#### Phase 1: Prepare for React Compiler

1. **Fix Rules of React violations** using `eslint-plugin-react-compiler`
2. **Remove manual memoization** in new code (keep existing `useMemo`/`useCallback` temporarily)
3. **Extract React Query mutations** properly: `const { mutate } = useMutation()`

#### Phase 2: Update Component Patterns

1. **Replace forwardRef** with regular ref props
2. **Convert PropTypes** to TypeScript interfaces with default parameters
3. **Update Context usage** to direct rendering and `use()` hook

#### Phase 3: Form and State Management

1. **Migrate complex forms** to `useActionState`
2. **Replace useEffect for DOM operations** with ref callbacks
3. **Implement optimistic updates** with `useOptimistic`

#### Phase 4: Performance and SEO

1. **Remove React Helmet** and use native metadata tags
2. **Use useTransition** for async operations and heavy computations
3. **Test React Compiler** effectiveness and keep manual memoization where needed

### Critical Migration Warnings

#### React Compiler Limitations

- **Only ~20% effective** in real-world applications
- **Requires proper React Query destructuring**
- **Still need to understand memoization** better than before
- **Must follow Rules of React** strictly

#### use() Hook Limitations

- **Requires Suspense + ErrorBoundary** for every promise
- **Promises must be stable** (not recreated on every render)
- **For dynamic queries**, React Query is still preferred

#### Breaking Changes

- **PropTypes removed** for functional components
- **defaultProps removed** for functional components
- **React Helmet abandoned** since 2020 (security vulnerabilities)

### Component Migration Pattern

1. **Analyze Legacy**: Understand existing SCSS and react-intl usage
2. **Plan React 19 Updates**: Identify forwardRef, PropTypes, and manual memoization usage
3. **Update TypeScript**: Replace PropTypes with proper interfaces
4. **Update Imports**: Replace react-intl with react-i18next
5. **Style Conversion**: Convert SCSS to Unistyles
6. **Test React Compiler**: Verify memoization works correctly
7. **Test Functionality**: Verify component works in Tauri environment

### SCSS to Unistyles Migration

```scss
/* Legacy SCSS */
.message-container {
  background-color: var(--center-channel-bg);
  padding: 16px;
  border-radius: 8px;

  .message-text {
    color: var(--center-channel-color);
    font-family: "Open Sans", sans-serif;
  }
}
```

```typescript
// Modern Unistyles
const styles = StyleSheet.create((theme) => ({
  messageContainer: {
    backgroundColor: theme.colors.centerChannelBg,
    padding: theme.gap(2),
    borderRadius: theme.radius.m,
  },
  messageText: {
    color: theme.colors.centerChannelColor,
    fontFamily: theme.fonts.primary,
  },
}));
```

## Code Review Standards

### Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] Theme usage instead of hardcoded values
- [ ] Proper i18n key usage
- [ ] Import order follows ESLint rules
- [ ] Component follows React 19 patterns
- [ ] Tests included for new functionality
- [ ] Performance considerations addressed
- [ ] Error handling implemented

### Review Focus Areas

1. **Type Safety**: Ensure proper TypeScript usage
2. **Theme Consistency**: Verify theme system usage
3. **Internationalization**: Check for hardcoded strings
4. **Performance**: Review for optimization opportunities
5. **Cross-Platform**: Ensure compatibility across platforms

---

**Last Updated**: 2025-10-19  
**Version**: 1.0  
**Applies To**: Mattermost Platform Migration (apps/v2)

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
- **Standards**: React 19 + TypeScript + Unistyles 3.0 + Expo Router patterns
- **Architecture**: React Compiler + Unistyles C++ optimization for zero re-renders

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

### Type Safety and Naming Conventions

- **No `any` types**: Use proper TypeScript types
- **Type over interface**: Prefer `type` for all type definitions (consistency and flexibility)
- **'I' Prefix for Types**: All custom types must use 'I' prefix (e.g., `IUser`, `ILanguage`, `IButtonProps`)
- **Generics**: Use generics for reusable components

```typescript
// ✅ Good - Proper typing with 'I' prefix and 'type'
type IProps = {
  user: IUser;
  onSelect: (userId: string) => void;
};

type IUser = {
  id: string;
  name: string;
  email: string;
};

function UserComponent({ user, onSelect }: IProps) {
  return <Text onPress={() => onSelect(user.id)}>{user.name}</Text>;
}

// ❌ Bad - Any types
function UserComponent({ user, onSelect }: any) {
  return <Text onPress={() => onSelect(user.id)}>{user.name}</Text>;
}

// ❌ Bad - No 'I' prefix and using interface
interface UserProps {
  user: User;
  onSelect: (userId: string) => void;
}

// ❌ Bad - Too specific name for internal props
type IUserComponentProps = {
  user: IUser;
  onSelect: (userId: string) => void;
}
```

## React Standards

### Component Structure (Component-Per-Folder Pattern)

Each component should follow the component-per-folder structure based on Stories 1.2 and 1.3:

#### Required Files in Each Component Folder:

1. **`ComponentName.tsx`** - Main React component implementation (includes types, styles, component logic)
2. **`ComponentName.spec.tsx`** - Jest tests using React Native Testing Library
3. **`index.ts`** - Barrel export for external consumption

#### Optional Files (when applicable):

4. **`LocalSubComponent.tsx`** - Sub-components specific to this component
5. **`ComponentName.stories.tsx`** - Storybook stories demonstrating component states

#### Co-location Principle

**Core Rule**: Types and styles should be as close to their source as possible - **keep everything in the component file**.

- **All types**: Define directly in the component file using generic `IProps` for internal types
- **Exported types**: Export directly from the component file when needed by other components
- **Styles**: Define at the bottom of the component file using `StyleSheet.create()`
- **No separate files**: Don't create separate `styles.ts` or `types.ts` files unless absolutely necessary
- **Single source of truth**: Each component file contains its types, styles, and logic

#### Export Conventions

- **Components**: Use **named exports** (e.g., `export function Button()`)
- **Pages**: Use **default exports** (required for expo-router)
- **Types**: Export from component file when shared (e.g., `export type IButtonProps`)

This approach ensures maximum co-location, reduces file proliferation, and makes components completely self-contained.

#### Component Implementation Standards:

- **Functional Components**: Use function declarations with explicit types
- **Named Exports**: Use named exports for components (not default)
- **Hooks Order**: useState, useEffect, custom hooks, then callbacks
- **File Organization**: Types, component logic, styles, then export
- **Complete Co-location**: Types, styles, and logic all in the same file

```typescript
// ✅ Good - Complete co-location with proper export conventions

// Types defined at the top of the component file
type IProps = {
  message: IMessage;
  onEdit?: (id: string) => void;
  ref?: React.Ref<View>; // ref as regular prop in React 19
};

type IMessage = {
  id: string;
  content: string;
  userId: string;
  timestamp: Date;
};

// Export types that other components might need
export type { IMessage }; // Available for other components

// Component implementation
export function MessageComponent({ message, onEdit, ref }: IProps) {
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
          <Text>{t('renderer.components.message.edit')}</Text>
        </Pressable>
      )}
    </View>
  );
}

// Styles defined at the bottom of the component file
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

#### Page Implementation Standards (Expo Router):

```typescript
// ✅ Good - Page with default export for expo-router

// Types defined at the top
type IPageProps = {
  // Page-specific props if any
};

// Page component (default export required for expo-router)
export default function SettingsPage({ }: IPageProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('renderer.components.settingsPage.header')}</Text>
      {/* Page content */}
    </View>
  );
}

// Styles co-located in the same file
const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.centerChannelBg,
  },
  title: {
    fontSize: 24,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.centerChannelColor,
  },
}));
```

### React 19 + Unistyles 3.0 Integration

- **React Compiler + Unistyles**: No manual memoization needed - React Compiler and Unistyles C++ optimize automatically
- **Modern Ref Patterns**: Use ref as props in React 19 (no forwardRef needed)
- **No Re-render Architecture**: Unistyles updates styles via C++ ShadowTree without React re-renders
- **Automatic Style Optimization**: Variants and theme changes handled without component updates

#### React 19 + Unistyles 3.0 Integration Patterns

**✅ Perfect React 19 + Unistyles Component**:

```typescript
import React from "react";
import { Pressable, Text } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

// Types with Unistyles variants integration
type IProps = {
  titleKey: string;
  onPress: () => void;
  ref?: React.Ref<React.ComponentRef<typeof Pressable>>; // React 19 ref as prop
} & IButtonVariant;

type IButtonVariant = UnistylesVariants<typeof styles>;

// Export types for other components
export type IButtonProps = IProps;
export type { IButtonVariant };

// Component with React 19 + Unistyles best practices
export function Button({
  titleKey,
  type = "primary",
  onPress,
  ref, // React 19: ref as regular prop
  ...etc
}: IProps) {
  const { t } = useTranslation();

  // React Compiler optimizes automatically - no useCallback needed
  const handlePress = () => {
    if (!etc.disabled && onPress) {
      onPress();
    }
  };

  // Unistyles variants - no re-renders, pure C++ updates
  styles.useVariants({ type });

  return (
    <Pressable
      ref={ref}           // React 19: Direct ref usage
      style={styles.button}  // Unistyles: Auto-optimized styles
      onPress={handlePress}   // React Compiler: Auto-memoized
      disabled={etc.disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: etc.disabled }}
    >
      <Text style={styles.text}>{t(titleKey)}</Text>
    </Pressable>
  );
}

// Unistyles 3.0: Co-located styles with variants
const styles = StyleSheet.create((theme) => ({
  button: {
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1.5),
    borderRadius: theme.radius.m,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44, // Accessibility requirement
    variants: {
      type: {
        primary: { backgroundColor: theme.colors.buttonBg },
        secondary: { backgroundColor: theme.colors.centerChannelBg },
      },
    },
  },
  text: {
    fontWeight: theme.fontWeights.semiBold,
    fontSize: 16,
    variants: {
      type: {
        primary: { color: theme.colors.buttonColor },
        secondary: { color: theme.colors.centerChannelColor },
      },
    },
  },
}));
```

**✅ React Query + React Compiler + Unistyles Integration**:

```typescript
function UserActions() {
  // Extract mutate properly for React Compiler
  const { mutate: deleteUser } = useMutation(deleteUserMutation);

  // React Compiler + Unistyles: No manual optimization needed
  const handleDelete = (id: string) => {
    deleteUser(id); // React Compiler memoizes correctly
  };

  // Unistyles handles theme updates without re-renders
  return (
    <Pressable style={styles.deleteButton} onPress={() => handleDelete(user.id)}>
      <Text style={styles.deleteText}>{t('common.delete')}</Text>
    </Pressable>
  );
}

// Unistyles: Automatic theme updates without React re-renders
const styles = StyleSheet.create((theme) => ({
  deleteButton: {
    backgroundColor: theme.colors.errorBg,
    padding: theme.gap(2),
    borderRadius: theme.radius.m,
  },
  deleteText: {
    color: theme.colors.errorText,
    fontWeight: theme.fontWeights.semiBold,
  },
}));
```

**❌ Anti-patterns to Avoid**:

```typescript
// Don't do this - breaks React Compiler + Unistyles optimization
function Component() {
  const mutation = useMutation(config);
  const { theme } = useUnistyles(); // Causes re-renders

  const handleAction = () => {
    mutation.mutate(data); // Compiler can't memoize this properly
  };

  // Manual theme access - defeats Unistyles optimization
  return (
    <View style={{ backgroundColor: theme.colors.bg }}>
      <Text style={{ color: theme.colors.text }}>Content</Text>
    </View>
  );
}
```

**Modern Form Handling**:

```typescript
type IProps = {
  onSuccess?: () => void;
};

function ContactForm({ onSuccess }: IProps) {
  const [result, submitAction, isPending] = useActionState(
    async (prevState, formData) => {
      const name = formData.get('name');
      const email = formData.get('email');

      // Validation and submission logic
      if (!name || !email) {
        return { error: 'Please fill all fields' };
      }

      await submitForm({ name, email });
      onSuccess?.();
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

## Styling Standards (Unistyles 3.0)

### Core Principles

- **Co-located Styles**: Always define styles at the bottom of the component file
- **Theme-driven Design**: Use theme object for all colors, spacing, and typography
- **Variants System**: Leverage Unistyles variants for component states
- **Performance**: Styles auto-update without re-renders via C++ ShadowTree integration
- **Accessibility**: Include minimum touch targets and proper ARIA attributes

### Unistyles 3.0 Component Pattern

Based on your Button component, here's the complete pattern for component styling:

```typescript
// Button.tsx - Complete Unistyles 3.0 pattern
import React from "react";
import { Pressable, Text } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

// Types defined at the top of the component file
type IProps = {
  titleKey: string;
  onPress: () => void;
  ref?: React.Ref<React.ComponentRef<typeof Pressable>>; // ref as regular prop in React 19
} & IButtonVariant;

type IButtonVariant = UnistylesVariants<typeof styles>;

// Export types that other components need
export type IButtonProps = IProps & UnistylesVariants<typeof styles>;
export type { IButtonVariant };

// Component implementation with named export
export function Button({
  titleKey,
  type = "primary",
  onPress,
  ref,
  ...etc
}: IProps) {
  const { t } = useTranslation();

  // Boolean variants can be strings - compute them properly
  const disabled =
    typeof etc.disabled === "boolean" ? etc.disabled : etc.disabled === "true";

  // React Compiler handles memoization automatically - no useCallback needed
  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  // Configure variants - boolean variants need computation
  styles.useVariants({
    type,
    disabled, // Computed boolean (true/false)
  });

  return (
    <Pressable
      ref={ref}
      style={styles.button}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={styles.text}>{t(titleKey)}</Text>
    </Pressable>
  );
}

// Styles defined at the bottom of the component file
const styles = StyleSheet.create((theme) => ({
  button: {
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1.5),
    borderRadius: theme.radius.m,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44, // Accessibility minimum touch target
    variants: {
      type: {
        primary: {
          backgroundColor: theme.colors.buttonBg,
        },
        secondary: {
          backgroundColor: theme.colors.centerChannelBg,
          borderWidth: 1,
          borderColor: theme.colors.borderDefault,
        },
        danger: {
          backgroundColor: theme.colors.errorText,
        },
      },
      // Boolean variants: handle both boolean and string values
      disabled: {
        true: { opacity: 0.6 },
        false: { opacity: 1.0 },
        // Can also be specified as strings: "true" | "false"
        default: { opacity: 1.0 }, // Default variant when no disabled prop
      },
    },
  },
  text: {
    fontWeight: theme.fontWeights.semiBold,
    fontSize: 16,
    variants: {
      type: {
        primary: {
          color: theme.colors.buttonColor,
        },
        secondary: {
          color: theme.colors.centerChannelColor,
        },
        danger: {
          color: theme.colors.neutral0,
        },
      },
      disabled: {
        true: { color: theme.colors.textDisabled },
        false: {}, // Use type variant color
        // Optional: can skip false and let type variants handle it
      },
    },
  },
}));
```

### Unistyles 3.0 Key Features

#### 1. Variants System

Use variants for component states instead of conditional styling:

**Basic Variants:**

```typescript
// ✅ Good - Unistyles variants (automatic optimization)
const styles = StyleSheet.create((theme) => ({
  button: {
    padding: theme.gap(2),
    variants: {
      size: {
        small: { padding: theme.gap(1) },
        medium: { padding: theme.gap(2) },
        large: { padding: theme.gap(3) },
      },
      variant: {
        primary: { backgroundColor: theme.colors.primary },
        secondary: { backgroundColor: theme.colors.secondary },
      },
    },
  },
}));

// Configure variants in component
styles.useVariants({ size: "medium", variant: "primary" });
```

**Multi-Style Variants (TypeScript Consistency):**

**CRITICAL**: When using the same variant across multiple styles, you must include ALL variant options in each style to avoid TypeScript errors. Use empty objects `{}` for variants that don't need styling.

```typescript
// ✅ Correct - All variant options in each style for proper TypeScript
const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    variants: {
      size: {
        small: { width: 100, height: 100 },
        medium: { width: 200, height: 200 },
        large: { width: 300, height: 300 },
      },
    },
  },
  text: {
    fontWeight: "bold",
    variants: {
      size: {
        small: { fontSize: 12 },
        medium: { fontSize: 16 },
        large: { fontSize: 20 },
      },
    },
  },
  icon: {
    variants: {
      size: {
        small: { width: 16, height: 16 },
        medium: {}, // Empty object - no specific styles for medium
        large: { width: 32, height: 32 },
      },
    },
  },
}));

// ❌ Wrong - Missing variant options causes TypeScript errors
const badStyles = StyleSheet.create((theme) => ({
  container: {
    variants: {
      size: {
        small: { width: 100 },
        medium: { width: 200 },
        large: { width: 300 },
      },
    },
  },
  text: {
    variants: {
      size: {
        small: { fontSize: 12 },
        // Missing medium and large - breaks TypeScript!
      },
    },
  },
}));
// TypeScript error: size: ('small' | 'medium' | 'large') | ('small')
```

**Practical Pattern for Complex Components:**

```typescript
// Define all possible variant values consistently
const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.gap(2),
    variants: {
      size: {
        small: { padding: theme.gap(1) },
        medium: { padding: theme.gap(2) },
        large: { padding: theme.gap(3) },
      },
      variant: {
        primary: { backgroundColor: theme.colors.primary },
        secondary: { backgroundColor: theme.colors.secondary },
        danger: { backgroundColor: theme.colors.error },
      },
    },
  },
  text: {
    fontWeight: theme.fontWeights.semiBold,
    variants: {
      size: {
        small: { fontSize: 12 },
        medium: { fontSize: 16 },
        large: { fontSize: 20 },
      },
      variant: {
        primary: { color: theme.colors.white },
        secondary: { color: theme.colors.text },
        danger: { color: theme.colors.white },
      },
    },
  },
  icon: {
    variants: {
      size: {
        small: { width: 16, height: 16 },
        medium: { width: 20, height: 20 },
        large: {}, // No specific icon sizing for large
      },
      variant: {
        primary: {}, // Uses default icon color
        secondary: { opacity: 0.8 },
        danger: {}, // Uses default icon color
      },
    },
  },
}));

// All variants properly typed: size: 'small' | 'medium' | 'large'
// Usage: styles.useVariants({ size: 'medium', variant: 'primary' });
```

**Compound Variants (Advanced Styling):**

Compound variants allow applying additional styles when specific combinations of variants are met. This eliminates complex conditional logic and provides clean, declarative styling.

```typescript
// ✅ Good - Compound variants for complex styling combinations
const styles = StyleSheet.create((theme) => ({
  button: {
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1.5),
    borderRadius: theme.radius.m,
    variants: {
      size: {
        small: {
          paddingHorizontal: theme.gap(2),
          paddingVertical: theme.gap(1),
        },
        medium: {
          paddingHorizontal: theme.gap(3),
          paddingVertical: theme.gap(1.5),
        },
        large: {
          paddingHorizontal: theme.gap(4),
          paddingVertical: theme.gap(2),
        },
      },
      variant: {
        primary: { backgroundColor: theme.colors.buttonBg },
        secondary: { backgroundColor: theme.colors.centerChannelBg },
        danger: { backgroundColor: theme.colors.errorBg },
      },
      loading: {
        true: { opacity: 0.7 },
        false: {},
        default: {},
      },
    },
    // Compound variants - apply when multiple conditions are met
    compoundVariants: [
      {
        variant: "primary",
        loading: true,
        // Apply these styles when button is primary AND loading
        styles: {
          backgroundColor: theme.colors.buttonBgLoading,
          transform: [{ scale: 0.98 }],
        },
      },
      {
        size: "large",
        variant: "danger",
        // Apply these styles when button is large AND danger
        styles: {
          borderWidth: 2,
          borderColor: theme.colors.errorBorder,
          shadowColor: theme.colors.errorShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
      },
      {
        variant: "secondary",
        loading: false,
        // Apply these styles when secondary AND explicitly not loading
        styles: {
          borderWidth: 1,
          borderColor: theme.colors.borderDefault,
        },
      },
    ],
  },
  text: {
    fontWeight: theme.fontWeights.semiBold,
    variants: {
      size: {
        small: { fontSize: 12 },
        medium: { fontSize: 16 },
        large: { fontSize: 20 },
      },
      variant: {
        primary: { color: theme.colors.buttonColor },
        secondary: { color: theme.colors.centerChannelColor },
        danger: { color: theme.colors.errorText },
      },
      loading: {
        true: {},
        false: {},
        default: {},
      },
    },
    compoundVariants: [
      {
        variant: "secondary",
        size: "large",
        // Large secondary buttons get special text treatment
        styles: {
          fontWeight: theme.fontWeights.bold,
          letterSpacing: 0.5,
        },
      },
      {
        variant: "danger",
        loading: true,
        // Danger buttons when loading show different text color
        styles: {
          color: theme.colors.errorTextLoading,
        },
      },
    ],
  },
}));

// Usage - compound variants automatically apply based on combinations
styles.useVariants({
  size: "large",
  variant: "danger",
  loading: false,
});
// This will apply large + danger compound variant styles
```

**Real-world Typography Example:**

```typescript
const styles = StyleSheet.create((theme) => ({
  text: {
    fontFamily: theme.fonts.base,
    variants: {
      size: {
        small: { fontSize: 12 },
        medium: { fontSize: 16 },
        large: { fontSize: 20 },
      },
      weight: {
        normal: { fontWeight: theme.fontWeights.normal },
        bold: { fontWeight: theme.fontWeights.bold },
      },
      color: {
        primary: { color: theme.colors.primary },
        secondary: { color: theme.colors.secondary },
        link: { color: theme.colors.link },
        error: { color: theme.colors.errorText },
      },
      emphasis: {
        true: { fontStyle: "italic" },
        false: {},
        default: {},
      },
    },
    compoundVariants: [
      {
        weight: "bold",
        color: "link",
        // Bold links get underline
        styles: {
          textDecorationLine: "underline",
        },
      },
      {
        size: "large",
        weight: "bold",
        color: "primary",
        // Large bold primary text gets special treatment
        styles: {
          letterSpacing: 1,
          textTransform: "uppercase",
        },
      },
      {
        color: "error",
        emphasis: true,
        // Emphasized error text gets background
        styles: {
          backgroundColor: theme.colors.errorBg,
          paddingHorizontal: theme.gap(1),
          borderRadius: theme.radius.s,
        },
      },
    ],
  },
}));

// ❌ Bad - Complex conditional logic instead of compound variants
const getTextStyle = (size, weight, color, emphasis) => [
  styles.text,
  weight === "bold" && color === "link" && styles.boldLink,
  size === "large" &&
    weight === "bold" &&
    color === "primary" &&
    styles.largeBoldPrimary,
  color === "error" && emphasis && styles.emphasizedError,
  // This gets unwieldy quickly...
];
```

**Compound Variants Best Practices:**

1. **Order Matters**: Compound variants take precedence over regular variants
2. **Specific Combinations**: Use for specific styling combinations that can't be achieved with regular variants
3. **Performance**: More efficient than conditional styling logic
4. **Maintainability**: Declarative and easier to understand than complex conditionals
5. **TypeScript**: Fully typed with autocomplete support

```typescript
// Component usage with compound variants
const Component = ({ size, variant, loading, emphasis }) => {
  const isLoading = typeof loading === "boolean" ? loading : loading === "true";
  const isEmphasis = typeof emphasis === "boolean" ? emphasis : emphasis === "true";

  styles.useVariants({
    size,
    variant,
    loading: loading !== undefined ? isLoading : undefined,
    emphasis: emphasis !== undefined ? isEmphasis : undefined,
  });

  return <Text style={styles.text}>{content}</Text>;
};
```

**Boolean Variants (Critical Pattern):**

Boolean variants can be passed as strings and need proper computation. **CRITICAL**: `false` ≠ `default` - you must pass `undefined` to get default variant behavior.

```typescript
// Component with boolean props that might be strings
const Component = ({ isPrimary, isDisabled, showBorder }) => {
  // CRITICAL: Compute boolean variants - they can be strings!
  const disabled = typeof isDisabled === "boolean" ? isDisabled : isDisabled === "true";
  const primary = typeof isPrimary === "boolean" ? isPrimary : isPrimary === "true";
  const border = typeof showBorder === "boolean" ? showBorder : showBorder === "true";

  // Configure variants with computed booleans
  // IMPORTANT: false ≠ default! Pass undefined for default variant
  styles.useVariants({
    color: disabled ? false : true,        // Explicit false vs true
    borderColor: primary ? true : undefined, // undefined = use default variant
    border: border ? "visible" : "hidden",   // String variants
  });

  return <View style={styles.container} />;
};

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.gap(2),
    variants: {
      // Boolean variants - false is NOT the same as default!
      color: {
        true: { backgroundColor: theme.colors.primary },
        false: { backgroundColor: theme.colors.disabled }, // Applied when value = false
        default: { backgroundColor: theme.colors.background }, // Applied when value = undefined
      },
      borderColor: {
        true: { borderColor: theme.colors.primary },
        // No 'false' defined - undefined will use default or no styles
        default: { borderColor: theme.colors.border },
      },
      border: {
        visible: { borderWidth: 1 },
        hidden: { borderWidth: 0 },
      },
    },
  },
}));
```

**Variant Value Rules:**

```typescript
// Understanding variant selection logic
const ExampleComponent = ({ disabled, loading }) => {
  const isDisabled = typeof disabled === "boolean" ? disabled : disabled === "true";
  const isLoading = typeof loading === "boolean" ? loading : loading === "true";

  styles.useVariants({
    // These are DIFFERENT behaviors:
    state: isDisabled ? false : undefined,  // false = select 'false' variant, undefined = select 'default' variant
    loading: isLoading,                     // true = select 'true' variant, false = select 'false' variant
    interactive: isDisabled ? false : true, // Explicit false vs true selection
  });

  return <View style={styles.container} />;
};

const styles = StyleSheet.create((theme) => ({
  container: {
    variants: {
      state: {
        true: { opacity: 1.0 },           // When state = true
        false: { opacity: 0.5 },          // When state = false (EXPLICIT)
        default: { opacity: 0.8 },        // When state = undefined (DEFAULT)
      },
      loading: {
        true: { backgroundColor: theme.colors.loading },
        false: { backgroundColor: theme.colors.normal },
        // No default - undefined loading will not apply any styles
      },
      interactive: {
        true: { cursor: 'pointer' },
        false: { cursor: 'not-allowed' },
        // No default - must be explicitly true or false
      },
    },
  },
}));
```

**Variant Computation Patterns:**

```typescript
// ✅ Proper boolean variant computation with false vs undefined distinction
const Component = ({ disabled, loading, error, optional }) => {
  // Handle mixed boolean/string props
  const isDisabled = typeof disabled === "boolean" ? disabled : disabled === "true";
  const isLoading = typeof loading === "boolean" ? loading : loading === "true";
  const hasError = typeof error === "boolean" ? error : error === "true";

  styles.useVariants({
    // String variants - straightforward
    state: isLoading ? "loading" : (hasError ? "error" : "normal"),

    // Boolean variants - CRITICAL: false ≠ undefined
    interactive: isDisabled ? false : true,        // Explicit false vs true
    disabled: isDisabled,                          // Boolean computation
    optional: optional ? true : undefined,         // true or default (undefined)

    // Mixed approach - sometimes you want false, sometimes undefined
    appearance: hasError ? "danger" : undefined,   // "danger" or default
  });

  return <View style={styles.container} />;
};

const styles = StyleSheet.create((theme) => ({
  container: {
    variants: {
      state: {
        loading: { opacity: 0.7 },
        error: { borderColor: theme.colors.error },
        normal: { opacity: 1.0 },
      },
      interactive: {
        true: { cursor: 'pointer', transform: [{ scale: 1.0 }] },
        false: { cursor: 'not-allowed', transform: [{ scale: 0.95 }] }, // EXPLICIT false behavior
        // No default - must be explicitly true or false
      },
      disabled: {
        true: { opacity: 0.6 },
        false: { opacity: 1.0 },
        default: { opacity: 1.0 }, // Same as false in this case, but semantically different
      },
      optional: {
        true: { borderStyle: 'dashed' },
        // false not defined - will not apply styles
        default: { borderStyle: 'solid' }, // Applied when undefined
      },
      appearance: {
        danger: { backgroundColor: theme.colors.errorBg },
        default: { backgroundColor: theme.colors.normalBg },
      },
    },
  },
}));

// ❌ Bad - Manual conditional styling (triggers re-renders)
const getButtonStyle = (size: string, variant: string) => [
  styles.button,
  size === 'small' && styles.smallButton,
  variant === 'primary' && styles.primaryButton,
];
```

**Key Rules for Boolean Variants:**

1. **`true`** - Selects the `true` variant
2. **`false`** - Selects the `false` variant (if defined)
3. **`undefined`** - Selects the `default` variant (if defined)
4. **Missing variant** - No styles applied if variant key not found

```typescript
// Practical example from your Button component
const Button = ({ disabled, type = "primary" }) => {
  const isDisabled =
    typeof disabled === "boolean" ? disabled : disabled === "true";

  styles.useVariants({
    type, // String variant
    disabled: disabled !== undefined ? isDisabled : undefined, // Boolean or default
  });
};

const styles = StyleSheet.create((theme) => ({
  button: {
    variants: {
      disabled: {
        true: { opacity: 0.6 }, // When explicitly disabled
        false: { opacity: 1.0 }, // When explicitly enabled
        default: { opacity: 1.0 }, // When disabled prop not provided
      },
    },
  },
}));
```

#### 2. Theme Access Pattern

Always access theme through StyleSheet.create function:

```typescript
// ✅ Good - Theme access in StyleSheet.create
const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.centerChannelBg,
    padding: theme.gap(2),
    borderRadius: theme.radius.m,
    borderColor: theme.colors.borderDefault,
  },
  text: {
    fontFamily: theme.fonts.primary,
    fontSize: theme.fontSizes.body,
    color: theme.colors.centerChannelColor,
    fontWeight: theme.fontWeights.normal,
  },
}));

// ❌ Bad - Manual theme access (causes re-renders)
function Component() {
  const { theme } = useUnistyles(); // Triggers re-renders

  return (
    <View style={{ backgroundColor: theme.colors.centerChannelBg }}>
      <Text style={{ color: theme.colors.text }}>Content</Text>
    </View>
  );
}
```

#### 3. Accessibility Requirements

Include accessibility properties for all interactive elements:

```typescript
const styles = StyleSheet.create((theme) => ({
  button: {
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1.5),
    borderRadius: theme.radius.m,
    minHeight: 44, // Required: Minimum touch target size
    alignItems: "center",
    justifyContent: "center",
  },
}));

// In component JSX
<Pressable
  style={styles.button}
  onPress={handlePress}
  disabled={disabled}
  accessibilityRole="button"           // Required: Define role
  accessibilityState={{ disabled }}   // Required: State information
  accessibilityLabel={t(titleKey)}    // Optional: Custom label if needed
>
```

#### 4. Responsive Design with Breakpoints

Unistyles 3.0 provides powerful breakpoint system for responsive design across all platforms.

**Breakpoint Configuration:**

First, define breakpoints in your theme configuration:

```typescript
// unistyles.ts - Breakpoint configuration
const breakpoints = {
  xs: 0, // Mobile portrait (required to start with 0)
  sm: 576, // Mobile landscape
  md: 768, // Tablet portrait
  lg: 992, // Tablet landscape
  xl: 1200, // Desktop
  xxl: 1400, // Large desktop
} as const;

// TypeScript integration
type AppBreakpoints = typeof breakpoints;

declare module "react-native-unistyles" {
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

// Register breakpoints
StyleSheet.configure({
  themes: appThemes,
  breakpoints,
  settings: {
    initialTheme: "light",
  },
});
```

**Responsive Styling Patterns:**

```typescript
// ✅ Good - Breakpoint-based responsive design
const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    padding: theme.gap(2),

    // Responsive values - change based on screen size
    backgroundColor: {
      xs: theme.colors.background,      // Mobile
      md: theme.colors.backgroundAlt,  // Tablet+
      xl: theme.colors.backgroundCard, // Desktop+
    },

    // Different layouts per breakpoint
    flexDirection: {
      xs: 'column',    // Mobile: stack vertically
      md: 'row',       // Tablet+: horizontal layout
    },

    // Responsive spacing
    gap: {
      xs: theme.gap(2),   // 16px on mobile
      sm: theme.gap(3),   // 24px on large mobile
      lg: theme.gap(4),   // 32px on desktop
    },
  },

  text: {
    fontSize: 16,
    lineHeight: 22,

    // Responsive typography
    fontSize: {
      xs: 14,    // Smaller on mobile
      sm: 16,    // Standard on tablet
      lg: 18,    // Larger on desktop
    },

    // Responsive text alignment
    textAlign: {
      xs: 'center',   // Center on mobile
      md: 'left',     // Left-align on tablet+
    },
  },

  // Complex responsive transforms
  image: {
    width: 100,
    height: 100,
    transform: [
      {
        scale: {
          xs: 1.0,      // Normal scale on mobile
          md: 1.2,      // Slightly larger on tablet
          xl: 1.5,      // Much larger on desktop
        },
      },
      {
        translateX: {
          xs: 0,        // No offset on mobile
          lg: 50,       // Offset on desktop
        },
      },
    ],
  },
}));

// Component automatically adapts to screen size changes
const ResponsiveComponent = ({ title, content }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
      <Image style={styles.image} source={{ uri: content.imageUrl }} />
    </View>
  );
};
```

**Built-in Mobile Breakpoints:**

Unistyles provides built-in `portrait` and `landscape` breakpoints for mobile devices:

```typescript
const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: {
      portrait: theme.colors.background, // Portrait orientation
      landscape: theme.colors.backgroundAlt, // Landscape orientation
    },

    // Different padding for orientations
    paddingHorizontal: {
      portrait: theme.gap(2), // Less padding in portrait
      landscape: theme.gap(4), // More padding in landscape
    },
  },

  // Combine custom and built-in breakpoints
  header: {
    height: {
      xs: 60, // Mobile portrait
      portrait: 60, // Any portrait (including tablet)
      landscape: 80, // Any landscape
      lg: 100, // Desktop
    },
  },
}));
```

**Conditional Component Rendering:**

Use `Display` and `Hide` components with media queries for showing/hiding content:

```typescript
import { Display, Hide, mq } from 'react-native-unistyles';

const AdaptiveComponent = () => {
  return (
    <>
      {/* Show only on mobile */}
      <Display mq={mq.only.width(0, 768)}>
        <MobileNavigation />
      </Display>

      {/* Hide on small screens */}
      <Hide mq={mq.only.width(0, 992)}>
        <DesktopSidebar />
      </Hide>

      {/* Show only on tablets */}
      <Display mq={mq.only.width(768, 1200)}>
        <TabletSpecificContent />
      </Display>

      {/* Complex media query */}
      <Display mq={mq.only.width(992).and.height(600)}>
        <LargeScreenContent />
      </Display>
    </>
  );
};
```

**Responsive Variants:**

Combine breakpoints with variants for complex responsive behavior:

```typescript
const styles = StyleSheet.create((theme) => ({
  button: {
    variants: {
      size: {
        small: {
          padding: theme.gap(1),
          // Responsive padding within variants
          padding: {
            xs: theme.gap(1),
            lg: theme.gap(1.5),
          },
        },
        large: {
          padding: theme.gap(3),
          padding: {
            xs: theme.gap(2), // Smaller on mobile
            lg: theme.gap(3), // Full size on desktop
          },
        },
      },
    },

    compoundVariants: [
      {
        size: "large",
        // Apply only on desktop breakpoints
        styles: {
          minWidth: {
            lg: 200, // Minimum width only on desktop
          },
        },
      },
    ],
  },
}));
```

**Runtime Breakpoint Access:**

Access current breakpoint programmatically when needed:

```typescript
import { UnistylesRuntime } from 'react-native-unistyles';

const AdaptiveComponent = () => {
  // Access current breakpoint (avoid overuse - prefer CSS-in-JS)
  const isMobile = UnistylesRuntime.breakpoint === 'xs' || UnistylesRuntime.breakpoint === 'sm';
  const isDesktop = UnistylesRuntime.breakpoint === 'lg' || UnistylesRuntime.breakpoint === 'xl';

  return (
    <View style={styles.container}>
      <Text>Current breakpoint: {UnistylesRuntime.breakpoint}</Text>
      {isMobile && <MobileSpecificLogic />}
      {isDesktop && <DesktopSpecificLogic />}
    </View>
  );
};
```

### Media Queries (Pixel-Perfect Control)

For more granular control than breakpoints, use media queries with the `mq` utility for pixel-perfect responsive design:

```typescript
import { StyleSheet, mq } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,

    // Basic width-based media queries
    backgroundColor: {
      [mq.only.width(240, 380)]: theme.colors.backgroundMobile, // 240-379px
      [mq.only.width(380)]: theme.colors.backgroundTablet, // 380px+
    },

    // Height-based media queries
    minHeight: {
      [mq.only.height(600)]: 100, // Minimum height when screen >= 600px tall
      [mq.only.height(300, 600)]: 80, // Medium height for 300-599px screens
    },
  },

  // Complex combined media queries
  sidebar: {
    width: 200,
    backgroundColor: theme.colors.sidebarBg,

    // Width AND height combinations
    width: {
      [mq.width(768).and.height(600)]: 250, // Larger sidebar on big screens
      [mq.width(1200).and.height(800)]: 300, // Even larger on desktop
    },

    // Mix breakpoints with pixel values
    padding: {
      [mq.only.width(200, "md")]: theme.gap(2), // 200px to 'md' breakpoint
      [mq.only.width("md", "xl")]: theme.gap(3), // 'md' to 'xl' breakpoint
      [mq.only.width("xl")]: theme.gap(4), // 'xl' breakpoint onwards
    },
  },

  // Advanced responsive typography
  title: {
    fontSize: 16,
    fontWeight: theme.fontWeights.semiBold,

    // Precise typography scaling
    fontSize: {
      [mq.only.width(null, 320)]: 14, // Small phones (0-319px)
      [mq.only.width(320, 480)]: 16, // Standard phones (320-479px)
      [mq.only.width(480, 768)]: 18, // Large phones/small tablets
      [mq.only.width(768, 1024)]: 20, // Tablets
      [mq.only.width(1024)]: 24, // Desktop and up
    },

    // Combined width/height for optimal readability
    lineHeight: {
      [mq.width(480).and.height(600)]: 24, // Larger line height on bigger screens
      [mq.width(768).and.height(1024)]: 28, // Even larger for tablets
    },
  },

  // Responsive images with precise control
  heroImage: {
    width: "100%",
    aspectRatio: 16 / 9,

    // Different aspect ratios for different screen sizes
    aspectRatio: {
      [mq.only.width(null, 480)]: 4 / 3, // Square-ish on mobile
      [mq.only.width(480, 1024)]: 16 / 9, // Widescreen on tablets
      [mq.only.width(1024)]: 21 / 9, // Ultra-wide on desktop
    },

    // Responsive transforms
    transform: [
      {
        scale: {
          [mq.only.width(null, 380)]: 0.9, // Slightly smaller on small screens
          [mq.width(380).and.height(600)]: 1.0, // Normal size on medium screens
          [mq.width(1200)]: 1.1, // Slightly larger on desktop
        },
      },
    ],
  },
}));
```

**Media Query Patterns:**

```typescript
// Width-only queries
[mq.only.width(100, 200)][mq.only.width(400)][mq.only.width(null, 800)][ // Width from 100 to 199px // Width from 400px onwards // Width from 0 to 799px
  // Height-only queries
  mq.only.height(300, 600)
][mq.only.height(800)][ // Height from 300 to 599px // Height from 800px onwards
  // Combined width and height
  mq.width(768).and.height(600)
][mq.height(500).and.width("sm")][ // Width 768+ AND height 600+ // Height 500+ AND width from 'sm' breakpoint
  // Using breakpoints in media queries
  mq.only.width("sm", "lg")
][mq.only.width(400, "xl")][ // From 'sm' to 'lg' breakpoint // From 400px to 'xl' breakpoint
  // ❌ Invalid ranges (will be ignored)
  mq.only.width("xl", "sm")
][mq.only.width(800, 400)]; // Invalid: xl is larger than sm // Invalid: 800 is larger than 400
```

**Practical Use Cases:**

```typescript
// Navigation that adapts to screen dimensions
const styles = StyleSheet.create((theme) => ({
  navigation: {
    flexDirection: 'row',

    // Switch to vertical on narrow tall screens (phones in portrait)
    flexDirection: {
      [mq.width(null, 480).and.height(600)]: 'column',
    },

    // Different layouts for different aspect ratios
    justifyContent: {
      [mq.only.width(null, 768)]: 'space-between',     // Mobile: space out items
      [mq.width(768).and.height(600)]: 'center',       // Tablet landscape: center
      [mq.width(1024)]: 'flex-start',                  // Desktop: align left
    },
  },

  // Cards that adapt to available space
  card: {
    width: '100%',

    // Responsive card sizing with precise control
    width: {
      [mq.only.width(null, 480)]: '100%',              // Full width on mobile
      [mq.only.width(480, 768)]: '48%',                // Two columns on large mobile
      [mq.only.width(768, 1200)]: '31%',               // Three columns on tablet
      [mq.width(1200).and.height(800)]: '23%',         // Four columns on large desktop
    },

    // Responsive padding based on available space
    padding: {
      [mq.only.width(null, 400)]: theme.gap(1),        // Tight padding on small screens
      [mq.width(400).and.height(600)]: theme.gap(2),   // Standard padding
      [mq.width(800)]: theme.gap(3),                   // Generous padding on large screens
    },
  },
}));

// Component with media query logic
const AdaptiveGrid = ({ items }) => {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      ))}
    </View>
  );
};
```

**Media Query Best Practices:**

- **Precision**: Use media queries for pixel-perfect control where breakpoints aren't sufficient
- **Performance**: Media queries update automatically without re-renders
- **Logical ranges**: Ensure ranges make sense (smaller to larger values)
- **Combine dimensions**: Use width + height for aspect ratio specific styling
- **Breakpoint integration**: Mix breakpoints with pixel values for flexible responsive design
- **Avoid overuse**: Use breakpoints for general responsive design, media queries for fine-tuning

**Best Practices:**

- **Mobile-first**: Start with mobile (`xs`) and scale up
- **Logical breakpoints**: Use semantic breakpoint names
- **Performance**: Breakpoint styles update automatically without re-renders
- **Consistency**: Use same breakpoints across your entire app
- **Precision**: Use media queries for pixel-perfect control when needed
- **Avoid overuse**: Prefer CSS-in-JS responsive values over runtime checks

#### 5. Web-specific Styles

Unistyles 3.0 supports web-only CSS properties:

```typescript
const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,

    // Web-only styles
    _web: {
      cursor: "pointer",
      transition: "all 0.2s ease",

      // Pseudo-classes
      _hover: {
        backgroundColor: theme.colors.hoverBackground,
      },
      _focus: {
        outline: `2px solid ${theme.colors.focusRing}`,
      },
    },
  },
}));
```

### Styling Migration Rules

When encountering legacy styling patterns, migrate to Unistyles 3.0:

#### From React Native StyleSheet

```typescript
// ❌ Legacy - React Native StyleSheet
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 8,
  },
});

// ✅ Modern - Unistyles 3.0
import { StyleSheet } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  button: {
    backgroundColor: theme.colors.buttonBg,
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1.5),
    borderRadius: theme.radius.m,
    variants: {
      type: {
        primary: { backgroundColor: theme.colors.buttonBg },
        secondary: { backgroundColor: theme.colors.centerChannelBg },
      },
    },
  },
}));
```

#### From Styled Components or Emotion

```typescript
// ❌ Legacy - Styled Components
const StyledButton = styled.Pressable<{ variant: "primary" | "secondary" }>`
  background-color: ${(props) =>
    props.variant === "primary" ? "#007bff" : "#6c757d"};
  padding: 16px;
  border-radius: 8px;
`;

// ✅ Modern - Unistyles 3.0 with variants
const styles = StyleSheet.create((theme) => ({
  button: {
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1.5),
    borderRadius: theme.radius.m,
    variants: {
      variant: {
        primary: { backgroundColor: theme.colors.buttonBg },
        secondary: { backgroundColor: theme.colors.centerChannelBg },
      },
    },
  },
}));

// Configure variants
styles.useVariants({ variant: "primary" });
```

### Performance Considerations

- **No Re-renders**: Unistyles 3.0 updates styles directly in C++ without React re-renders
- **Selective Updates**: Only affected styles are recalculated on theme/breakpoint changes
- **Automatic Optimization**: Variants and compound variants are optimized automatically
- **Style Merging**: Use array syntax `[style1, style2]` instead of object spread

### Theme Structure Requirements

Ensure your theme and configuration follow these patterns for optimal Unistyles integration:

**Theme Definition:**

```typescript
// themes.ts
const theme = {
  colors: {
    // Primary colors
    buttonBg: "#007bff",
    buttonColor: "#ffffff",
    centerChannelBg: "#ffffff",
    centerChannelColor: "#3f4350",

    // State colors
    errorText: "#d24b47",
    errorBg: "#fdebea",

    // Border colors
    borderDefault: "#ddd",
  },

  // Spacing function for consistency
  gap: (multiplier: number) => multiplier * 8,

  // Radius system
  radius: {
    s: 4,
    m: 8,
    l: 12,
    xl: 16,
  },

  // Typography
  fontWeights: {
    normal: "400",
    medium: "500",
    semiBold: "600",
    bold: "700",
  },

  fontSizes: {
    small: 12,
    body: 16,
    heading: 20,
    title: 24,
  },
} as const;
```

**Breakpoints Definition:**

```typescript
// breakpoints.ts
const breakpoints = {
  xs: 0, // Mobile portrait (must start with 0)
  sm: 576, // Mobile landscape
  md: 768, // Tablet portrait
  lg: 992, // Tablet landscape
  xl: 1200, // Desktop
  xxl: 1400, // Large desktop
} as const;
```

**Complete Unistyles Configuration:**

```typescript
// unistyles.ts
import { StyleSheet } from "react-native-unistyles";
import { lightTheme, darkTheme } from "./themes";
import { breakpoints } from "./breakpoints";

// TypeScript integration
type AppThemes = {
  light: typeof lightTheme;
  dark: typeof darkTheme;
};

type AppBreakpoints = typeof breakpoints;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

// Configure Unistyles
StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  breakpoints,
  settings: {
    initialTheme: "light",
    // adaptiveThemes: true, // Alternative to initialTheme
  },
});
```

````

## Internationalization Standards

### Translation Usage

- **useTranslation Hook**: Use `useTranslation()` in components
- **Flat Structure**: Use dot-notation keys with **no nested objects** (1-level approach)
- **Key Naming**: Use descriptive, hierarchical dot-separated keys

```typescript
// ✅ Good - Proper i18n usage with flat keys
import { useTranslation } from 'react-i18next';

function SettingsModal() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('renderer.components.settingsPage.header')}</Text>
      <Text>{t('renderer.components.settingsPage.general')}</Text>
      <Button title={t('label.save')} onPress={handleSave} />
      <Button title={t('label.cancel')} onPress={handleCancel} />
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
````

### Translation Key Structure (Flat, 1-Level Approach)

**✅ Correct Structure** - All keys at root level with dot notation:

```json
{
  "app.menus.contextMenu.openInNewTab": "Open in new tab",
  "app.menus.contextMenu.openInNewWindow": "Open in new window",
  "app.navigationManager.viewLimitReached": "View limit reached",
  "app.navigationManager.viewLimitReached.description": "You have reached the maximum number of open windows and tabs for this server.",
  "label.add": "Add",
  "label.allow": "Allow",
  "label.cancel": "Cancel",
  "label.close": "Close",
  "label.save": "Save",
  "renderer.components.settingsPage.header": "Desktop App Settings",
  "renderer.components.settingsPage.general": "General",
  "renderer.components.settingsPage.advanced": "Advanced",
  "renderer.components.settingsPage.changesSaved": "Changes saved",
  "modal.cancel": "Cancel",
  "modal.confirm": "Confirm"
}
```

**❌ Incorrect Structure** - Nested objects:

```json
{
  "app": {
    "menus": {
      "contextMenu": {
        "openInNewTab": "Open in new tab"
      }
    }
  },
  "label": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

### Key Naming Conventions

1. **Component-based keys**: `renderer.components.{componentName}.{specific}`
   - Example: `renderer.components.settingsPage.header`

2. **Feature-based keys**: `{feature}.{section}.{specific}`
   - Example: `app.navigationManager.viewLimitReached`

3. **Common labels**: `label.{action}`
   - Example: `label.save`, `label.cancel`, `label.close`

4. **Modal actions**: `modal.{action}`
   - Example: `modal.cancel`, `modal.confirm`

5. **Main process keys**: `main.{module}.{specific}`
   - Example: `main.menus.app.file.settings`

### Adding New Translation Keys

## Quick Reference

### Modern Component Template (React 19 + Unistyles 3.0)

```typescript
import React from "react";
import { View, Text, Pressable } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

// Types at top with 'I' prefix
type IProps = {
  title: string;
  onPress: () => void;
  ref?: React.Ref<React.ComponentRef<typeof Pressable>>;
} & IComponentVariant;

type IComponentVariant = UnistylesVariants<typeof styles>;

// Export types for external use
export type IComponentProps = IProps;
export type { IComponentVariant };

// Named export component
export function Component({ title, variant = "default", disabled, onPress, ref }: IProps) {
  const { t } = useTranslation();

  // CRITICAL: Compute boolean variants - they can be strings!
  const isDisabled = typeof disabled === "boolean" ? disabled : disabled === "true";

  // React Compiler handles memoization
  const handlePress = () => {
    if (!isDisabled && onPress) onPress();
  };

  // Configure Unistyles variants - REMEMBER: false ≠ default (undefined)
  styles.useVariants({
    variant,
    disabled: disabled !== undefined ? isDisabled : undefined, // false vs undefined distinction
  });

  return (
    <Pressable
      ref={ref}
      style={styles.button}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      <Text style={styles.text}>{t(title)}</Text>
    </Pressable>
  );
}

// Co-located styles at bottom
const styles = StyleSheet.create((theme) => ({
  button: {
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1.5),
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.buttonBg,
    minHeight: 44, // Accessibility
    variants: {
      variant: {
        default: { backgroundColor: theme.colors.buttonBg },
        secondary: { backgroundColor: theme.colors.centerChannelBg },
        danger: { backgroundColor: theme.colors.errorBg },
      },
      disabled: {
        true: { opacity: 0.6 },
        false: { opacity: 1.0 },
        default: { opacity: 1.0 },
      },
    },
  },
  text: {
    color: theme.colors.buttonColor,
    fontWeight: theme.fontWeights.semiBold,
    fontSize: 16,
    variants: {
      variant: {
        default: { color: theme.colors.buttonColor },
        secondary: { color: theme.colors.centerChannelColor },
        danger: { color: theme.colors.errorText },
      },
      disabled: {
        true: { color: theme.colors.textDisabled },
        false: {}, // No specific styling - use variant color
        default: {}, // No specific styling - use variant color
      },
    },
    // Compound variants for complex styling combinations
    compoundVariants: [
      {
        variant: 'danger',
        disabled: true,
        // Danger + disabled combination gets special treatment
        styles: {
          backgroundColor: theme.colors.errorBgDisabled,
          borderColor: theme.colors.errorBorderDisabled,
        },
      },
    ],
  },
}));
```

### Migration Checklist

When touching any file, migrate these patterns:

- [ ] **Styling**: `StyleSheet` from `react-native` → `react-native-unistyles`
- [ ] **Types**: `interface User` → `type IUser`
- [ ] **Validation**: `Joi.object()` → `object()` from Valibot
- [ ] **Components**: Separate files → Co-located in single file
- [ ] **Refs**: `forwardRef` → `ref` as prop (React 19)
- [ ] **Memoization**: Remove `useCallback`/`useMemo` (React Compiler)
- [ ] **Theme**: Manual theme access → `StyleSheet.create((theme) => ({}))`
- [ ] **Variants**: Ensure all variant options exist in each style (use `{}` for empty)
- [ ] **Boolean Variants**: Distinguish `false` vs `undefined` (default) behavior
- [ ] **Complex Conditionals**: Replace with compound variants for style combinations
- [ ] **Responsive Design**: Use breakpoint objects and `mq` instead of manual calculations
- [ ] **Show/Hide Logic**: Replace conditional rendering with `Display`/`Hide` + `mq`
- [ ] **Pixel-Perfect Design**: Use `mq` utility for precise responsive control

When adding new translation keys, follow the established patterns:

```typescript
// ✅ Good - Follow existing patterns
const keys = {
  // For component-specific text
  header: "renderer.components.myComponent.header",
  description: "renderer.components.myComponent.description",

  // For common actions
  save: "label.save",
  cancel: "label.cancel",

  // For modal-specific actions
  confirm: "modal.confirm",

  // For app-specific features
  feature: "app.myFeature.specificAction",
};

// ❌ Bad - Inconsistent patterns
const keys = {
  header: "myComponent.header", // Missing standard prefix
  save: "common.save", // Use 'label.save' instead
  confirm: "buttons.confirm", // Use 'modal.confirm' instead
};
```

### Key Organization Guidelines

- **Consistency**: Follow existing key patterns in the codebase
- **Granularity**: Use specific keys rather than generic ones
- **Reusability**: Use common label keys (`label.*`) for repeated actions
- **Context**: Include component/feature context in key names
- **No Nesting**: Keep all keys at the root level with dot notation

## Import Standards

### Import Order (ESLint Enforced)

1. **Built-in modules**: Node.js built-ins
2. **External modules**: npm packages
3. **Internal modules**: Project modules with path aliases
4. **Sibling modules**: Same directory
5. **Parent modules**: Parent directories

**Unistyles 3.0 Import Patterns**:

```typescript
// ✅ Good - Proper import order with Unistyles 3.0
import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { StyleSheet, UnistylesVariants, mq } from "react-native-unistyles"; // Unistyles imports
import { useTranslation } from "react-i18next";

import { UserService } from "@/services/UserService";
import { formatDate } from "@/utils/formatters";

import { MessageInput } from "./MessageInput";
import { MessageList } from "../MessageList";

// Component implementation
type IProps = {
  titleKey: string;
  onPress: () => void;
} & UnistylesVariants<typeof styles>;

export function Button({ titleKey, onPress, ...variants }: IProps) {
  const { t } = useTranslation();

  // Configure variants for this instance
  styles.useVariants(variants);

  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{t(titleKey)}</Text>
    </Pressable>
  );
}

// Styles at bottom with theme access
const styles = StyleSheet.create((theme) => ({
  button: {
    backgroundColor: theme.colors.buttonBg,
    // ... rest of styles
  },
  text: {
    color: theme.colors.buttonColor,
    // ... rest of styles
  },
}));

// ❌ Bad - Wrong Unistyles imports and usage
import { StyleSheet } from "react-native"; // Wrong - should be from unistyles
import { useUnistyles } from "react-native-unistyles"; // Avoid - causes re-renders

function BadComponent() {
  const { theme } = useUnistyles(); // Causes unnecessary re-renders

  return (
    <View style={{ backgroundColor: theme.colors.bg }}> {/* Manual theme access */}
      <Text>Content</Text>
    </View>
  );
}
```

**Critical Unistyles Import Rules**:

- **Always import `StyleSheet` from `react-native-unistyles`**, never from `react-native`
- **Import `UnistylesVariants` type** when using variants
- **Avoid `useUnistyles` hook** unless absolutely necessary (causes re-renders)
- **Never import theme directly** - access through `StyleSheet.create((theme) => ({}))`

### Path Aliases

```typescript
// tsconfig.json paths configuration
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### TypeScript Naming Conventions

#### Type Definitions

All custom types must follow these naming conventions:

**✅ Correct Patterns:**

```typescript
// Use 'type' instead of 'interface' for consistency
type IUser = {
  id: string;
  name: string;
  email: string;
};

// Internal component props (not exported) - use generic 'IProps'
type IProps = {
  titleKey: string;
  variant?: "primary" | "secondary" | "danger";
  onPress: () => void;
  disabled?: boolean;
};

// Exported component props - use unique descriptive names
export type IButtonProps = {
  titleKey: string;
  variant?: "primary" | "secondary" | "danger";
  onPress: () => void;
  disabled?: boolean;
};

// Use React's PropsWithChildren for components that accept children
import { PropsWithChildren } from "react";

type IProps = PropsWithChildren<{
  title: string;
  isOpen: boolean;
}>;

// API response types
type IApiResponse<T> = {
  data: T;
  status: "success" | "error";
  message?: string;
};

// Configuration types
type ILanguage = {
  code: string;
  name: string;
  flag: string;
};

// Event handler types
type IMessageHandler = (message: IMessage) => void;
type IFormSubmitHandler = (data: IFormData) => Promise<void>;

// Utility types with 'I' prefix
type IOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type IWithId<T> = T & { id: string };
```

**❌ Incorrect Patterns:**

```typescript
// Don't use 'interface' - use 'type' instead
interface UserProps {
  // ❌ Wrong
  user: User;
}

// Don't omit 'I' prefix
type User = {
  // ❌ Wrong - missing 'I' prefix
  id: string;
  name: string;
};

type ButtonProps = {
  // ❌ Wrong - missing 'I' prefix
  title: string;
};

// Don't use inconsistent naming
interface IUser {
  // ❌ Wrong - should use 'type'
  id: string;
}

// Don't manually declare children prop
type IProps = {
  // ❌ Wrong - manually declaring children
  children: React.ReactNode;
  title: string;
};

// Don't use descriptive names for internal props
type IModalContainerProps = {
  // ❌ Wrong - too specific for internal use
  isOpen: boolean;
};
```

#### Type Organization Patterns (Maximum Co-location)

**Co-location Priority**: Keep everything in the component file itself.

```typescript
// Button/Button.tsx - Everything in one file (PREFERRED APPROACH)
import React from 'react';
import { Pressable, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';

// All types defined in component file
type IProps = {
  titleKey: string;
  variant?: IButtonVariant;
  onPress: () => void;
  disabled?: boolean;
};

type IButtonVariant = "primary" | "secondary" | "danger";

// Export types that other components need
export type IButtonProps = IProps; // For external consumption
export type { IButtonVariant };    // For other components

// Component implementation with named export
export function Button({ titleKey, variant = 'primary', onPress, disabled }: IProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      style={[styles.button, styles[variant], disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`]}>
        {t(titleKey)}
      </Text>
    </Pressable>
  );
}

// Styles defined at bottom of component file
const styles = StyleSheet.create((theme) => ({
  button: {
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1.5),
    borderRadius: theme.radius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.colors.buttonBg,
  },
  secondary: {
    backgroundColor: theme.colors.centerChannelBg,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  danger: {
    backgroundColor: theme.colors.errorBg,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: theme.fontWeights.semiBold,
  },
  primaryText: {
    color: theme.colors.buttonColor,
  },
  secondaryText: {
    color: theme.colors.centerChannelColor,
  },
  dangerText: {
    color: theme.colors.errorColor,
  },
}));
```

**For Pages (Expo Router):**

```typescript
// app/settings.tsx - Page with default export
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';

// Page types (internal to page)
type ISettingsData = {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  language: string;
};

// Default export required for expo-router
export default function SettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<ISettingsData>({
    theme: 'auto',
    notifications: true,
    language: 'en',
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {t('renderer.components.settingsPage.header')}
      </Text>
      {/* Page content */}
    </ScrollView>
  );
}

// Styles co-located in the same file
const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.centerChannelBg,
  },
  title: {
    fontSize: 24,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.centerChannelColor,
    padding: theme.gap(3),
  },
}));
```

**Global types only when truly shared across many files:**

```typescript
// src/types/global.ts - Only for widely shared entities
export type IUser = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type ITeam = {
  id: string;
  name: string;
  displayName: string;
  description: string;
};
```

#### Component Props Naming Rules

**Internal Props (Not Exported):**

- Use generic `IProps` name
- Keep the type definition within the component file
- Don't export unless needed by other components

**Exported Props (Shared Between Components):**

- Use descriptive unique names (`IButtonProps`, `IModalProps`)
- Export from component's `types.ts` file or main component file
- Include in barrel exports when needed

**Children Prop Handling:**

- Use React's `PropsWithChildren<T>` instead of manually declaring `children`
- Provides proper typing for React children
- Cleaner and more maintainable

```typescript
// ✅ Good - Internal props with PropsWithChildren
import { PropsWithChildren } from 'react';

type IProps = PropsWithChildren<{
  title: string;
  isVisible: boolean;
  onClose: () => void;
}>;

function Modal({ children, title, isVisible, onClose }: IProps) {
  return (
    <div className={`modal ${isVisible ? 'open' : ''}`}>
      <h2>{title}</h2>
      <button onClick={onClose}>×</button>
      {children}
    </div>
  );
}

// ✅ Good - Exported props for reuse
export type IButtonProps = {
  titleKey: string;
  variant?: 'primary' | 'secondary';
  onPress: () => void;
  disabled?: boolean;
};

// ✅ Good - Internal props without children
type IProps = {
  message: IMessage;
  onEdit?: (id: string) => void;
};

// ❌ Bad - Manually declaring children
type IProps = {
  children: React.ReactNode;  // ❌ Use PropsWithChildren instead
  title: string;
};

// ❌ Bad - Too specific name for internal use
type IModalContainerProps = {  // ❌ Just use IProps
  title: string;
};
```

#### Migration Rules for Legacy Types

When encountering legacy types, follow this migration pattern:

```typescript
// Legacy patterns to migrate:

// ❌ Legacy - interface without prefix
interface User {
  id: string;
  name: string;
}

// ❌ Legacy - type without prefix
type User = {
  id: string;
  name: string;
};

// ✅ Migrated - type with 'I' prefix
type IUser = {
  id: string;
  name: string;
};

// ❌ Legacy - mixed interface/type usage
interface UserProps {
  user: User;
}

// ✅ Migrated - consistent type usage with 'I' prefix
type IUserProps = {
  user: IUser;
};
```

## General Naming Conventions

### Code Element Naming

Follow these consistent naming patterns throughout the codebase:

- **Functions**: camelCase (e.g., `getUserData`, `formatMessage`, `handleSubmit`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_RETRY_COUNT`, `DEFAULT_THEME`)
- **Components**: PascalCase (e.g., `Button`, `UserProfile`, `MessageList`)
- **Variables**: camelCase (e.g., `userData`, `isLoading`, `currentTheme`)
- **Types**: PascalCase with 'I' prefix (e.g., `IUser`, `IApiResponse`, `IButtonProps`)

### Examples

```typescript
// ✅ Good - Proper naming conventions
const API_BASE_URL = 'https://api.example.com' as const;
const MAX_RETRY_COUNT = 3 as const;
const DEFAULT_CONFIG: IAppConfig = {
  theme: 'light',
  retries: MAX_RETRY_COUNT,
} as const;

function getUserData(userId: string): Promise<IUser> {
  // Function implementation
}

function UserProfile({ user, onEdit }: IProps) {
  const [isEditing, setIsEditing] = useState(false);
  const currentUser = user;

  const handleEditClick = () => {
    setIsEditing(true);
    onEdit?.(user.id);
  };

  return <div>{/* Component JSX */}</div>;
}

type IProps = {
  user: IUser;
  onEdit?: (id: string) => void;
};

// ❌ Bad - Inconsistent naming
const apiBaseUrl = 'https://api.example.com'; // Should be SCREAMING_SNAKE_CASE
const Max_Retry_Count = 3; // Should be SCREAMING_SNAKE_CASE
const default_config = { theme: 'light' }; // Should be camelCase

function GetUserData(userId: string) { // Should be camelCase
  // ...
}

function userProfile({ User, OnEdit }) { // Should be PascalCase, props should be camelCase
  // ...
}
```

### Constant Declaration Best Practices

```typescript
// ✅ Good - Properly typed constants with SCREAMING_SNAKE_CASE
const API_ENDPOINTS = {
  USERS: "/api/users",
  MESSAGES: "/api/messages",
  SETTINGS: "/api/settings",
} as const satisfies Record<string, string>;

const THEME_COLORS = {
  PRIMARY: "#007bff",
  SECONDARY: "#6c757d",
  SUCCESS: "#28a745",
  DANGER: "#dc3545",
} as const satisfies Record<string, string>;

const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_USERNAME_LENGTH: 50,
  ALLOWED_FILE_EXTENSIONS: ["jpg", "png", "gif", "webp"],
} as const;

// ❌ Bad - Inconsistent naming and typing
const apiEndpoints = {
  // Should be SCREAMING_SNAKE_CASE
  users: "/api/users",
  messages: "/api/messages",
}; // Missing 'as const' and type annotation

const themeColors = {
  // Should be SCREAMING_SNAKE_CASE
  primary: "#007bff",
}; // Missing satisfies and as const
```

## File Naming Conventions

### Component Files (Component-Per-Folder Structure)

- **Component Folders**: PascalCase (e.g., `Button/`, `MessageList/`, `UserProfile/`)
- **Main Components**: PascalCase matching folder name (e.g., `Button/Button.tsx`)
- **Sub-components**: PascalCase with descriptive names (e.g., `Button/ButtonIcon.tsx`)
- **Tests**: Component name + `.spec.tsx` (e.g., `Button/Button.spec.tsx`)
- **Stories**: Component name + `.stories.tsx` (e.g., `Button/Button.stories.tsx`)
- **Barrel Export**: Always `index.ts` (e.g., `Button/index.ts`)

### Page Files (Expo Router)

- **Pages**: camelCase matching route (e.g., `app/settings.tsx`, `app/profile.tsx`)
- **Layout Files**: `_layout.tsx`
- **Dynamic Routes**: `[id].tsx`, `[...slug].tsx`

### Other Files

- **Hooks**: camelCase with "use" prefix (e.g., `useUserProfile.ts`)
- **Services**: PascalCase with "Service" suffix (e.g., `UserService.ts`)
- **Global Types**: PascalCase with 'I' prefix (e.g., `IUser.ts`, `IApiResponse.ts`)
- **Utilities**: camelCase with co-located tests (e.g., `formatDate.ts`, `formatDate.spec.ts`)

### Export Examples

```typescript
// Button/Button.tsx - Complete co-location with named export
type IProps = {
  titleKey: string;
  variant?: IButtonVariant;
  onPress: () => void;
};

type IButtonVariant = "primary" | "secondary" | "danger";

// Export types that other components need
export type IButtonProps = IProps;
export type { IButtonVariant };

// Named export for components
export function Button({ titleKey, variant = "primary", onPress }: IProps) {
  // Component implementation + styles in same file
}

// Button/index.ts - Barrel export
export { Button, type IButtonProps, type IButtonVariant } from "./Button";

// app/settings.tsx - Page with default export
type ISettingsState = {
  theme: "light" | "dark";
  notifications: boolean;
};

// Default export required for expo-router
export default function SettingsPage() {
  // Page implementation + styles in same file
}

// Modal/Modal.tsx - Component with children
import { PropsWithChildren } from "react";

type IProps = PropsWithChildren<{
  title: string;
  isVisible: boolean;
  onClose: () => void;
}>;

// Named export for components
export function Modal({ children, title, isVisible, onClose }: IProps) {
  // Component + styles in same file
}

// src/types/global.ts - Only for truly global types
export type IUser = {
  id: string;
  username: string;
  email: string;
};

export type ITeam = {
  id: string;
  name: string;
  displayName: string;
};
```

### Export Convention Summary

- **✅ Components**: Named exports (`export function Button()`)
- **✅ Pages**: Default exports (`export default function SettingsPage()`)
- **✅ Types**: Export from component file when needed by others
- **✅ Barrel exports**: Re-export from `index.ts` for clean imports
- **❌ Avoid**: Separate `styles.ts` or `types.ts` files unless absolutely necessary

### Directory Structure (Component-Per-Folder Pattern)

Based on Stories 1.2 (Jest Testing) and 1.3 (Storybook Integration), each component should be organized in its own folder with maximum co-location:

```
src/
├── app/                          # Expo Router pages (default exports)
│   ├── (tabs)/                   # Tab layout
│   │   ├── settings.tsx          # Page with default export + co-located styles/types
│   │   └── profile.tsx           # Page with default export + co-located styles/types
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Home page
├── components/                   # Component-per-folder structure
│   ├── common/                   # Shared components
│   │   ├── Button/               # Button component folder
│   │   │   ├── Button.tsx        # Component + types + styles + named export
│   │   │   ├── Button.spec.tsx   # Jest tests
│   │   │   ├── Button.stories.tsx # Storybook stories (optional)
│   │   │   └── index.ts          # Barrel export: export { Button } from './Button'
│   │   ├── Input/                # Input component folder
│   │   │   ├── Input.tsx         # Main component + types + styles + named export
│   │   │   ├── InputLabel.tsx    # Sub-component + its own types + styles + named export
│   │   │   ├── InputError.tsx    # Sub-component + its own types + styles + named export
│   │   │   ├── Input.spec.tsx    # Jest tests
│   │   │   ├── Input.stories.tsx # Storybook stories (optional)
│   │   │   └── index.ts          # Barrel export: export { Input, InputLabel, InputError }
│   │   └── Modal/                # Modal component folder
│   │       ├── Modal.tsx         # Component + types + styles + named export
│   │       ├── ModalHeader.tsx   # Sub-component + its own types + styles + named export
│   │       ├── ModalFooter.tsx   # Sub-component + its own types + styles + named export
│   │       ├── Modal.spec.tsx    # Jest tests
│   │       ├── Modal.stories.tsx # Storybook stories (optional)
│   │       └── index.ts          # Barrel export: export { Modal, ModalHeader, ModalFooter }
│   ├── chat/                     # Chat-specific components
│   │   ├── MessageList/          # Message list component folder
│   │   │   ├── MessageList.tsx   # Component + types + styles + named export
│   │   │   ├── MessageItem.tsx   # Sub-component + its own types + styles + named export
│   │   │   ├── MessageList.spec.tsx # Jest tests
│   │   │   ├── MessageList.stories.tsx # Storybook stories (optional)
│   │   │   └── index.ts          # Barrel export: export { MessageList, MessageItem }
│   │   └── MessageInput/         # Message input component folder
│   │       ├── MessageInput.tsx  # Component + types + styles + named export
│   │       ├── MessageInput.spec.tsx # Jest tests
│   │       ├── MessageInput.stories.tsx # Storybook stories (optional)
│   │       └── index.ts          # Barrel export: export { MessageInput }
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

### Joi → Valibot Migration

**CRITICAL:** When encountering Joi validation schemas, always migrate to Valibot for better TypeScript integration and performance.

#### ❌ Legacy Joi Patterns to Migrate

```typescript
// Legacy Joi validation
import Joi from "joi";

const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(18).max(120).optional(),
  roles: Joi.array().items(Joi.string().valid("admin", "user")).default([]),
});

// Validate with Joi
const { error, value } = userSchema.validate(userData);
if (error) {
  throw new Error(error.details[0].message);
}

// No proper TypeScript inference
const user = value; // Type: any
```

#### ✅ Current Valibot Standard

```typescript
// Modern Valibot validation - use named imports for tree-shaking
import {
  object,
  string,
  number,
  integer,
  array,
  optional,
  pipe,
  minLength,
  maxLength,
  minValue,
  maxValue,
  email,
  picklist,
  transform,
  parse,
  isValiError,
  type InferInput,
  type InferOutput,
} from "valibot";

const UserSchema = object({
  name: pipe(string(), minLength(2), maxLength(50)),
  email: pipe(string(), email()),
  age: optional(pipe(number(), integer(), minValue(18), maxValue(120))),
  roles: pipe(
    array(picklist(["admin", "user"])),
    transform((roles) => (roles.length > 0 ? roles : ["user"])),
  ),
});

// Infer TypeScript type from schema
type IUser = InferInput<typeof UserSchema>;
type IValidatedUser = InferOutput<typeof UserSchema>;

// Validate with proper error handling
function validateUser(userData: unknown): IValidatedUser {
  try {
    return parse(UserSchema, userData);
  } catch (error) {
    if (isValiError(error)) {
      const errorMessage = error.issues
        .map((issue) => `${issue.path?.join(".")}: ${issue.message}`)
        .join(", ");
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    throw error;
  }
}

// Perfect TypeScript integration
const user = validateUser(rawData); // Type: IValidatedUser
```

#### Common Migration Patterns

**String Validations:**

```typescript
// ❌ Joi
Joi.string().min(5).max(100).required();
Joi.string().email().required();
Joi.string().uri().optional();

// ✅ Valibot - named imports for tree-shaking
import {
  pipe,
  string,
  minLength,
  maxLength,
  email,
  url,
  optional,
} from "valibot";

pipe(string(), minLength(5), maxLength(100));
pipe(string(), email());
optional(pipe(string(), url()));
```

**Number Validations:**

```typescript
// ❌ Joi
Joi.number().integer().min(0).max(100);
Joi.number().positive().required();

// ✅ Valibot - named imports for tree-shaking
import { pipe, number, integer, minValue, maxValue } from "valibot";

pipe(number(), integer(), minValue(0), maxValue(100));
pipe(number(), minValue(0, "Must be positive"));
```

**Object and Array Validations:**

```typescript
// ❌ Joi
Joi.object({
  items: Joi.array().items(Joi.string()).min(1).required(),
  metadata: Joi.object().unknown(true).optional(),
});

// ✅ Valibot - named imports for tree-shaking
import {
  object,
  array,
  string,
  pipe,
  minLength,
  optional,
  record,
  unknown,
} from "valibot";

object({
  items: pipe(array(string()), minLength(1)),
  metadata: optional(record(string(), unknown())),
});
```

**Conditional Validations:**

```typescript
// ❌ Joi
Joi.object({
  type: Joi.string().valid("email", "phone").required(),
  contact: Joi.when("type", {
    is: "email",
    then: Joi.string().email().required(),
    otherwise: Joi.string()
      .pattern(/^\+?[\d\s-()]+$/)
      .required(),
  }),
});

// ✅ Valibot - named imports for tree-shaking
import { variant, object, literal, pipe, string, email, regex } from "valibot";

variant("type", [
  object({
    type: literal("email"),
    contact: pipe(string(), email()),
  }),
  object({
    type: literal("phone"),
    contact: pipe(string(), regex(/^\+?[\d\s-()]+$/)),
  }),
]);
```

**Number Validations:**

```typescript
// ❌ Joi
Joi.number().integer().min(0).max(100);
Joi.number().positive().required();

// ✅ Valibot
v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(100));
v.pipe(v.number(), v.minValue(0, "Must be positive"));
```

**Object and Array Validations:**

```typescript
// ❌ Joi
Joi.object({
  items: Joi.array().items(Joi.string()).min(1).required(),
  metadata: Joi.object().unknown(true).optional(),
});

// ✅ Valibot
v.object({
  items: v.pipe(v.array(v.string()), v.minLength(1)),
  metadata: v.optional(v.record(v.string(), v.unknown())),
});
```

**Conditional Validations:**

```typescript
// ❌ Joi
Joi.object({
  type: Joi.string().valid("email", "phone").required(),
  contact: Joi.when("type", {
    is: "email",
    then: Joi.string().email().required(),
    otherwise: Joi.string()
      .pattern(/^\+?[\d\s-()]+$/)
      .required(),
  }),
});

// ✅ Valibot
v.variant("type", [
  v.object({
    type: v.literal("email"),
    contact: v.pipe(v.string(), v.email()),
  }),
  v.object({
    type: v.literal("phone"),
    contact: v.pipe(v.string(), v.regex(/^\+?[\d\s-()]+$/)),
  }),
]);
```

#### Advanced Valibot Features

```typescript
// Custom transformations and validations - named imports for tree-shaking
import {
  pipe,
  object,
  string,
  email,
  isoDate,
  transform,
  check,
  pipeAsync,
  checkAsync,
  minLength,
  picklist,
  array,
} from "valibot";

const ProcessedUserSchema = pipe(
  object({
    email: pipe(string(), email()),
    name: string(),
    birthDate: pipe(string(), isoDate()),
  }),
  transform((user) => ({
    ...user,
    email: user.email.toLowerCase(),
    name: user.name.trim(),
    age: calculateAge(new Date(user.birthDate)),
  })),
  check((user) => user.age >= 18, "Must be 18 or older"),
);

// Async validation
const AsyncUserSchema = pipeAsync(
  object({
    username: string(),
    email: pipe(string(), email()),
  }),
  checkAsync(async (user) => {
    const exists = await checkUserExists(user.username);
    return !exists;
  }, "Username already exists"),
);

// Schema composition
const BasePersonSchema = object({
  name: pipe(string(), minLength(1)),
  email: pipe(string(), email()),
});

const UserSchema = object({
  ...BasePersonSchema.entries,
  role: picklist(["admin", "user"]),
  permissions: array(string()),
});
```

#### Migration Checklist

When migrating from Joi to Valibot:

1. **✅ Replace imports**: `import Joi from 'joi'` → `import { object, string, parse, ... } from 'valibot'` (named imports for tree-shaking)
2. **✅ Convert schema syntax**: `Joi.object()` → `object()`
3. **✅ Update validation calls**: `.validate()` → `parse()` or `safeParse()`
4. **✅ Add TypeScript types**: Use `InferInput<>` and `InferOutput<>`
5. **✅ Improve error handling**: Use `isValiError()` for better error messages
6. **✅ Leverage transformations**: Use `transform()` for data processing
7. **✅ Update tests**: Test both validation and TypeScript inference

**Important**: Always use named imports instead of `import * as v from 'valibot'` to ensure proper tree-shaking and smaller bundle sizes.

#### Benefits of Migration

- **🚀 Performance**: Valibot is significantly faster than Joi
- **📘 TypeScript**: Perfect type inference without additional type definitions
- **📦 Bundle size**: Much smaller bundle impact
- **🔧 Composability**: Better schema composition and reuse
- **🛠️ Developer experience**: Better IDE support and autocomplete

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

### Legacy Patterns to Always Migrate

When touching any file, always migrate these legacy patterns to modern standards:

#### 1. Styling: React Native StyleSheet → Unistyles 3.0

```typescript
// ❌ Legacy - React Native StyleSheet
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 8,
  },
});

// ✅ Modern - Unistyles 3.0 with theme and variants
import { StyleSheet } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  button: {
    backgroundColor: theme.colors.buttonBg,
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1.5),
    borderRadius: theme.radius.m,
    variants: {
      type: {
        primary: { backgroundColor: theme.colors.buttonBg },
        secondary: { backgroundColor: theme.colors.centerChannelBg },
      },
    },
  },
}));
```

#### 2. Component Structure: Separate Files → Co-location

```typescript
// ❌ Legacy - Separate files
// Button/Button.tsx
// Button/Button.styles.ts
// Button/Button.types.ts

// ✅ Modern - Complete co-location
// Button/Button.tsx (everything in one file)
import React from "react";
import { Pressable, Text } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

// Types at top
type IProps = {
  titleKey: string;
  onPress: () => void;
} & IButtonVariant;

type IButtonVariant = UnistylesVariants<typeof styles>;

// Export types for other components
export type IButtonProps = IProps;
export type { IButtonVariant };

// Component in middle
export function Button({ titleKey, type = "primary", onPress }: IProps) {
  styles.useVariants({ type });

  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{t(titleKey)}</Text>
    </Pressable>
  );
}

// Styles at bottom
const styles = StyleSheet.create((theme) => ({
  // ... styles with variants
}));
```

#### 3. Type Definitions: Interface → Type with 'I' prefix

```typescript
// ❌ Legacy - Interface without prefix
interface UserProps {
  user: User;
  onSelect: (id: string) => void;
}

interface User {
  id: string;
  name: string;
}

// ✅ Modern - Type with 'I' prefix
type IUserProps = {
  user: IUser;
  onSelect: (id: string) => void;
};

type IUser = {
  id: string;
  name: string;
};
```

#### 4. Validation: Joi → Valibot

```typescript
// ❌ Legacy - Joi validation
import Joi from "joi";

const userSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
});

// ✅ Modern - Valibot with proper TypeScript
import { object, string, pipe, minLength, email, parse } from "valibot";

const UserSchema = object({
  name: pipe(string(), minLength(2)),
  email: pipe(string(), email()),
});

type IUser = InferInput<typeof UserSchema>;
```

#### 5. References: forwardRef → React 19 ref as prop

```typescript
// ❌ Legacy - forwardRef pattern
import React, { forwardRef } from 'react';

const Button = forwardRef<View, IButtonProps>(({ title, onPress }, ref) => (
  <Pressable ref={ref} onPress={onPress}>
    <Text>{title}</Text>
  </Pressable>
));

// ✅ Modern - React 19 ref as prop
type IProps = {
  title: string;
  onPress: () => void;
  ref?: React.Ref<React.ComponentRef<typeof Pressable>>;
};

export function Button({ title, onPress, ref }: IProps) {
  return (
    <Pressable ref={ref} onPress={onPress}>
      <Text>{title}</Text>
    </Pressable>
  );
}
```

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
type IProps = {
  text?: string;
};

function Heading({ text = 'Hello, world!' }: IProps) {
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
type IProps = {
  label: string;
  ref?: React.Ref<HTMLInputElement>;
};

function MyInput({ label, ref }: IProps) {
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
3. **Update TypeScript**: Replace PropTypes with proper types using 'I' prefix and 'type' instead of 'interface'
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

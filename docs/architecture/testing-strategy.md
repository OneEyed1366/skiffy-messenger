# Testing Strategy

## Overview

This document defines the comprehensive testing strategy for the Mattermost Platform Migration project, covering the transition from Electron to Expo + Tauri architecture. Based on Stories 1.2 (Jest Testing) and 1.3 (Storybook Integration), this strategy emphasizes co-located testing, component documentation, and cross-platform compatibility.

## Testing Philosophy

### Core Principles

- **Co-located Testing**: Tests live alongside the code they test
- **Component-Driven Development**: Use Storybook for component documentation and development
- **Cross-Platform Testing**: Ensure compatibility across web, desktop, and future mobile
- **Real Environment Testing**: Use actual theme and i18n configurations, not mocks
- **Test Pyramid**: Balance unit, integration, and end-to-end tests

### Testing Goals

1. **Ensure Migration Quality**: Verify components work correctly in the new Expo + Tauri environment
2. **Prevent Regressions**: Catch breaking changes during the migration process
3. **Document Components**: Provide visual documentation through Storybook
4. **Cross-Platform Consistency**: Ensure consistent behavior across all platforms
5. **Developer Experience**: Make testing fast, reliable, and easy to understand

## Testing Stack

### Primary Testing Tools (Story 1.2)

| Tool                             | Version                      | Purpose                       | Rationale                                            |
| -------------------------------- | ---------------------------- | ----------------------------- | ---------------------------------------------------- |
| **Jest**                         | Latest with jest-expo preset | Test runner and framework     | React Native and Expo SDK compatibility              |
| **React Native Testing Library** | Latest                       | Component testing             | React 19 compatible, replaces react-test-renderer    |
| **expo-router/testing-library**  | Built-in with Expo Router    | Router and navigation testing | Specialized testing utilities for file-based routing |
| **@types/jest**                  | Latest                       | TypeScript support            | Proper type definitions for Jest                     |

### Secondary Testing Tools (Story 1.3)

| Tool                             | Version | Purpose                                 | Rationale                                               |
| -------------------------------- | ------- | --------------------------------------- | ------------------------------------------------------- |
| **Storybook**                    | 9.x     | Component documentation and development | React Native support with environment-controlled access |
| **Playwright**                   | Latest  | End-to-end testing                      | Cross-platform desktop application testing              |
| **ESLint Plugin React Compiler** | Latest  | Static analysis                         | Validates React rules and compiler compatibility        |

### Integration Requirements

- **Unistyles Integration**: `react-native-unistyles/mocks` + actual theme configuration
- **i18n Integration**: Real `i18next` configuration without stubbing
- **Tauri Integration**: Cross-platform desktop testing capabilities
- **pnpm Compatibility**: Proper `transformIgnorePatterns` for pnpm workspaces

## Test Organization

### Testing Pyramid Structure

```
                    E2E Tests (Playwright + Tauri)
                   /                            \
              Integration Tests (Router + API)
             /                                  \
        Component Tests (RTL + Storybook)  Rust Unit Tests (Cargo)
       /                                                        \
  Unit Tests (Jest)                                        Tauri Command Tests
```

### File Structure and Naming

Based on the component-per-folder structure:

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx              # Main component
│   │   ├── Button.spec.tsx         # Component tests (co-located)
│   │   ├── Button.stories.tsx      # Storybook stories (co-located)
│   │   └── ...
│   └── MessageList/
│       ├── MessageList.tsx         # Main component
│       ├── MessageList.spec.tsx    # Component tests
│       ├── MessageList.stories.tsx # Storybook stories
│       └── ...
├── utils/
│   ├── formatters.ts               # Utility functions
│   ├── formatters.spec.ts          # Unit tests (co-located)
│   └── validators.spec.ts          # Unit tests (co-located)
├── __tests__/                      # Global application tests
│   ├── navigation.test.tsx         # Router tests (REQUIRED: not in app/)
│   ├── integration/                # Integration tests
│   │   ├── api.test.ts             # API integration tests
│   │   └── auth.test.ts            # Authentication flow tests
│   └── e2e/                        # End-to-end tests
│       ├── auth.spec.ts            # Authentication E2E
│       ├── chat.spec.ts            # Chat functionality E2E
│       └── settings.spec.ts        # Settings E2E
└── .rnstorybook/                   # Storybook configuration
    ├── main.ts                     # Storybook main config
    ├── preview.tsx                 # Storybook preview config
    └── index.tsx                   # Storybook entry point
```

## Jest Configuration

### Package.json Configuration

```json
{
  "scripts": {
    "test": "jest --watchAll",
    "test:ci": "jest",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "preset": "jest-expo",
    "setupFiles": ["react-native-unistyles/mocks", "./src/theme.ts"],
    "transformIgnorePatterns": [
      "node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-unistyles))"
    ],
    "collectCoverage": true,
    "collectCoverageFrom": [
      "**/*.{ts,tsx,js,jsx}",
      "!**/coverage/**",
      "!**/node_modules/**",
      "!**/babel.config.js",
      "!**/expo-env.d.ts",
      "!**/.expo/**",
      "!**/.rnstorybook/**",
      "!**/*.stories.{ts,tsx}"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": ["text", "lcov", "html"],
    "testTimeout": 10000
  }
}
```

### Key Configuration Notes

- **jest-expo preset**: Handles Expo SDK mocking automatically
- **setupFiles order**: `react-native-unistyles/mocks` MUST come before theme configuration
- **pnpm support**: `(?:.pnpm/)?` syntax for pnpm workspace compatibility
- **Unistyles integration**: Provides mocks + actual theme for authentic testing
- **Coverage exclusions**: Excludes build artifacts, dependencies, and Storybook files

### Test Environment Setup

#### Theme Integration (src/theme.ts)

```typescript
// src/theme.ts - Already configured in apps/v2
// This file is loaded after unistyles/mocks in Jest setupFiles
// Provides actual theme configuration for component tests
```

#### i18n Test Configuration

```typescript
// src/i18nextForTests.ts - Test-specific i18n setup
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  ns: ["common"],
  defaultNS: "common",
  debug: false,
  interpolation: {
    escapeValue: false, // not needed for react
  },
  resources: {
    en: {
      common: {
        save: "Save",
        cancel: "Cancel",
        loading: "Loading...",
        edit: "Edit",
        delete: "Delete",
        confirm: "Confirm",
        // Add more keys as needed for testing
      },
    },
  },
});

export default i18n;
```

## Component Testing Patterns

### Component Test Template

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

    // Test actual translation, not key
    expect(getByText('Save')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <Button titleKey="common.save" onPress={onPressMock} />
      </TestWrapper>
    );

    fireEvent.press(getByText('Save'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('should handle disabled state correctly', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <Button titleKey="common.save" onPress={onPressMock} disabled />
      </TestWrapper>
    );

    fireEvent.press(getByText('Save'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('should display loading state', () => {
    const { getByText } = render(
      <TestWrapper>
        <Button titleKey="common.loading" isLoading />
      </TestWrapper>
    );

    expect(getByText('Loading...')).toBeTruthy();
  });
});
```

### Component Testing Guidelines

#### ✅ What to Test

- **Component Rendering**: Verify component renders without errors
- **User Interactions**: Test button clicks, form submissions, input changes
- **Prop Handling**: Test different prop combinations and edge cases
- **Accessibility**: Test screen reader compatibility and focus management
- **Business Logic**: Test component state changes and data transformations
- **Translation Integration**: Test that correct translation keys are used
- **Error States**: Test error handling and recovery

#### ❌ What NOT to Test

- **Style Values**: Don't test specific CSS values or colors
- **Theme System Internals**: Don't test Unistyles implementation details
- **Visual Appearance**: Use E2E tests for visual verification
- **Third-party Library Internals**: Don't test React Native or Expo internals
- **Implementation Details**: Focus on behavior, not implementation

### Complex Component Testing

#### Form Components with State

```typescript
// MessageInput/MessageInput.spec.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18nextForTests';
import { MessageInput } from './MessageInput';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

describe('<MessageInput />', () => {
  it('should send message when submit button is pressed', async () => {
    const mockSendMessage = jest.fn().mockResolvedValue(undefined);

    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <MessageInput onSendMessage={mockSendMessage} />
      </TestWrapper>
    );

    const input = getByPlaceholderText('Type a message...');
    const sendButton = getByText('Send');

    fireEvent.changeText(input, 'Hello, world!');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Hello, world!');
    });
  });

  it('should clear input after sending message', async () => {
    const mockSendMessage = jest.fn().mockResolvedValue(undefined);

    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <MessageInput onSendMessage={mockSendMessage} />
      </TestWrapper>
    );

    const input = getByPlaceholderText('Type a message...');

    fireEvent.changeText(input, 'Test message');
    fireEvent.press(getByText('Send'));

    await waitFor(() => {
      expect(input.props.value).toBe('');
    });
  });

  it('should disable send button when input is empty', () => {
    const { getByText } = render(
      <TestWrapper>
        <MessageInput onSendMessage={() => {}} />
      </TestWrapper>
    );

    const sendButton = getByText('Send');
    expect(sendButton.props.accessibilityState.disabled).toBe(true);
  });
});
```

## Unit Testing Patterns

### Utility Function Testing

```typescript
// utils/formatters.spec.ts - Co-located unit tests
import { formatDate, formatMessage, validateEmail } from "./formatters";

describe("formatters", () => {
  describe("formatDate", () => {
    it("should format date correctly", () => {
      const date = new Date("2023-10-20T10:30:00Z");
      const result = formatDate(date);
      expect(result).toBe("Oct 20, 2023");
    });

    it("should handle invalid dates", () => {
      const result = formatDate(new Date("invalid"));
      expect(result).toBe("Invalid Date");
    });

    it("should format different locales", () => {
      const date = new Date("2023-10-20T10:30:00Z");
      const result = formatDate(date, "de-DE");
      expect(result).toBe("20. Okt. 2023");
    });
  });

  describe("formatMessage", () => {
    it("should truncate long messages", () => {
      const longMessage =
        "This is a very long message that should be truncated because it exceeds the maximum length";
      const result = formatMessage(longMessage, 20);
      expect(result).toBe("This is a very long...");
    });

    it("should not truncate short messages", () => {
      const shortMessage = "Short message";
      const result = formatMessage(shortMessage, 20);
      expect(result).toBe("Short message");
    });
  });

  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      expect(validateEmail("user@example.com")).toBe(true);
      expect(validateEmail("test.email+tag@domain.co.uk")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(validateEmail("invalid-email")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
      expect(validateEmail("@domain.com")).toBe(false);
    });
  });
});
```

### Custom Hook Testing

```typescript
// hooks/useAuth.spec.ts
import { renderHook, act } from "@testing-library/react-native";
import { useAuth } from "./useAuth";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with no user", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle login correctly", async () => {
    const { result } = renderHook(() => useAuth());

    const mockUser = { id: "1", email: "test@example.com" };
    const mockToken = "mock-token";

    await act(async () => {
      await result.current.login(mockUser, mockToken);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should handle logout correctly", async () => {
    const { result } = renderHook(() => useAuth());

    // First login
    await act(async () => {
      await result.current.login(
        { id: "1", email: "test@example.com" },
        "token",
      );
    });

    // Then logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

## Router Testing Patterns

### Expo Router Testing (Story 1.2)

**Critical Requirement**: Router tests MUST be in `__tests__/` directory, NOT in `app/` directory (Expo Router requirement).

```typescript
// __tests__/navigation.test.tsx - Router tests
import { renderRouter, screen } from 'expo-router/testing-library';
import { View, Text } from 'react-native';

// Mock components for testing
const MockIndexComponent = () => <Text>Home Screen</Text>;
const MockProfileComponent = () => <Text>Profile Screen</Text>;
const MockChannelComponent = () => <Text>Channel Screen</Text>;

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
    const MockUserComponent = () => {
      return <Text>User Details</Text>;
    };

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

  it('should handle nested routes', async () => {
    renderRouter(
      {
        '(app)/_layout': () => <View><Text>App Layout</Text></View>,
        '(app)/teams/[teamId]/channels/[channelId]': MockChannelComponent,
      },
      {
        initialUrl: '/teams/team1/channels/general',
      }
    );

    expect(screen).toHavePathname('/teams/team1/channels/general');
    expect(screen).toHaveSegments(['(app)', 'teams', '[teamId]', 'channels', '[channelId]']);
  });

  it('should handle navigation actions', async () => {
    const MockNavigationComponent = () => {
      const router = useRouter();

      return (
        <View>
          <Text>Navigation Component</Text>
          <Button
            title="Go to Profile"
            onPress={() => router.push('/profile')}
          />
        </View>
      );
    };

    renderRouter(
      {
        index: MockNavigationComponent,
        'profile': MockProfileComponent,
      },
      {
        initialUrl: '/',
      }
    );

    const navigateButton = screen.getByText('Go to Profile');
    fireEvent.press(navigateButton);

    await waitFor(() => {
      expect(screen).toHavePathname('/profile');
    });
  });
});
```

### Router Testing Guidelines

#### Navigation Test Patterns

- **Route Resolution**: Test that URLs resolve to correct components
- **Parameter Handling**: Test dynamic route parameters
- **Navigation Actions**: Test programmatic navigation
- **Route Guards**: Test protected routes and authentication
- **Deep Linking**: Test external URL handling

#### Router Test Structure

```typescript
describe("Router Feature", () => {
  describe("Route Resolution", () => {
    // Test route matching
  });

  describe("Parameter Handling", () => {
    // Test dynamic segments
  });

  describe("Navigation Actions", () => {
    // Test programmatic navigation
  });
});
```

## Storybook Integration (Story 1.3)

### Storybook Configuration

#### Main Configuration (.rnstorybook/main.ts)

```typescript
import { StorybookConfig } from "@storybook/react-native";

const main: StorybookConfig = {
  stories: ["../src/components/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-ondevice-controls",
    "@storybook/addon-ondevice-actions",
  ],
  framework: {
    name: "@storybook/react-native",
    options: {},
  },
  docs: {
    autodocs: true,
  },
};

export default main;
```

#### Preview Configuration (.rnstorybook/preview.tsx)

```typescript
import React from 'react';
import { Preview } from '@storybook/react-native';
import { I18nextProvider } from 'react-i18next';
import { UnistylesRuntime, UnistylesProvider } from 'react-native-unistyles';
import { theme } from '../src/theme';
import i18n from '../src/i18next';

// Configure Unistyles for Storybook
UnistylesRuntime.setTheme('light');
UnistylesRuntime.setRootViewBackgroundColor(theme.light.colors.centerChannelBg);

const preview: Preview = {
  decorators: [
    (Story) => (
      <UnistylesProvider>
        <I18nextProvider i18n={i18n}>
          <Story />
        </I18nextProvider>
      </UnistylesProvider>
    ),
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
```

### Component Story Patterns

#### Basic Component Stories

```typescript
// Button/Button.stories.tsx - Component stories
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { action } from '@storybook/addon-actions';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    isLoading: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    titleKey: 'common.save',
    variant: 'primary',
    onPress: action('primary-clicked'),
  },
};

export const Secondary: Story = {
  args: {
    titleKey: 'common.cancel',
    variant: 'secondary',
    onPress: action('secondary-clicked'),
  },
};

export const Danger: Story = {
  args: {
    titleKey: 'common.delete',
    variant: 'danger',
    onPress: action('danger-clicked'),
  },
};

export const Disabled: Story = {
  args: {
    titleKey: 'common.save',
    variant: 'primary',
    disabled: true,
    onPress: action('disabled-clicked'),
  },
};

export const Loading: Story = {
  args: {
    titleKey: 'common.loading',
    variant: 'primary',
    isLoading: true,
    onPress: action('loading-clicked'),
  },
};

export const AllSizes: Story = {
  render: (args) => (
    <View style={{ gap: 16 }}>
      <Button {...args} size="small" titleKey="common.save" />
      <Button {...args} size="medium" titleKey="common.save" />
      <Button {...args} size="large" titleKey="common.save" />
    </View>
  ),
  args: {
    variant: 'primary',
    onPress: action('size-clicked'),
  },
};
```

#### Complex Component Stories

```typescript
// MessageList/MessageList.stories.tsx - Complex component stories
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { action } from '@storybook/addon-actions';
import { MessageList } from './MessageList';

const mockMessages = [
  {
    id: '1',
    content: 'Hello everyone!',
    userId: 'user1',
    userName: 'John Doe',
    timestamp: new Date('2023-10-20T10:30:00Z'),
    edited: false,
  },
  {
    id: '2',
    content: 'How are you doing today?',
    userId: 'user2',
    userName: 'Jane Smith',
    timestamp: new Date('2023-10-20T10:31:00Z'),
    edited: false,
  },
  {
    id: '3',
    content: 'I just finished the new feature! 🎉',
    userId: 'user1',
    userName: 'John Doe',
    timestamp: new Date('2023-10-20T10:32:00Z'),
    edited: true,
  },
];

const meta: Meta<typeof MessageList> = {
  title: 'Chat/MessageList',
  component: MessageList,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    messages: {
      control: { type: 'object' },
    },
    isLoading: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    messages: mockMessages,
    onEditMessage: action('edit-message'),
    onDeleteMessage: action('delete-message'),
    onReplyMessage: action('reply-message'),
  },
};

export const Empty: Story = {
  args: {
    messages: [],
    onEditMessage: action('edit-message'),
    onDeleteMessage: action('delete-message'),
    onReplyMessage: action('reply-message'),
  },
};

export const Loading: Story = {
  args: {
    messages: [],
    isLoading: true,
    onEditMessage: action('edit-message'),
    onDeleteMessage: action('delete-message'),
    onReplyMessage: action('reply-message'),
  },
};

export const SingleMessage: Story = {
  args: {
    messages: [mockMessages[0]],
    onEditMessage: action('edit-message'),
    onDeleteMessage: action('delete-message'),
    onReplyMessage: action('reply-message'),
  },
};

export const ManyMessages: Story = {
  args: {
    messages: Array.from({ length: 50 }, (_, i) => ({
      id: `msg-${i}`,
      content: `This is message number ${i + 1}`,
      userId: `user${(i % 3) + 1}`,
      userName: ['John Doe', 'Jane Smith', 'Bob Johnson'][i % 3],
      timestamp: new Date(Date.now() - (50 - i) * 60000),
      edited: i % 7 === 0,
    })),
    onEditMessage: action('edit-message'),
    onDeleteMessage: action('delete-message'),
    onReplyMessage: action('reply-message'),
  },
};
```

### Storybook Development Workflow

#### Environment Configuration

```bash
# .env.local - Enable storybook access
EXPO_PUBLIC_ENVIRONMENT=storybook

# package.json scripts
{
  "scripts": {
    "start": "expo start",
    "storybook": "EXPO_PUBLIC_ENVIRONMENT='storybook' expo start",
    "storybook:web": "start-storybook -p 6006",
    "build-storybook": "build-storybook"
  }
}
```

#### App Route Integration (apps/v2/src/app/storybook.tsx)

```typescript
// app/storybook.tsx - Storybook route integration
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function StorybookRoute() {
  const router = useRouter();

  useEffect(() => {
    // Only allow access in storybook environment
    if (process.env.EXPO_PUBLIC_ENVIRONMENT !== 'storybook') {
      router.replace('/');
      return;
    }
  }, [router]);

  if (process.env.EXPO_PUBLIC_ENVIRONMENT !== 'storybook') {
    return null;
  }

  // Import Storybook UI dynamically
  const StorybookUI = require('../../.rnstorybook').default;
  return <StorybookUI />;
}
```

#### Layout Protection (apps/v2/src/app/\_layout.tsx)

```typescript
// _layout.tsx - Protect storybook route
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />

      {/* Storybook route - protected by environment variable */}
      {process.env.EXPO_PUBLIC_ENVIRONMENT === 'storybook' && (
        <Stack.Screen
          name="storybook"
          options={{
            title: 'Storybook',
            presentation: 'fullScreenModal'
          }}
        />
      )}
    </Stack>
  );
}
```

## Integration Testing

### API Integration Tests

```typescript
// __tests__/integration/api.test.ts
import { MattermostApiClient } from "../../src/services/api/MattermostApiClient";

// Mock fetch for integration tests
global.fetch = jest.fn();

describe("API Integration", () => {
  let apiClient: MattermostApiClient;

  beforeEach(() => {
    apiClient = new MattermostApiClient("https://test-server.com");
    (fetch as jest.Mock).mockClear();
  });

  describe("Authentication", () => {
    it("should login successfully with valid credentials", async () => {
      const mockResponse = {
        token: "mock-token",
        user: { id: "1", email: "test@example.com" },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.login("test@example.com", "password");

      expect(fetch).toHaveBeenCalledWith(
        "https://test-server.com/api/v4/users/login",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            login_id: "test@example.com",
            password: "password",
          }),
        }),
      );

      expect(result).toEqual(mockResponse);
    });

    it("should handle login failure", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(
        apiClient.login("test@example.com", "wrong-password"),
      ).rejects.toThrow("API Error: 401");
    });
  });

  describe("Teams", () => {
    it("should fetch user teams", async () => {
      const mockTeams = [
        { id: "team1", name: "Team 1", display_name: "Team One" },
        { id: "team2", name: "Team 2", display_name: "Team Two" },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTeams),
      });

      apiClient.setToken("mock-token");
      const result = await apiClient.getTeams();

      expect(fetch).toHaveBeenCalledWith(
        "https://test-server.com/api/v4/users/me/teams",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        }),
      );

      expect(result).toEqual(mockTeams);
    });
  });
});
```

### Authentication Flow Integration Tests

```typescript
// __tests__/integration/auth.test.ts
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { LoginForm } from '../../src/components/forms/LoginForm/LoginForm';
import i18n from '../../src/i18nextForTests';

// Mock API client
jest.mock('../../src/services/api/MattermostApiClient');

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </I18nextProvider>
  );
}

describe('Authentication Flow', () => {
  it('should complete login flow successfully', async () => {
    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const submitButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Welcome!')).toBeTruthy();
    });
  });

  it('should handle login errors', async () => {
    // Mock API failure
    const mockApiClient = require('../../src/services/api/MattermostApiClient');
    mockApiClient.MattermostApiClient.mockImplementation(() => ({
      login: jest.fn().mockRejectedValue(new Error('Invalid credentials')),
    }));

    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const submitButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrong-password');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });
});
```

## End-to-End Testing

### E2E Testing Setup

#### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./__tests__/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "Desktop App",
      testDir: "./__tests__/e2e/desktop",
      use: {
        // Tauri-specific configuration
      },
    },
    {
      name: "Web App",
      testDir: "./__tests__/e2e/web",
      use: {
        // Web-specific configuration
      },
    },
  ],
  webServer: {
    command: "pnpm start",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

#### Authentication E2E Test

```typescript
// __tests__/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should login successfully", async ({ page }) => {
    await page.goto("/");

    // Should redirect to login if not authenticated
    await expect(page).toHaveURL("/login");

    // Fill login form
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');

    // Should redirect to main app
    await expect(page).toHaveURL("/app");
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "wrongpassword");
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      "Invalid credentials",
    );
  });

  test("should logout successfully", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL("/app");

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    await expect(page).toHaveURL("/login");
  });
});
```

#### Chat Functionality E2E Test

```typescript
// __tests__/e2e/chat.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Chat Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL("/app");
  });

  test("should send a message", async ({ page }) => {
    // Navigate to a channel
    await page.click('[data-testid="channel-general"]');

    // Type and send message
    const messageInput = page.locator('[data-testid="message-input"]');
    await messageInput.fill("Hello from E2E test!");
    await page.keyboard.press("Enter");

    // Verify message appears
    await expect(page.locator('[data-testid="message-list"]')).toContainText(
      "Hello from E2E test!",
    );
  });

  test("should edit a message", async ({ page }) => {
    // Send a message first
    await page.click('[data-testid="channel-general"]');
    const messageInput = page.locator('[data-testid="message-input"]');
    await messageInput.fill("Original message");
    await page.keyboard.press("Enter");

    // Edit the message
    const lastMessage = page.locator('[data-testid="message-item"]').last();
    await lastMessage.hover();
    await lastMessage.locator('[data-testid="edit-button"]').click();

    const editInput = page.locator('[data-testid="edit-input"]');
    await editInput.fill("Edited message");
    await page.keyboard.press("Enter");

    // Verify message was edited
    await expect(page.locator('[data-testid="message-list"]')).toContainText(
      "Edited message",
    );
    await expect(page.locator('[data-testid="message-list"]')).toContainText(
      "(edited)",
    );
  });

  test("should switch between channels", async ({ page }) => {
    // Start in general channel
    await page.click('[data-testid="channel-general"]');
    await expect(page.locator('[data-testid="channel-header"]')).toContainText(
      "General",
    );

    // Switch to random channel
    await page.click('[data-testid="channel-random"]');
    await expect(page.locator('[data-testid="channel-header"]')).toContainText(
      "Random",
    );

    // Verify URL changed
    await expect(page).toHaveURL("/app/teams/team1/channels/random");
  });
});
```

## Performance Testing

### Performance Test Configuration

```typescript
// __tests__/performance/component-render.test.ts
import { render } from '@testing-library/react-native';
import { MessageList } from '../../src/components/chat/MessageList/MessageList';

describe('Performance Tests', () => {
  const generateLargeMessageList = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `msg-${i}`,
      content: `Message ${i}`,
      userId: `user${i % 10}`,
      userName: `User ${i % 10}`,
      timestamp: new Date(Date.now() - i * 1000),
      edited: false,
    }));
  };

  it('should render large message list within acceptable time', () => {
    const messages = generateLargeMessageList(1000);

    const startTime = performance.now();
    render(<MessageList messages={messages} />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;

    // Should render in less than 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('should handle frequent updates efficiently', () => {
    const messages = generateLargeMessageList(100);
    const { rerender } = render(<MessageList messages={messages} />);

    const startTime = performance.now();

    // Simulate 10 rapid updates
    for (let i = 0; i < 10; i++) {
      const newMessages = [...messages, {
        id: `new-msg-${i}`,
        content: `New message ${i}`,
        userId: 'user1',
        userName: 'User 1',
        timestamp: new Date(),
        edited: false,
      }];
      rerender(<MessageList messages={newMessages} />);
    }

    const endTime = performance.now();
    const updateTime = endTime - startTime;

    // All updates should complete in less than 50ms
    expect(updateTime).toBeLessThan(50);
  });
});
```

### Memory Leak Detection

```typescript
// __tests__/performance/memory-leaks.test.ts
import { render, cleanup } from '@testing-library/react-native';
import { ScrollTracker } from '../../src/components/common/ScrollTracker/ScrollTracker';

describe('Memory Leak Tests', () => {
  afterEach(() => {
    cleanup();
  });

  it('should clean up event listeners properly', () => {
    const addEventListenerSpy = jest.spyOn(Element.prototype, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(Element.prototype, 'removeEventListener');

    const { unmount } = render(<ScrollTracker />);

    // Verify listeners were added
    expect(addEventListenerSpy).toHaveBeenCalled();

    unmount();

    // Verify listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(addEventListenerSpy.mock.calls.length);

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
```

## Test Coverage and Quality Gates

### Coverage Requirements

- **Unit Tests**: 80% line coverage minimum
- **Component Tests**: 90% component coverage minimum
- **Integration Tests**: 70% critical path coverage
- **E2E Tests**: 100% user journey coverage

### Coverage Configuration

```json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.stories.{ts,tsx}",
      "!src/**/*.spec.{ts,tsx}",
      "!src/**/types.ts",
      "!src/**/index.ts"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 80,
        "lines": 80,
        "statements": 80
      },
      "src/components/": {
        "branches": 80,
        "functions": 90,
        "lines": 90,
        "statements": 90
      },
      "src/utils/": {
        "branches": 90,
        "functions": 95,
        "lines": 95,
        "statements": 95
      }
    }
  }
}
```

### Quality Gates

#### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "jest --bail --findRelatedTests --passWithNoTests"
    ]
  }
}
```

#### CI/CD Pipeline Gates

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test:ci
      - run: pnpm test:e2e

      # Coverage reporting
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
```

## Testing Best Practices

### Test Organization Best Practices

1. **Descriptive Test Names**: Use clear, descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification phases
3. **Test Isolation**: Each test should be independent and not rely on other tests
4. **Mock External Dependencies**: Mock APIs, file systems, and other external services
5. **Test Edge Cases**: Include tests for error conditions, edge cases, and boundary values

### Test Maintenance

1. **Regular Review**: Review and update tests when requirements change
2. **Refactor Tests**: Keep test code clean and maintainable
3. **Remove Obsolete Tests**: Delete tests that no longer provide value
4. **Update Dependencies**: Keep testing libraries and tools up to date
5. **Performance Monitoring**: Monitor test execution time and optimize slow tests

### Common Testing Pitfalls

#### ❌ Avoid These Patterns

```typescript
// Don't test implementation details
it('should call useState hook', () => {
  const useStateSpy = jest.spyOn(React, 'useState');
  render(<Component />);
  expect(useStateSpy).toHaveBeenCalled();
});

// Don't test library internals
it('should render View component', () => {
  const { getByTestId } = render(<Component />);
  expect(getByTestId('container').type).toBe('View');
});

// Don't test styles directly in unit tests
it('should have correct background color', () => {
  const { getByTestId } = render(<Component />);
  expect(getByTestId('button').props.style.backgroundColor).toBe('#007bff');
});
```

#### ✅ Follow These Patterns

```typescript
// Test behavior, not implementation
it('should update counter when button is pressed', () => {
  const { getByText, getByTestId } = render(<Counter />);
  const button = getByText('Increment');
  const counter = getByTestId('counter-value');

  fireEvent.press(button);

  expect(counter).toHaveTextContent('1');
});

// Test user interactions
it('should submit form when enter key is pressed', () => {
  const mockSubmit = jest.fn();
  const { getByPlaceholderText } = render(<Form onSubmit={mockSubmit} />);
  const input = getByPlaceholderText('Enter message');

  fireEvent.changeText(input, 'Hello');
  fireEvent(input, 'submitEditing');

  expect(mockSubmit).toHaveBeenCalledWith('Hello');
});

// Test accessibility
it('should be accessible to screen readers', () => {
  const { getByLabelText } = render(<Button titleKey="common.save" />);
  const button = getByLabelText('Save');

  expect(button).toBeTruthy();
  expect(button.props.accessibilityRole).toBe('button');
});
```

## Testing Workflow Integration

### Development Workflow

1. **Write Test First**: For new features, write tests before implementation (TDD)
2. **Run Tests Locally**: Use `pnpm test` during development
3. **Check Coverage**: Monitor coverage reports and aim for threshold compliance
4. **Update Stories**: Create or update Storybook stories for new components
5. **Run E2E Tests**: Test critical user journeys before committing

### Code Review Process

1. **Test Coverage**: Verify new code includes appropriate tests
2. **Test Quality**: Review test logic and assertions
3. **Story Documentation**: Ensure components have corresponding Storybook stories
4. **Performance Impact**: Check for potential performance regressions
5. **Accessibility**: Verify accessibility testing is included

### Continuous Integration

1. **Automated Testing**: All tests run automatically on PR creation
2. **Coverage Reports**: Coverage data is collected and reported
3. **Quality Gates**: PR cannot merge without passing all tests
4. **Visual Regression**: Storybook visual testing in CI pipeline
5. **Performance Monitoring**: Track test execution time and optimize as needed

---

**Last Updated**: 2025-10-20  
**Version**: 1.0  
**Applies To**: Mattermost Platform Migration Testing Strategy (Stories 1.2 & 1.3)

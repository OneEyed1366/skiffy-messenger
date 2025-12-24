# Source Tree Structure

## Overview

This document describes the source tree organization for the Mattermost Platform Migration project, covering both the legacy Electron system and the modern Expo + Tauri architecture.

## Repository Root Structure

```
skiffy-chat/                          # Repository root
├── vendor/                           # Legacy systems (maintenance mode)
│   └── desktop/                      # 🔴 Electron v6.1.0 (DO NOT MODIFY)
├── apps/                            # Modern applications (active development)
│   └── v2/                          # 🚀 Expo + Tauri v1.0 (PRIMARY TARGET)
├── packages/                        # Shared packages (future use)
├── docs/                            # Documentation
│   ├── architecture/                # Sharded architecture documents
│   ├── llms/                        # LLM-specific documentation
│   ├── prd.md                       # Product Requirements Document
│   └── *.md                         # Other documentation
├── .bmad-core/                      # BMAD development methodology
├── .claude/                         # Claude AI command definitions
├── .clinerules/                     # Cline AI agent rules
├── package.json                     # Monorepo workspace root
├── pnpm-workspace.yaml              # pnpm workspace configuration
├── pnpm-lock.yaml                   # Dependency lock file
└── README.md                        # Project overview
```

## Legacy System Structure (vendor/desktop)

### Overview

- **Status**: 🔴 Read-only maintenance mode
- **Purpose**: Reference for migration, critical bug fixes only
- **Technology**: Electron 38.2.1 + React 17.0.2 + SCSS + Webpack

```
vendor/desktop/                       # Electron application root
├── src/                             # Source code
│   ├── main/                        # Electron main process (Node.js)
│   │   ├── app/                     # Application lifecycle management
│   │   │   ├── app.ts               # Main application entry
│   │   │   ├── config.ts            # Application configuration
│   │   │   ├── initialize.ts        # App initialization logic
│   │   │   ├── intercom.ts          # IPC communication
│   │   │   ├── utils.ts             # Main process utilities
│   │   │   └── windows.ts           # Window management
│   │   ├── server/                  # Server integration
│   │   │   ├── serverAPI.ts         # Mattermost server API client
│   │   │   └── serverInfo.ts        # Server information management
│   │   ├── AppVersionManager.ts     # Application version handling
│   │   ├── AutoLauncher.ts          # System startup integration
│   │   ├── CriticalErrorHandler.ts  # Error handling and recovery
│   │   ├── UserActivityMonitor.ts   # User activity tracking
│   │   ├── autoUpdater.ts           # Application auto-update
│   │   ├── constants.ts             # Application constants
│   │   ├── contextMenu.ts           # Right-click context menus
│   │   ├── downloadsManager.ts      # File download management
│   │   ├── i18nManager.ts           # Internationalization manager
│   │   ├── performanceMonitor.ts    # Performance monitoring
│   │   ├── secureStorage.ts         # Secure credential storage
│   │   ├── themeManager.ts          # Theme switching logic
│   │   └── utils.ts                 # Shared utilities
│   │
│   ├── renderer/                    # Frontend React application
│   │   ├── components/              # React UI components
│   │   │   ├── BasePage/            # Base page layout
│   │   │   ├── Carousel/            # Image/content carousel
│   │   │   ├── ConfigureServer/     # Server configuration UI
│   │   │   ├── Header/              # Application header
│   │   │   ├── LoadingAnimation/    # Loading state components
│   │   │   ├── NewServerModal/      # Add server modal
│   │   │   ├── SaveButton/          # Reusable save button
│   │   │   ├── ServerDropdownButton/ # Server selection dropdown
│   │   │   ├── TopBar/              # Top navigation bar
│   │   │   ├── UrlView/             # URL display/edit component
│   │   │   ├── WelcomeScreen/       # Onboarding screens
│   │   │   ├── WithTooltip/         # Tooltip wrapper component
│   │   │   ├── ConnectionErrorView.tsx # Connection error states
│   │   │   ├── DestructiveConfirmModal.tsx # Confirmation dialogs
│   │   │   └── MainPage.tsx         # Main application page
│   │   │
│   │   ├── css/                     # SCSS styling system
│   │   │   ├── base/                # 🎯 MIGRATED: Base styles and variables
│   │   │   │   ├── _css_variables.scss # CSS custom properties (→ theme.ts)
│   │   │   │   ├── _variables.scss  # SCSS variables (→ theme.ts)
│   │   │   │   ├── _typography.scss # Font definitions (→ theme.ts)
│   │   │   │   ├── _buttons.scss    # Button styles (→ theme.ts)
│   │   │   │   └── _mixins.scss     # SCSS mixins (→ theme.ts)
│   │   │   ├── components/          # Component-specific styles
│   │   │   └── index.scss           # Main stylesheet entry
│   │   │
│   │   ├── constants.ts             # Frontend constants
│   │   ├── downloadsDropdownMenu.tsx # Downloads UI
│   │   ├── dropdown.tsx             # Generic dropdown component
│   │   ├── index.tsx                # Renderer entry point
│   │   ├── intl_provider.tsx        # 🎯 MIGRATED: react-intl provider (→ i18next)
│   │   ├── notificationSounds.ts    # Notification audio
│   │   └── popout.tsx               # Popout window management
│   │
│   ├── common/                      # Shared code between main and renderer
│   │   ├── config/                  # Configuration definitions
│   │   ├── utils/                   # Shared utility functions
│   │   └── types/                   # TypeScript type definitions
│   │
│   └── types/                       # Global TypeScript definitions
│       ├── certificate.ts           # Certificate handling types
│       ├── config.ts                # Configuration types
│       └── *.ts                     # Other type definitions
│
├── e2e/                             # End-to-end tests
├── api-types/                       # Desktop API type definitions
├── webpack.config.*.js              # Webpack build configurations
├── package.json                     # Dependencies and scripts
└── README.md                        # Legacy system documentation
```

## Modern System Structure (apps/v2)

### Overview

- **Status**: ✅ Active development target
- **Purpose**: Production system for Mattermost desktop application
- **Technology**: Expo ~54.0.13 + Tauri 2.1.0 + React 19.1.0 + Unistyles

```
apps/v2/                             # Modern application root
├── src/                             # TypeScript source code
│   ├── app/                         # Expo Router application structure
│   │   ├── _layout.tsx              # Root layout component
│   │   ├── +html.tsx                # Web-specific HTML wrapper
│   │   ├── (tabs)/                  # Tab-based navigation (future)
│   │   └── modal.tsx                # Modal screens (future)
│   │
│   ├── components/                  # React Native UI components (Component-Per-Folder)
│   │   ├── common/                  # Shared/reusable components
│   │   │   ├── Button/              # Button component folder
│   │   │   │   ├── Button.tsx       # Main Button component
│   │   │   │   ├── styles.ts        # Button Unistyles with UnistylesVariant types
│   │   │   │   ├── Button.spec.tsx  # Jest component tests
│   │   │   │   ├── Button.stories.tsx # Storybook stories
│   │   │   │   ├── types.ts         # Button-specific types
│   │   │   │   └── index.ts         # Barrel export
│   │   │   ├── Input/               # Input component folder
│   │   │   │   ├── Input.tsx        # Main Input component
│   │   │   │   ├── styles.ts        # Input Unistyles
│   │   │   │   ├── InputLabel.tsx   # Sub-component for labels
│   │   │   │   ├── InputError.tsx   # Sub-component for error states
│   │   │   │   ├── Input.spec.tsx   # Jest tests
│   │   │   │   ├── Input.stories.tsx # Storybook stories
│   │   │   │   ├── types.ts         # Input-specific types
│   │   │   │   └── index.ts         # Barrel export
│   │   │   └── Modal/               # Modal component folder
│   │   │       ├── Modal.tsx        # Main Modal component
│   │   │       ├── styles.ts        # Modal Unistyles
│   │   │       ├── ModalHeader.tsx  # Modal header sub-component
│   │   │       ├── ModalFooter.tsx  # Modal footer sub-component
│   │   │       ├── Modal.spec.tsx   # Jest tests
│   │   │       ├── Modal.stories.tsx # Storybook stories
│   │   │       ├── types.ts         # Modal-specific types
│   │   │       └── index.ts         # Barrel export
│   │   │
│   │   ├── chat/                    # Chat-specific components
│   │   │   ├── MessageList/         # Message list component folder
│   │   │   │   ├── MessageList.tsx  # Main component
│   │   │   │   ├── styles.ts        # Unistyles
│   │   │   │   ├── MessageItem.tsx  # Individual message sub-component
│   │   │   │   ├── MessageList.spec.tsx # Jest tests
│   │   │   │   ├── MessageList.stories.tsx # Storybook stories
│   │   │   │   ├── types.ts         # Message types
│   │   │   │   └── index.ts         # Barrel export
│   │   │   ├── MessageInput/        # Message input component folder
│   │   │   │   ├── MessageInput.tsx # Main component
│   │   │   │   ├── styles.ts        # Unistyles
│   │   │   │   ├── MessageInput.spec.tsx # Jest tests
│   │   │   │   ├── MessageInput.stories.tsx # Storybook stories
│   │   │   │   ├── types.ts         # Input types
│   │   │   │   └── index.ts         # Barrel export
│   │   │   └── ChannelList/         # Channel list component folder
│   │   │       ├── ChannelList.tsx  # Main component
│   │   │       ├── styles.ts        # Unistyles
│   │   │       ├── ChannelItem.tsx  # Individual channel sub-component
│   │   │       ├── ChannelList.spec.tsx # Jest tests
│   │   │       ├── ChannelList.stories.tsx # Storybook stories
│   │   │       ├── types.ts         # Channel types
│   │   │       └── index.ts         # Barrel export
│   │   │
│   │   ├── forms/                   # Form-specific components
│   │   │   ├── LoginForm/           # Login form component folder
│   │   │   │   ├── LoginForm.tsx    # Main form component
│   │   │   │   ├── styles.ts        # Form Unistyles
│   │   │   │   ├── LoginForm.spec.tsx # Jest tests
│   │   │   │   ├── LoginForm.stories.tsx # Storybook stories
│   │   │   │   ├── types.ts         # Form types
│   │   │   │   └── index.ts         # Barrel export
│   │   │   └── SettingsForm/        # Settings form component folder
│   │   │       ├── SettingsForm.tsx # Main form component
│   │   │       ├── styles.ts        # Form Unistyles
│   │   │       ├── SettingsForm.spec.tsx # Jest tests
│   │   │       ├── SettingsForm.stories.tsx # Storybook stories
│   │   │       ├── types.ts         # Settings types
│   │   │       └── index.ts         # Barrel export
│   │   │
│   │   └── layout/                  # Layout components
│   │       ├── AppShell/            # Main app shell component folder
│   │       │   ├── AppShell.tsx     # Main shell component
│   │       │   ├── styles.ts        # Shell Unistyles
│   │       │   ├── Sidebar.tsx      # Sidebar sub-component
│   │       │   ├── TopBar.tsx       # Top bar sub-component
│   │       │   ├── AppShell.spec.tsx # Jest tests
│   │       │   ├── types.ts         # Shell types
│   │       │   └── index.ts         # Barrel export
│   │       └── PageLayout/          # Page layout component folder
│   │           ├── PageLayout.tsx   # Main layout component
│   │           ├── styles.ts        # Layout Unistyles
│   │           ├── PageLayout.spec.tsx # Jest tests
│   │           ├── types.ts         # Layout types
│   │           └── index.ts         # Barrel export
│   │
│   ├── locales/                     # ✅ COMPLETE: Internationalization
│   │   ├── en.json                  # English translations (357+ keys)
│   │   ├── de.json                  # German translations
│   │   ├── fr.json                  # French translations
│   │   ├── es.json                  # Spanish translations
│   │   ├── it.json                  # Italian translations
│   │   ├── hu.json                  # Hungarian translations
│   │   ├── nl.json                  # Dutch translations
│   │   ├── pl.json                  # Polish translations
│   │   ├── pt-BR.json               # Portuguese (Brazil) translations
│   │   ├── ro.json                  # Romanian translations
│   │   ├── sv.json                  # Swedish translations
│   │   ├── vi.json                  # Vietnamese translations
│   │   ├── tr.json                  # Turkish translations
│   │   ├── bg.json                  # Bulgarian translations
│   │   ├── ru.json                  # Russian translations
│   │   ├── uk.json                  # Ukrainian translations
│   │   ├── fa.json                  # Persian translations
│   │   ├── ko.json                  # Korean translations
│   │   ├── zh-CN.json               # Chinese (Simplified) translations
│   │   ├── zh-TW.json               # Chinese (Traditional) translations
│   │   ├── ja.json                  # Japanese translations
│   │   ├── en-AU.json               # English (Australia) translations
│   │   └── index.ts                 # Language configuration and types
│   │
│   ├── services/                    # Business logic and API integration
│   │   ├── api/                     # API client implementations
│   │   ├── storage/                 # Local storage management
│   │   ├── notifications/           # Notification handling
│   │   └── *.ts                     # Service implementations
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useTheme.ts              # Theme management hook
│   │   ├── useTranslation.ts        # i18n integration hook
│   │   └── *.ts                     # Custom hooks
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── api.ts                   # API response types
│   │   ├── user.ts                  # User-related types
│   │   ├── navigation.ts            # Navigation types
│   │   └── *.ts                     # Type definition files
│   │
│   ├── utils/                       # Pure utility functions
│   │   ├── formatters.ts            # Data formatting utilities
│   │   ├── validators.ts            # Validation utilities
│   │   ├── constants.ts             # Application constants
│   │   └── *.ts                     # Utility functions
│   │
│   ├── theme.ts                     # ✅ COMPLETE: Unistyles theme system
│   ├── i18next.ts                   # ✅ COMPLETE: i18n configuration
│   └── index.ts                     # Application entry point
│
├── src-tauri/                       # Rust backend (Tauri)
│   ├── src/
│   │   ├── main.rs                  # Tauri application entry point
│   │   ├── commands/                # Tauri command implementations
│   │   │   ├── file_system.rs       # File system operations
│   │   │   ├── notifications.rs     # Desktop notifications
│   │   │   ├── window_management.rs # Window management
│   │   │   └── *.rs                 # Command modules
│   │   ├── utils/                   # Rust utility functions
│   │   └── lib.rs                   # Library root
│   │
│   ├── capabilities/                # Tauri permission system
│   │   ├── default.json             # Default app permissions
│   │   └── *.json                   # Additional permission sets
│   │
│   ├── icons/                       # Application icons
│   │   ├── icon.png                 # Main application icon
│   │   ├── icon.ico                 # Windows icon
│   │   ├── icon.icns                # macOS icon
│   │   └── *.png                    # Various icon sizes
│   │
│   ├── Cargo.toml                   # Rust dependencies and configuration
│   ├── build.rs                     # Build script
│   └── tauri.conf.json              # Tauri configuration
│
├── android/                         # Android native project (future mobile)
│   ├── app/src/main/                # Android app source
│   ├── gradle/                      # Gradle build system
│   ├── build.gradle                 # Android build configuration
│   └── settings.gradle              # Gradle settings
│
├── ios/                             # iOS native project (future mobile)
│   ├── retrievly/                   # iOS app source
│   ├── retrievly.xcodeproj/         # Xcode project
│   ├── Podfile                      # CocoaPods dependencies
│   └── Info.plist                   # iOS app configuration
│
├── assets/                          # Static assets
│   ├── images/                      # Image assets
│   │   ├── icon.png                 # App icon
│   │   ├── splash-icon.png          # Splash screen icon
│   │   └── *.png                    # Other images
│   └── fonts/                       # Custom fonts (if any)
│
├── scripts/                         # Development and build scripts
│   ├── reset-project.js             # Project reset utility
│   └── *.js                         # Other scripts
│
├── __tests__/                       # Global application tests (Story 1.2)
│   ├── navigation.test.tsx          # Expo Router tests using expo-router/testing-library
│   ├── integration/                 # Integration tests
│   │   ├── api.test.ts              # API integration tests
│   │   └── auth.test.ts             # Authentication flow tests
│   └── e2e/                         # End-to-end tests
│       ├── auth.spec.ts             # Authentication E2E tests
│       ├── chat.spec.ts             # Chat functionality E2E tests
│       └── settings.spec.ts         # Settings E2E tests
│
├── .rnstorybook/                    # Storybook React Native configuration (Story 1.3)
│   ├── main.ts                      # Storybook main configuration with components regex
│   ├── preview.tsx                  # Storybook preview with decorators
│   └── index.tsx                    # Storybook entry point
│
├── package.json                     # Dependencies and scripts
├── app.json                         # Expo configuration
├── metro.config.js                  # Metro bundler configuration
├── babel.config.js                  # Babel transpilation configuration
├── tsconfig.json                    # TypeScript configuration
├── eslint.config.js                 # ESLint configuration
└── README.md                        # Modern system documentation
```

## Documentation Structure (docs/)

```
docs/                                # Project documentation
├── architecture/                    # 📁 Sharded architecture documents
│   ├── coding-standards.md          # Development standards and patterns
│   ├── tech-stack.md                # Technology stack definitions
│   ├── source-tree.md               # This document
│   ├── api-design.md                # API architecture (future)
│   ├── security-model.md            # Security architecture (future)
│   ├── performance-strategy.md      # Performance optimization (future)
│   └── deployment-strategy.md       # Deployment and distribution (future)
│
├── llms/                            # LLM-specific documentation
│   ├── unistyles.md                 # Unistyles framework guide
│   ├── tauri.md                     # Tauri framework guide
│   ├── react-compiler.md            # React Compiler optimization guide
│   └── *.md                         # Other LLM guides
│
├── stories/                         # User stories (future)
├── qa/                              # Quality assurance documents (future)
├── prd/                             # Sharded PRD documents (future)
├── prd.md                           # Main Product Requirements Document
├── architecture.md                  # Main architecture document
├── brownfield-architecture.md       # Current state analysis
├── theme-migration.md               # Theme migration documentation
└── *.md                             # Other documentation files
```

## Development Methodology Structure (.bmad-core/)

```
.bmad-core/                          # BMAD development methodology
├── agents/                          # AI agent definitions
│   ├── architect.md                 # System architect agent
│   ├── dev.md                       # Developer agent
│   ├── pm.md                        # Product manager agent
│   ├── qa.md                        # Quality assurance agent
│   └── *.md                         # Other agent definitions
│
├── tasks/                           # Reusable task workflows
│   ├── document-project.md          # Project documentation task
│   ├── create-doc.md                # Document creation task
│   └── *.md                         # Other task definitions
│
├── templates/                       # Document templates
│   ├── architecture-tmpl.yaml       # Architecture document template
│   ├── prd-tmpl.yaml                # PRD document template
│   └── *.yaml                       # Other templates
│
├── checklists/                      # Quality checklists
├── data/                            # Reference data
├── utils/                           # Utility workflows
├── core-config.yaml                 # BMAD configuration
└── *.md                             # BMAD documentation
```

## Source File Organization Patterns

### Component File Structure

**Legacy Pattern (vendor/desktop)**:

```
ComponentName/
├── ComponentName.tsx                # React component
├── ComponentName.scss               # SCSS styles
├── index.ts                         # Barrel export
└── ComponentName.test.ts            # Jest tests
```

**Modern Pattern (apps/v2) - Component-Per-Folder Structure**:

Based on Stories 1.2 (Jest Testing) and 1.3 (Storybook Integration), each component/page should be organized in a separate folder with standardized file structure:

```
ComponentName/                       # Component folder
├── ComponentName.tsx                # Main component file
├── styles.ts                        # Co-located Unistyles with exported styles constant
├── LocalSubComponent.tsx            # Nested sub-components (if ComponentName has complex children)
├── ComponentName.spec.tsx           # Jest component tests (co-located)
├── ComponentName.stories.tsx        # Storybook stories (if applicable)
├── types.ts                         # Component-specific TypeScript types
└── index.ts                         # Barrel export for external consumption
```

**Component File Breakdown**:

- **`ComponentName.tsx`**: Main React component implementation with TypeScript interfaces
- **`styles.ts`**: Co-located Unistyles with exported styles constant and `UnistylesVariant` types
- **`LocalSubComponent.tsx`**: Sub-components specific to this component (if complex)
- **`ComponentName.spec.tsx`**: Jest tests using React Native Testing Library + i18n + theme
- **`ComponentName.stories.tsx`**: Storybook stories demonstrating component states and variations
- **`types.ts`**: Component-specific TypeScript interfaces and types
- **`index.ts`**: Barrel export exposing the main component and necessary types for external use

**Example Implementation**:

```typescript
// Button/styles.ts - Co-located Unistyles
import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  button: (variant: "primary" | "secondary") => ({
    backgroundColor:
      variant === "primary" ? theme.colors.buttonBg : theme.colors.buttonAlt,
    padding: theme.gap(2),
    borderRadius: theme.radius.m,
  }),
  text: {
    color: theme.colors.buttonColor,
    fontWeight: theme.fontWeights.semiBold,
  },
}));

// Export UnistylesVariant for type safety
export type ButtonStyleVariants = Parameters<typeof styles.button>[0];
```

```typescript
// Button/Button.tsx - Main component
import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles, ButtonStyleVariants } from './styles';
import { ButtonProps } from './types';

export function Button({ titleKey, variant = 'primary', onPress, disabled }: ButtonProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      style={styles.button(variant)}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{t(titleKey)}</Text>
    </Pressable>
  );
}
```

```typescript
// Button/Button.spec.tsx - Jest tests with theme and i18n
import { render, fireEvent } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18nextForTests';
import { Button } from './Button';

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
});
```

```typescript
// Button/Button.stories.tsx - Storybook stories
import type { Meta, StoryObj } from '@storybook/react';
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
```

### Service File Structure

**Modern Pattern (apps/v2)**:

```
services/
├── api/
│   ├── MattermostAPI.ts             # Main API client
│   ├── types.ts                     # API type definitions
│   └── endpoints.ts                 # API endpoint definitions
├── storage/
│   ├── SecureStorage.ts             # Secure credential storage
│   ├── UserPreferences.ts           # User preference management
│   └── Cache.ts                     # Application cache management
└── notifications/
    ├── NotificationService.ts       # Desktop notifications
    └── types.ts                     # Notification types
```

## Key Migration Mappings

### File Migration Status

**✅ COMPLETED MIGRATIONS**:

- `vendor/desktop/src/renderer/css/base/` → `apps/v2/src/theme.ts`
- `vendor/desktop/src/main/i18nManager.ts` → `apps/v2/src/i18next.ts`
- `vendor/desktop/src/renderer/intl_provider.tsx` → `apps/v2/src/locales/`

**🔄 IN PROGRESS MIGRATIONS**:

- `vendor/desktop/src/renderer/components/` → `apps/v2/src/components/`
- Component SCSS files → Unistyles StyleSheet definitions
- react-intl hooks → react-i18next hooks

**🔄 PENDING MIGRATIONS**:

- `vendor/desktop/src/main/` APIs → `apps/v2/src-tauri/src/commands/`
- Electron IPC → Tauri commands
- Node.js file operations → Rust file operations

### Directory Mapping

| Legacy Location                           | Modern Location           | Status         |
| ----------------------------------------- | ------------------------- | -------------- |
| `vendor/desktop/src/renderer/css/base/`   | `apps/v2/src/theme.ts`    | ✅ Complete    |
| `vendor/desktop/src/main/i18nManager.ts`  | `apps/v2/src/i18next.ts`  | ✅ Complete    |
| `vendor/desktop/src/renderer/components/` | `apps/v2/src/components/` | 🔄 In Progress |
| `vendor/desktop/src/main/`                | `apps/v2/src-tauri/src/`  | 🔄 Pending     |
| `vendor/desktop/src/common/`              | `apps/v2/src/types/`      | 🔄 Pending     |

## Build Output Structure

### Legacy Build Output (vendor/desktop)

```
dist/                                # Webpack build output
├── main.js                          # Electron main process
├── preload.js                       # Preload scripts
├── renderer/                        # Frontend assets
└── assets/                          # Static assets

release/                             # Electron-builder output
├── win/                             # Windows distributables
├── mac/                             # macOS distributables
└── linux/                          # Linux distributables
```

### Modern Build Output (apps/v2)

```
dist/                                # Expo static output
├── _expo/                           # Expo framework files
├── assets/                          # Optimized assets
├── static/                          # Static assets
├── index.html                       # Web entry point
└── *.js                             # Bundled JavaScript

src-tauri/target/                    # Tauri build output
├── debug/                           # Development builds
├── release/                         # Production builds
│   ├── bundle/                      # Platform-specific bundles
│   │   ├── dmg/                     # macOS disk images
│   │   ├── msi/                     # Windows installers
│   │   └── deb/                     # Linux packages
│   └── retrievly                    # Executable binary
```

## Development Workflow Directories

### Active Development Focus

**Primary Development Target**: `apps/v2/`

- All new features and components
- Modern technology stack
- Cross-platform optimization
- Future mobile preparation

**Reference Only**: `vendor/desktop/`

- Legacy component analysis
- Migration pattern identification
- Critical bug fixes only
- No new feature development

### Testing Directories

**Legacy Testing**:

```
vendor/desktop/
├── src/**/*.test.ts                 # Unit tests
├── e2e/                             # End-to-end tests
└── __tests__/                       # Test utilities
```

**Modern Testing** (Based on Stories 1.2 & 1.3):

```
apps/v2/
├── src/components/                  # Component-per-folder with co-located tests
│   ├── Button/
│   │   ├── Button.spec.tsx          # Jest + React Native Testing Library tests
│   │   ├── Button.stories.tsx       # Storybook stories
│   │   └── ...
│   └── MessageList/
│       ├── MessageList.spec.tsx     # Component tests with i18n and theme
│       ├── MessageList.stories.tsx  # Storybook stories
│       └── ...
├── src/utils/
│   ├── formatters.spec.ts           # Co-located unit tests
│   └── validators.spec.ts           # Co-located unit tests
├── __tests__/                       # Global application tests
│   ├── navigation.test.tsx          # Expo Router tests (REQUIRED: not in app/ directory)
│   ├── integration/                 # Cross-cutting integration tests
│   └── e2e/                         # Cross-platform E2E tests
└── .rnstorybook/                    # Storybook configuration
    ├── main.ts                      # Storybook config with component stories
    └── preview.tsx                  # Storybook preview with theme/i18n providers
```

**Key Testing Patterns (Story 1.2)**:

- **Jest Configuration**: jest-expo preset with React Native Testing Library
- **Co-located Tests**: `.spec.tsx` files alongside components and `.spec.ts` for utilities
- **Theme Testing**: Components tested with react-native-unistyles/mocks + actual theme
- **i18n Testing**: Real i18next configuration (no stubbing) with I18nextProvider wrapper
- **Router Testing**: Must be in `__tests__/` directory, not in `app/` (Expo Router requirement)

**Key Storybook Patterns (Story 1.3)**:

- **Component Stories**: `.stories.tsx` files co-located with components
- **Environment Control**: Storybook only accessible when `EXPO_PUBLIC_ENVIRONMENT='storybook'`
- **Route Integration**: `/storybook` route accessible within the app during development

---

**Last Updated**: 2025-10-19  
**Version**: 1.0  
**Applies To**: Mattermost Platform Migration Source Tree Organization

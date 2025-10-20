# Technology Stack

## Overview

This document defines the technology stack for the Mattermost Platform Migration project, covering both the legacy Electron system and the modern Expo + Tauri architecture.

## System Comparison

### Legacy System (vendor/desktop)

| Component                | Technology         | Version  | Status                           |
| ------------------------ | ------------------ | -------- | -------------------------------- |
| **Runtime**              | Electron           | 38.2.1   | 🔴 Legacy - Maintenance Only     |
| **Frontend Framework**   | React              | 17.0.2   | 🔴 Legacy - Being Migrated       |
| **DOM Integration**      | React DOM          | 17.0.2   | 🔴 Legacy - Being Migrated       |
| **Styling**              | SCSS + Webpack     | 1.49.11  | 🔴 Legacy - Being Migrated       |
| **Build System**         | Webpack            | 5.100.2  | 🔴 Legacy - Being Migrated       |
| **Internationalization** | react-intl         | 6.6.2    | 🔴 Legacy - Being Migrated       |
| **Backend APIs**         | Node.js (Electron) | >=18.0.0 | 🔴 Legacy - Being Migrated       |
| **Validation**           | joi                | 17.12.2  | 🔴 Legacy - Being Migrated       |
| **Package Manager**      | npm/yarn           | Mixed    | 🔴 Legacy - Standardized to pnpm |

### Modern System (apps/v2)

| Component                | Technology                                  | Version                   | Status                          |
| ------------------------ | ------------------------------------------- | ------------------------- | ------------------------------- |
| **Runtime**              | Expo + Tauri                                | ~54.0.13 + 2.1.0          | ✅ Active Development           |
| **Frontend Framework**   | React                                       | 19.1.0                    | ✅ Latest with React Compiler   |
| **Cross-Platform**       | React Native + React Native Web             | 0.81.4 + ~0.21.2          | ✅ Unified Platform Strategy    |
| **Styling**              | react-native-unistyles                      | 3.0.15                    | ✅ TypeScript-first Styling     |
| **Build System**         | Expo Metro                                  | Built-in                  | ✅ Simplified Build Process     |
| **Internationalization** | i18next + react-i18next + expo-localization | 25.6.0 + 16.1.0 + ~17.0.7 | ✅ Modern i18n Stack            |
| **Backend APIs**         | Rust (Tauri)                                | 2.1.0                     | ✅ Secure Native Backend        |
| **Validation**           | valibot                                     | 1.1.0                     | ✅ TypeScript-first Validation  |
| **Package Manager**      | pnpm                                        | Latest                    | ✅ Standardized for Performance |
| **TypeScript**           | TypeScript                                  | ~5.9.2                    | ✅ Strict Mode Enabled          |

## Platform Strategy

### Cross-Platform Architecture

**Expo-based Unified Development**:

- **Desktop (Current)**: Expo Web (react-native-web) static output + Tauri wrapper
- **Web (Current)**: Expo Web (react-native-web) static output for browser deployment
- **Mobile (Future)**: Native Expo apps (iOS/Android) for optimal platform integration

**Platform-Specific Implementations**:

```typescript
// Unified codebase with platform-specific optimizations
import { Platform } from "react-native";

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.gap(2),
    ...Platform.select({
      web: {
        cursor: "pointer",
        userSelect: "none",
      },
      ios: {
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
}));
```

## Frontend Technology Stack

### React 19.1.0 with React Compiler

**Key Features**:

- **React Compiler**: Automatic build-time optimization, eliminates manual memoization
- **Concurrent Features**: Improved rendering performance and user experience
- **Breaking Changes**: Component lifecycle updates from React 17 → 19

**React Compiler Benefits**:

```typescript
// ✅ React Compiler automatically optimizes this
function ExpensiveComponent({ data, filters }) {
  // Compiler automatically memoizes expensive calculations
  const filteredData = data
    .filter(item => filters.includes(item.type))
    .map(item => expensiveTransformation(item));

  return <DataGrid data={filteredData} />;
}

// ❌ No longer needed - React Compiler handles this
function ExpensiveComponent({ data, filters }) {
  const filteredData = useMemo(() => {
    return data
      .filter(item => filters.includes(item.type))
      .map(item => expensiveTransformation(item));
  }, [data, filters]);

  return <DataGrid data={filteredData} />;
}
```

### React Native + React Native Web

**Architecture Benefits**:

- **Single Codebase**: Write once, run on desktop (via Tauri), web, and future mobile
- **Platform APIs**: Access native functionality through Expo and Tauri plugins
- **Performance**: Native performance on mobile, optimized web output for desktop

**Component Example**:

```typescript
import { View, Text, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

// This component works on all platforms
export function UniversalButton({ title, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    backgroundColor: theme.colors.buttonBg,
    padding: theme.gap(2),
    borderRadius: theme.radius.m,
    // Automatically optimized for each platform
  },
  text: {
    color: theme.colors.buttonColor,
    fontFamily: theme.fonts.primary,
  },
}));
```

## Styling Technology Stack

### react-native-unistyles 3.0.15

**Key Features**:

- **TypeScript-first**: Complete type safety for themes and breakpoints
- **Cross-platform**: Unified styling system for all platforms
- **Performance**: Optimized runtime with minimal overhead
- **Theme System**: Dynamic theming with light/dark mode support

**Migration from SCSS**:

```scss
/* Legacy SCSS (vendor/desktop) */
.sidebar {
  background-color: var(--sidebar-bg);
  padding: 16px;
  border-radius: 8px;

  @media (max-width: 768px) {
    padding: 8px;
  }
}
```

```typescript
// Modern Unistyles (apps/v2)
const styles = StyleSheet.create((theme) => ({
  sidebar: {
    backgroundColor: theme.colors.sidebarBg,
    padding: theme.gap(2), // 16px
    borderRadius: theme.radius.m,

    // Responsive breakpoints
    ...(theme.breakpoints.md && {
      padding: theme.gap(1), // 8px on mobile
    }),
  },
}));
```

### Theme System Architecture

**Comprehensive Theme Structure**:

```typescript
// apps/v2/src/theme.ts
const lightTheme = {
  colors: {
    // 50+ color variables migrated from SCSS
    primary: "#166de0",
    sidebarBg: "#1e325c",
    centerChannelBg: "#ffffff",
    // ... complete color system
  },
  elevation: {
    1: "0 2px 3px 0 rgba(0, 0, 0, 0.08)",
    // ... 6 elevation levels
  },
  radius: {
    xs: 2,
    s: 4,
    m: 8,
    l: 12,
    xl: 16,
    full: "50%",
  },
  fonts: {
    primary: "'Open Sans', sans-serif",
    heading: "Metropolis, sans-serif",
  },
  gap: (v: number) => v * 8, // Consistent spacing system
};
```

## Backend Technology Stack

### Tauri 2.1.0 (Rust Backend)

**Key Advantages**:

- **Security**: Sandboxed execution with explicit permissions
- **Performance**: Native performance with minimal memory footprint
- **Cross-platform**: Windows, macOS, Linux support
- **Bundle Size**: Significantly smaller than Electron applications

**Tauri Commands Example**:

```rust
// src-tauri/src/main.rs
use tauri::command;

#[command]
async fn read_config_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(path)
        .map_err(|e| e.to_string())
}

#[command]
async fn save_user_preferences(preferences: serde_json::Value) -> Result<(), String> {
    // Secure file operations in Rust
    Ok(())
}
```

```typescript
// Frontend integration
import { invoke } from "@tauri-apps/api/core";

async function loadConfig() {
  try {
    const config = await invoke("read_config_file", {
      path: "/path/to/config.json",
    });
    return JSON.parse(config);
  } catch (error) {
    console.error("Failed to load config:", error);
  }
}
```

### Tauri Plugin System

**Core Plugins Used**:

```toml
# src-tauri/Cargo.toml
[dependencies]
tauri = { version = "2.1", features = [] }
tauri-plugin-fs = "2.1"              # File system operations
tauri-plugin-shell = "2.1"           # Shell command execution
tauri-plugin-notification = "2.1"    # Desktop notifications
```

**Plugin Usage Examples**:

```typescript
// File system operations
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

// Notifications
import { sendNotification } from "@tauri-apps/plugin-notification";

// Shell commands
import { Command } from "@tauri-apps/plugin-shell";
```

## Internationalization Stack

### i18next + react-i18next + expo-localization

**Complete i18n Solution**:

- **i18next 25.6.0**: Core internationalization engine
- **react-i18next 16.1.0**: React integration with hooks
- **expo-localization ~17.0.7**: Device locale detection

**Migration from react-intl**:

```typescript
// Legacy (react-intl)
import { useIntl, FormattedMessage } from 'react-intl';

function Component() {
  const { formatMessage } = useIntl();

  return (
    <div>
      <FormattedMessage
        id="app.navigationManager.viewLimitReached"
        defaultMessage="View limit reached"
      />
      <p>{formatMessage({ id: 'common.save' })}</p>
    </div>
  );
}
```

```typescript
// Modern (i18next)
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('app.navigationManager.viewLimitReached')}</Text>
      <Text>{t('common.save')}</Text>
    </View>
  );
}
```

**Language Configuration**:

```typescript
// apps/v2/src/locales/index.ts
export const LANGUAGES_ARRAY = [
  { value: "en", url: require("./en.json") },
  { value: "de", url: require("./de.json") },
  { value: "fr", url: require("./fr.json") },
  // ... 22 total languages
] as const;

export type ILanguage = (typeof LANGUAGES_ARRAY)[number]["value"];
```

## Build System Technology

### Expo Metro Bundler

**Key Features**:

- **React Native Optimization**: Built for React Native performance
- **Static Output**: Generates optimized static files for Tauri/web
- **TypeScript Support**: Native TypeScript compilation
- **Tree Shaking**: Automatic dead code elimination

**Configuration**:

```javascript
// apps/v2/metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Enable static output for Tauri
config.web = {
  output: "static",
};

module.exports = config;
```

### Build Scripts Architecture

**Development Commands**:

```json
{
  "scripts": {
    "start": "expo start", // Expo development server
    "web": "expo start --web", // Web development mode
    "tauri:dev": "tauri dev", // Tauri desktop development
    "build:web": "expo export --platform web", // Static web build
    "build:desktop": "pnpm build:web && tauri build" // Desktop build pipeline
  }
}
```

## Development Tools Stack

### TypeScript 5.9.2

**Configuration**:

```json
// apps/v2/tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### ESLint 9.25.0

**Modern ESLint Configuration**:

```javascript
// apps/v2/eslint.config.js
const expo = require("eslint-config-expo/flat");

module.exports = [
  ...expo,
  {
    plugins: {
      "react-compiler": require("eslint-plugin-react-compiler"),
    },
    rules: {
      "react-compiler/react-compiler": "error",
    },
  },
];
```

### Package Management (pnpm)

**Monorepo Workspace**:

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Performance Benefits**:

- **Disk Space**: Shared dependencies across workspace
- **Speed**: Faster installation and linking
- **Consistency**: Lock file ensures reproducible builds

## Validation Technology

### valibot 1.1.0

**TypeScript-first Validation**:

```typescript
import * as v from "valibot";

// Schema definition with TypeScript integration
const UserSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2)),
  email: v.pipe(v.string(), v.email()),
  preferences: v.object({
    theme: v.picklist(["light", "dark"]),
    language: v.string(),
  }),
});

type User = v.InferInput<typeof UserSchema>;

// Validation with detailed error messages
function validateUser(data: unknown): User {
  return v.parse(UserSchema, data);
}
```

## Migration Technology Decisions

### Key Technology Upgrades

**Performance Improvements**:

- **Bundle Size**: Electron (~100MB+) → Tauri (~20-50MB)
- **Memory Usage**: Chromium overhead → Native efficiency
- **Startup Time**: Faster cold start with Tauri
- **Build Speed**: Metro bundler vs complex Webpack configuration

**Developer Experience Improvements**:

- **Type Safety**: Comprehensive TypeScript integration
- **Hot Reload**: Faster development feedback loops
- **Debugging**: Better source maps and debugging tools
- **Testing**: Simplified testing with React Native Testing Library

**Security Improvements**:

- **Sandboxing**: Tauri's permission-based security model
- **Backend Security**: Rust memory safety vs Node.js vulnerabilities
- **API Security**: Explicit command definition vs broad IPC access

## Technology Roadmap

### Phase 1: Foundation (✅ Complete)

- Expo + Tauri project structure
- Theme system migration (SCSS → Unistyles)
- i18n system migration (react-intl → i18next)
- Build system establishment

### Phase 2: Component Migration (🔄 In Progress)

- React component conversion
- Style system integration
- Hook pattern updates
- Cross-platform testing

### Phase 3: Backend Integration (🔄 Pending)

- Tauri command implementation
- File system API migration
- Notification system migration
- Desktop integration features

### Phase 4: Optimization (🔄 Future)

- Performance tuning
- Bundle optimization
- Mobile platform preparation
- Production deployment pipeline

---

**Last Updated**: 2025-10-19  
**Version**: 1.0  
**Applies To**: Mattermost Platform Migration (Electron → Expo + Tauri)

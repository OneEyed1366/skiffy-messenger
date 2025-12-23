# Mattermost Desktop Migration Project

A comprehensive migration project transitioning the Mattermost desktop application from Electron to a modern Expo + Tauri architecture.

## 🎯 Project Overview

This repository contains the migration of Mattermost Desktop from legacy Electron technology to a modern, cross-platform architecture using:

- **Current (Legacy)**: Electron + React 17 + SCSS + react-intl + Node.js backend
- **Target (Modern)**: Expo + Tauri + React 19 + Unistyles + i18next + Rust backend

## 📁 Repository Structure

```
├── vendor/desktop/          # 🔴 Legacy Electron application (v6.1.0)
│   ├── src/                 # Original React + SCSS codebase
│   └── package.json         # Electron dependencies and build scripts
│
├── apps/v2/                 # 🚀 New Expo + Tauri application (v1.0)
│   ├── src/
│   │   ├── locales/         # ✅ i18next translations (22 languages)
│   │   ├── theme.ts         # ✅ Unistyles theme system
│   │   └── ...              # Modern React Native components
│   └── package.json         # Expo + Tauri dependencies
│
├── docs/
│   ├── prd.md              # 📋 Product Requirements Document
│   ├── llms/               # 📚 Technical documentation
│   │   ├── unistyles.md    # Unistyles framework guide
│   │   ├── tauri.md        # Tauri framework guide
│   │   └── react-compiler.md # React Compiler optimization
│   └── ...
│
└── .bmad-core/             # 🛠️ BMAD development methodology
    ├── agents/             # AI development agents
    ├── tasks/              # Workflow automation
    └── templates/          # Document templates
```

## 🚀 Technology Stack Migration

### Current Stack (vendor/desktop)

| Component                | Technology     | Version  |
| ------------------------ | -------------- | -------- |
| **Runtime**              | Electron       | 38.2.1   |
| **Frontend**             | React          | 17.0.2   |
| **Styling**              | SCSS + Webpack | 1.49.11  |
| **Internationalization** | react-intl     | 6.6.2    |
| **Backend**              | Node.js        | >=18.0.0 |
| **Build System**         | Webpack        | 5.100.2  |

### Target Stack (apps/v2)

| Component                | Technology              | Version          |
| ------------------------ | ----------------------- | ---------------- |
| **Runtime**              | Expo + Tauri            | ~54.0.13 + 2.1.0 |
| **Frontend**             | React                   | 19.1.0           |
| **Styling**              | react-native-unistyles  | 3.0.15           |
| **Internationalization** | i18next + react-i18next | 25.6.0 + 16.1.0  |
| **Backend**              | Rust (Tauri)            | 2.1.0            |
| **Build System**         | Expo Metro              | Built-in         |
| **Optimization**         | React Compiler          | Built-in         |

## 🎨 Cross-Platform Strategy

### Platform Implementations

- **🖥️ Desktop**: Expo Web (react-native-web) static output + Tauri wrapper
- **🌐 Web**: Expo Web (react-native-web) static output
- **📱 Mobile (Future)**: Native Expo apps (iOS/Android)

### Architecture Benefits

- **Unified Codebase**: Single React Native codebase for all platforms
- **Static Output**: Optimized builds for fast loading and CDN deployment
- **Platform-Specific APIs**: Tauri (Rust) for desktop, native APIs for mobile
- **Future-Ready**: Prepared for mobile expansion without major restructuring

## 🛠️ Development

### Prerequisites

- **Node.js**: >=18.0.0
- **pnpm**: Latest stable (package manager)
- **Rust**: Latest stable (for Tauri)
- **Platform Tools**: Xcode (macOS), Visual Studio Build Tools (Windows)

### Getting Started

#### Legacy Electron App (vendor/desktop)

```bash
cd vendor/desktop
pnpm install
pnpm build
pnpm start
```

#### Modern Expo + Tauri App (apps/v2)

```bash
cd apps/v2
pnpm install

# Development
pnpm start             # Expo development server
pnpm tauri:dev         # Tauri desktop development

# Production Builds
pnpm build:web         # Static web build
pnpm build:desktop     # Tauri desktop builds
```

### Available Scripts (apps/v2)

- `pnpm start` - Start Expo development server
- `pnpm web` - Start web development server
- `pnpm tauri:dev` - Start Tauri desktop development
- `pnpm tauri:build` - Build desktop applications
- `pnpm build:web` - Generate static web output
- `pnpm build:desktop` - Full desktop build pipeline

## 🎨 Theme System Usage

The migrated theme system provides comprehensive styling capabilities:

```typescript
import { StyleSheet } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.centerChannelBg,
    padding: theme.gap(2), // 16px (8px * 2)
    borderRadius: theme.radius.m,
    elevation: theme.elevation[2],
  },
  text: {
    color: theme.colors.centerChannelColor,
    fontFamily: theme.fonts.primary,
    fontWeight: theme.fontWeights.normal,
  },
}));
```

### Available Themes

- **Light Theme (Denim)**: Default light color scheme
- **Dark Theme (Onyx)**: Dark mode with adjusted colors
- **Automatic switching**: Based on system preferences

## 🌍 Internationalization Usage

The migrated i18n system uses i18next with 22 supported languages:

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <Text>{t('app.navigationManager.viewLimitReached')}</Text>
  );
}
```

### Supported Languages

`de`, `en`, `en-AU`, `es`, `fr`, `it`, `hu`, `nl`, `pl`, `pt-BR`, `ro`, `sv`, `vi`, `tr`, `bg`, `ru`, `uk`, `fa`, `ko`, `zh-CN`, `zh-TW`, `ja`

## 📚 Documentation

- **[Unistyles Guide](docs/llms/unistyles.md)**: Styling framework documentation
- **[Tauri Guide](docs/llms/tauri.md)**: Desktop framework documentation
- **[React Compiler Guide](docs/llms/react-compiler.md)**: Performance optimization documentation

## 🎯 Migration Goals

1. **Performance**: Smaller bundle size and improved startup time
2. **Cross-Platform**: Unified codebase for desktop, web, and future mobile
3. **Developer Experience**: Modern tooling with TypeScript and React Compiler
4. **Maintainability**: Clean architecture without legacy code
5. **Security**: Rust-based backend for improved security model

## 📊 Key Benefits

| Aspect             | Electron (Legacy) | Expo + Tauri (Modern)  |
| ------------------ | ----------------- | ---------------------- |
| **Bundle Size**    | Large (~100MB+)   | Smaller (~20-50MB)     |
| **Memory Usage**   | High (Chromium)   | Lower (Native)         |
| **Security**       | Node.js access    | Sandboxed Rust         |
| **Cross-Platform** | Desktop only      | Desktop + Web + Mobile |
| **Performance**    | Good              | Better (Native)        |
| **Development**    | Complex webpack   | Simplified Expo        |

## 🚧 Current Status

**Migration Phase**: Foundation Complete, Component Migration In Progress

The project has successfully established the modern architecture foundation and is currently in the component migration phase. The next major milestone is completing the desktop functionality integration with Tauri APIs.

## 📄 License

This project maintains the same license as the original Mattermost Desktop application.

---

**Built with ❤️ using modern web technologies and cross-platform frameworks**

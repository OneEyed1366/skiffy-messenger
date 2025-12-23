# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Storybook Integration

This project includes Storybook 9 for building, testing, and documenting UI components in isolation.

### Running Storybook

To run the app in Storybook mode:

```bash
pnpm sb
```

This will start the Expo development server with the `EXPO_PUBLIC_ENVIRONMENT=storybook` environment variable, making the `/storybook` route accessible within the app.

### Development Modes

- **Normal Development**: `pnpm start` - Standard app development mode
- **Storybook Mode**: `pnpm sb` - Component development and documentation mode

### Writing Stories

Stories are located in `src/components/` alongside their respective components. Each component folder should include:

- `ComponentName.tsx` - Main component with complete co-location (types, styles, logic)
- `ComponentName.stories.tsx` - Storybook stories demonstrating component states
- `index.ts` - Barrel export

Example story structure:

```typescript
// src/components/Input/Input.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Username",
    value: "",
    onChangeText: (text) => console.log("Input changed:", text),
  },
};
```

### Environment Variable Control

Storybook access is controlled by the `EXPO_PUBLIC_ENVIRONMENT` environment variable:

- When set to `'storybook'`, the `/storybook` route becomes available
- In normal development mode, the storybook route is hidden

### Component Standards

All components follow these standards:

- **TypeScript**: Strict mode with 'I' prefix for all custom types
- **React 19**: ref as props, React Compiler compatible code
- **Unistyles 3.0**: Theme-based styling with variants system
- **Complete co-location**: Types, styles, and logic in single component file
- **Accessibility**: Minimum touch targets and proper ARIA attributes

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

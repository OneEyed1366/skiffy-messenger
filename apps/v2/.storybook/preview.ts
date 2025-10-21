import type { Preview } from "@storybook/react-native-web-vite";
import "../src/i18next";
import "../src/theme";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;

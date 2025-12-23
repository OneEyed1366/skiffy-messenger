import type { StorybookConfig } from "@storybook/react-native-web-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-native-web-vite",
    options: {
      pluginReactOptions: {
        babel: {
          plugins: [
            [
              "react-native-unistyles/plugin",
              {
                // pass root folder of your application
                // all files under this folder will be processed by the Babel plugin
                // if you need to include more folders, or customize discovery process
                // check available babel options
                root: "../src",
              },
            ],
          ],
        },
      },
    },
  },
};
export default config;

// apps/v2/src/components/LoadingSpinner/LoadingSpinner.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { LoadingSpinner } from "./LoadingSpinner";

const meta: Meta<typeof LoadingSpinner> = {
  title: "Components/LoadingSpinner",
  component: LoadingSpinner,
  argTypes: {
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "neutral", "button"],
    },
    fullscreen: {
      control: "boolean",
    },
    labelKey: {
      control: "text",
    },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 20, minHeight: 100 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type IStory = StoryObj<typeof LoadingSpinner>;

export const Default: IStory = {
  args: {},
};

export const WithLabel: IStory = {
  args: {
    labelKey: "loadingSpinner.loading",
  },
};

export const Small: IStory = {
  args: {
    size: "small",
  },
};

export const Large: IStory = {
  args: {
    size: "large",
  },
};

export const Secondary: IStory = {
  args: {
    color: "secondary",
  },
};

export const Neutral: IStory = {
  args: {
    color: "neutral",
  },
};

export const Fullscreen: IStory = {
  args: {
    fullscreen: true,
    labelKey: "loadingSpinner.loading",
  },
};

export const AllSizes: IStory = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
      <LoadingSpinner size="small" />
      <LoadingSpinner size="medium" />
      <LoadingSpinner size="large" />
    </View>
  ),
};

export const AllColors: IStory = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
      <LoadingSpinner color="primary" />
      <LoadingSpinner color="secondary" />
      <LoadingSpinner color="neutral" />
    </View>
  ),
};

// apps/v2/src/components/Timestamp/Timestamp.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { Timestamp } from "./Timestamp";

const meta: Meta<typeof Timestamp> = {
  title: "Components/Timestamp",
  component: Timestamp,
  argTypes: {
    format: {
      control: "select",
      options: ["relative", "time", "datetime"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    live: { control: "boolean" },
    muted: { control: "boolean" },
    showAbsoluteOnPress: { control: "boolean" },
    hour12: { control: "boolean" },
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
type Story = StoryObj<typeof Timestamp>;

//#region Format Stories

export const Relative: Story = {
  args: {
    value: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    format: "relative",
  },
};

export const Time: Story = {
  args: {
    value: new Date(),
    format: "time",
  },
};

export const DateTime: Story = {
  args: {
    value: new Date(),
    format: "datetime",
  },
};

//#endregion Format Stories

//#region Relative Time Examples

export const JustNow: Story = {
  args: {
    value: new Date(Date.now() - 30 * 1000), // 30 seconds ago
  },
};

export const MinutesAgo: Story = {
  args: {
    value: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
  },
};

export const HoursAgo: Story = {
  args: {
    value: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
};

export const Yesterday: Story = {
  args: {
    value: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
  },
};

export const DaysAgo: Story = {
  args: {
    value: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
};

//#endregion Relative Time Examples

//#region Size Stories

export const Small: Story = {
  args: {
    value: new Date(Date.now() - 5 * 60 * 1000),
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    value: new Date(Date.now() - 5 * 60 * 1000),
    size: "md",
  },
};

export const Large: Story = {
  args: {
    value: new Date(Date.now() - 5 * 60 * 1000),
    size: "lg",
  },
};

//#endregion Size Stories

//#region State Stories

export const Muted: Story = {
  args: {
    value: new Date(Date.now() - 5 * 60 * 1000),
    muted: true,
  },
};

export const LiveUpdating: Story = {
  args: {
    value: new Date(Date.now() - 30 * 1000), // 30 seconds ago
    live: true,
  },
};

export const StaticNoUpdate: Story = {
  args: {
    value: new Date(Date.now() - 5 * 60 * 1000),
    live: false,
  },
};

//#endregion State Stories

//#region Time Format Stories

export const Hour12: Story = {
  args: {
    value: new Date(),
    format: "time",
    hour12: true,
  },
};

export const Hour24: Story = {
  args: {
    value: new Date(),
    format: "time",
    hour12: false,
  },
};

//#endregion Time Format Stories

//#region All Variants Story

export const AllSizes: Story = {
  render: () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    return (
      <View style={{ gap: 8 }}>
        <Timestamp value={fiveMinAgo} size="sm" />
        <Timestamp value={fiveMinAgo} size="md" />
        <Timestamp value={fiveMinAgo} size="lg" />
      </View>
    );
  },
};

export const AllFormats: Story = {
  render: () => {
    const time = new Date();
    return (
      <View style={{ gap: 8 }}>
        <Timestamp value={time} format="relative" />
        <Timestamp value={time} format="time" />
        <Timestamp value={time} format="datetime" />
      </View>
    );
  },
};

export const RelativeTimeProgression: Story = {
  render: () => {
    const now = Date.now();
    return (
      <View style={{ gap: 8 }}>
        <Timestamp value={new Date(now - 30 * 1000)} />
        <Timestamp value={new Date(now - 5 * 60 * 1000)} />
        <Timestamp value={new Date(now - 30 * 60 * 1000)} />
        <Timestamp value={new Date(now - 3 * 60 * 60 * 1000)} />
        <Timestamp value={new Date(now - 24 * 60 * 60 * 1000)} />
        <Timestamp value={new Date(now - 7 * 24 * 60 * 60 * 1000)} />
      </View>
    );
  },
};

//#endregion All Variants Story

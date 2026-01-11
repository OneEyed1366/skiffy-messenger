// apps/v2/src/components/Badge/Badge.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  component: Badge,
  title: "Base/Badge",
  argTypes: {
    variant: {
      control: "select",
      options: ["standard", "dot"],
    },
    color: {
      control: "select",
      options: ["primary", "mention", "urgent"],
    },
    position: {
      control: "select",
      options: ["inline", "topRight"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
};
export default meta;

type IStory = StoryObj<typeof Badge>;

export const Default: IStory = {
  args: {
    count: 5,
    variant: "standard",
    color: "primary",
    size: "md",
  },
};

export const MentionColor: IStory = {
  args: {
    count: 3,
    color: "mention",
    size: "md",
  },
};

export const UrgentColor: IStory = {
  args: {
    count: 3,
    color: "urgent",
    size: "md",
  },
};

export const OverMax: IStory = {
  args: {
    count: 150,
    max: 99,
    variant: "standard",
    size: "md",
  },
};

export const DotVariant: IStory = {
  args: {
    variant: "dot",
    color: "primary",
    size: "md",
  },
};

export const DotUrgent: IStory = {
  args: {
    variant: "dot",
    color: "urgent",
    size: "md",
  },
};

export const TopRightPosition: IStory = {
  render: () => (
    <View
      style={{
        width: 40,
        height: 40,
        backgroundColor: "#ddd",
        position: "relative",
      }}
    >
      <Badge count={5} position="topRight" color="urgent" />
    </View>
  ),
};

export const AllSizes: IStory = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Badge count={5} size="sm" />
      <Badge count={5} size="md" />
      <Badge count={5} size="lg" />
    </View>
  ),
};

export const AllDotSizes: IStory = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
      <Badge variant="dot" size="sm" />
      <Badge variant="dot" size="md" />
      <Badge variant="dot" size="lg" />
    </View>
  ),
};

export const AllColors: IStory = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Badge count={5} color="primary" />
      <Badge count={5} color="mention" />
      <Badge count={5} color="urgent" />
    </View>
  ),
};

export const ZeroCount: IStory = {
  args: {
    count: 0,
  },
};

export const ZeroWithShowZero: IStory = {
  args: {
    count: 0,
    showZero: true,
  },
};

// apps/v2/src/components/Separator/Separator.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { View, Text } from "react-native";
import { Separator } from "./Separator";

const meta: Meta<typeof Separator> = {
  title: "Components/Separator",
  component: Separator,
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    thickness: {
      control: "select",
      options: ["thin", "medium", "thick"],
    },
    colorVariant: {
      control: "select",
      options: ["neutral", "light", "dark", "notification"],
    },
    spacing: {
      control: { type: "number", min: 0, max: 8 },
    },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16, minHeight: 200 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Separator>;

//#region Basic Stories

export const Default: Story = {
  args: {},
};

export const WithLabel: Story = {
  args: {
    label: "New Messages",
  },
};

export const WithLabelKey: Story = {
  args: {
    labelKey: "label.newMessages",
  },
};

//#endregion Basic Stories

//#region Orientation Stories

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
  },
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  decorators: [
    (Story) => (
      <View style={{ flexDirection: "row", height: 100, padding: 16 }}>
        <Text>Left</Text>
        <Story />
        <Text>Right</Text>
      </View>
    ),
  ],
};

//#endregion Orientation Stories

//#region Thickness Stories

export const Thin: Story = {
  args: {
    thickness: "thin",
  },
};

export const Medium: Story = {
  args: {
    thickness: "medium",
  },
};

export const Thick: Story = {
  args: {
    thickness: "thick",
  },
};

//#endregion Thickness Stories

//#region Color Variant Stories

export const NeutralColor: Story = {
  args: {
    colorVariant: "neutral",
  },
};

export const LightColor: Story = {
  args: {
    colorVariant: "light",
  },
};

export const DarkColor: Story = {
  args: {
    colorVariant: "dark",
  },
};

export const NotificationColor: Story = {
  args: {
    colorVariant: "notification",
    label: "New Messages",
  },
};

//#endregion Color Variant Stories

//#region All Variants Stories

export const AllThicknesses: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={{ marginBottom: 8 }}>Thin (1px)</Text>
        <Separator thickness="thin" />
      </View>
      <View>
        <Text style={{ marginBottom: 8 }}>Medium (2px)</Text>
        <Separator thickness="medium" />
      </View>
      <View>
        <Text style={{ marginBottom: 8 }}>Thick (4px)</Text>
        <Separator thickness="thick" />
      </View>
    </View>
  ),
};

export const AllColorVariants: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={{ marginBottom: 8 }}>Neutral</Text>
        <Separator colorVariant="neutral" />
      </View>
      <View>
        <Text style={{ marginBottom: 8 }}>Light</Text>
        <Separator colorVariant="light" />
      </View>
      <View>
        <Text style={{ marginBottom: 8 }}>Dark</Text>
        <Separator colorVariant="dark" />
      </View>
      <View>
        <Text style={{ marginBottom: 8 }}>Notification</Text>
        <Separator colorVariant="notification" />
      </View>
    </View>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <View style={{ gap: 24 }}>
      <Separator label="Section Break" />
      <Separator label="New Messages" colorVariant="notification" />
      <Separator label="Today" thickness="medium" />
    </View>
  ),
};

export const VerticalVariants: Story = {
  render: () => (
    <View
      style={{
        flexDirection: "row",
        height: 100,
        alignItems: "center",
        gap: 16,
      }}
    >
      <Text>A</Text>
      <Separator orientation="vertical" thickness="thin" />
      <Text>B</Text>
      <Separator orientation="vertical" thickness="medium" />
      <Text>C</Text>
      <Separator orientation="vertical" thickness="thick" />
      <Text>D</Text>
    </View>
  ),
};

//#endregion All Variants Stories

//#region Spacing Stories

export const CustomSpacing: Story = {
  render: () => (
    <View>
      <Text>No spacing (0)</Text>
      <Separator spacing={0} />
      <Text>Default spacing (2)</Text>
      <Separator spacing={2} />
      <Text>Large spacing (4)</Text>
      <Separator spacing={4} />
      <Text>Extra large spacing (6)</Text>
      <Separator spacing={6} />
      <Text>End</Text>
    </View>
  ),
};

//#endregion Spacing Stories

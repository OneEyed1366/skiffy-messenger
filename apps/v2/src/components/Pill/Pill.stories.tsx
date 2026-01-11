// apps/v2/src/components/Pill/Pill.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { View, Text } from "react-native";
import { Pill } from "./Pill";

const meta: Meta<typeof Pill> = {
  title: "Components/Pill",
  component: Pill,
  argTypes: {
    color: {
      control: "select",
      options: ["neutral", "info", "success", "warning", "danger"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
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
type Story = StoryObj<typeof Pill>;

//#region Color Variant Stories

export const Neutral: Story = {
  args: {
    label: "Neutral",
    color: "neutral",
  },
};

export const Info: Story = {
  args: {
    label: "Info",
    color: "info",
  },
};

export const Success: Story = {
  args: {
    label: "Success",
    color: "success",
  },
};

export const Warning: Story = {
  args: {
    label: "Warning",
    color: "warning",
  },
};

export const Danger: Story = {
  args: {
    label: "Danger",
    color: "danger",
  },
};

//#endregion Color Variant Stories

//#region Size Stories

export const Small: Story = {
  args: {
    label: "Small Pill",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    label: "Medium Pill",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    label: "Large Pill",
    size: "lg",
  },
};

//#endregion Size Stories

//#region Feature Stories

export const WithIcon: Story = {
  args: {
    label: "With Icon",
    iconLeft: <Text>*</Text>,
  },
};

export const Dismissible: Story = {
  args: {
    label: "Dismissible",
    onDismiss: () => console.log("Dismissed"),
  },
};

export const Interactive: Story = {
  args: {
    label: "Click Me",
    onPress: () => console.log("Pressed"),
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled",
    disabled: true,
    onPress: () => {},
  },
};

//#endregion Feature Stories

//#region All Colors Story

export const AllColors: Story = {
  render: () => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      <Pill label="Neutral" color="neutral" />
      <Pill label="Info" color="info" />
      <Pill label="Success" color="success" />
      <Pill label="Warning" color="warning" />
      <Pill label="Danger" color="danger" />
    </View>
  ),
};

//#endregion All Colors Story

//#region All Sizes Story

export const AllSizes: Story = {
  render: () => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Pill label="Small" size="sm" />
      <Pill label="Medium" size="md" />
      <Pill label="Large" size="lg" />
    </View>
  ),
};

//#endregion All Sizes Story

//#region Dismissible All Colors Story

export const DismissibleAllColors: Story = {
  render: () => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      <Pill label="Neutral" color="neutral" onDismiss={() => {}} />
      <Pill label="Info" color="info" onDismiss={() => {}} />
      <Pill label="Success" color="success" onDismiss={() => {}} />
      <Pill label="Warning" color="warning" onDismiss={() => {}} />
      <Pill label="Danger" color="danger" onDismiss={() => {}} />
    </View>
  ),
};

//#endregion Dismissible All Colors Story

//#region Use Case Stories

export const TagsList: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <Text style={{ fontWeight: "600", marginBottom: 4 }}>Selected Tags:</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Pill label="React" color="info" onDismiss={() => {}} />
        <Pill label="TypeScript" color="info" onDismiss={() => {}} />
        <Pill label="Mobile" color="neutral" onDismiss={() => {}} />
      </View>
    </View>
  ),
};

export const StatusIndicators: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pill label="Active" color="success" size="sm" />
        <Text>Server is running</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pill label="Warning" color="warning" size="sm" />
        <Text>High memory usage</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pill label="Error" color="danger" size="sm" />
        <Text>Connection failed</Text>
      </View>
    </View>
  ),
};

//#endregion Use Case Stories

// apps/v2/src/components/Pressable/Pressable.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { Text, View } from "react-native";
import { Pressable } from "./Pressable";

const meta: Meta<typeof Pressable> = {
  title: "Components/Pressable",
  component: Pressable,
  argTypes: {
    feedback: {
      control: "select",
      options: ["opacity", "highlight", "none"],
    },
    disabled: { control: "boolean" },
    pressedOpacity: {
      control: { type: "range", min: 0.1, max: 1, step: 0.1 },
    },
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
type Story = StoryObj<typeof Pressable>;

//#region Card Component for Stories

const Card = ({ pressed = false }: { pressed?: boolean }) => (
  <View
    style={{
      padding: 16,
      backgroundColor: pressed ? "#e0e0e0" : "#f5f5f5",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#ddd",
    }}
  >
    <Text style={{ fontWeight: "600" }}>Pressable Card</Text>
    <Text style={{ color: "#666", marginTop: 4 }}>
      {pressed ? "Pressed!" : "Tap or click me"}
    </Text>
  </View>
);

//#endregion Card Component for Stories

//#region Basic Stories

export const Default: Story = {
  render: () => (
    <Pressable onPress={() => console.log("Pressed!")}>
      <Card />
    </Pressable>
  ),
};

export const WithRenderProp: Story = {
  render: () => (
    <Pressable onPress={() => console.log("Pressed!")}>
      {({ pressed }) => <Card pressed={pressed} />}
    </Pressable>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Pressable disabled>
      <Card />
    </Pressable>
  ),
};

//#endregion Basic Stories

//#region Feedback Stories

export const OpacityFeedback: Story = {
  render: () => (
    <Pressable feedback="opacity" pressedOpacity={0.5}>
      <Card />
    </Pressable>
  ),
};

export const HighlightFeedback: Story = {
  render: () => (
    <Pressable feedback="highlight">
      <Card />
    </Pressable>
  ),
};

export const NoFeedback: Story = {
  render: () => (
    <Pressable feedback="none">
      <Card />
    </Pressable>
  ),
};

//#endregion Feedback Stories

//#region Interactive Stories

export const LongPress: Story = {
  render: () => (
    <Pressable
      onPress={() => console.log("Press")}
      onLongPress={() => console.log("Long press!")}
      delayLongPress={300}
    >
      <Card />
    </Pressable>
  ),
};

export const WithHitSlop: Story = {
  render: () => (
    <View style={{ padding: 40, backgroundColor: "#f0f0f0" }}>
      <Pressable
        onPress={() => console.log("Pressed!")}
        hitSlop={20}
        style={{ alignSelf: "flex-start" }}
      >
        <Text style={{ padding: 8, backgroundColor: "#ddd" }}>
          Small target with 20px hit slop
        </Text>
      </Pressable>
    </View>
  ),
};

//#endregion Interactive Stories

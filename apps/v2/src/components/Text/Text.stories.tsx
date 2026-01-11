// apps/v2/src/components/Text/Text.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { Text } from "./Text";

const meta: Meta<typeof Text> = {
  title: "Components/Text",
  component: Text,
  argTypes: {
    variant: {
      control: "select",
      options: ["heading", "body", "caption", "label"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl", "xxl"],
    },
    weight: {
      control: "select",
      options: ["regular", "medium", "semiBold", "bold"],
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "muted", "error", "link"],
    },
    align: {
      control: "select",
      options: ["left", "center", "right"],
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
type Story = StoryObj<typeof Text>;

//#region Variant Stories

export const Heading: Story = {
  args: {
    children: "Heading Text",
    variant: "heading",
    size: "xl",
  },
};

export const Body: Story = {
  args: {
    children:
      "Body text is used for regular content throughout the application.",
    variant: "body",
  },
};

export const Caption: Story = {
  args: {
    children: "Caption text for supplementary information",
    variant: "caption",
  },
};

export const Label: Story = {
  args: {
    children: "Form Label",
    variant: "label",
  },
};

//#endregion Variant Stories

//#region Typography Scale

export const TypographyScale: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <Text size="xxl" weight="bold">
        XXL Bold (24px)
      </Text>
      <Text size="xl" weight="semiBold">
        XL SemiBold (20px)
      </Text>
      <Text size="lg">Large (16px)</Text>
      <Text size="md">Medium (14px) - Default</Text>
      <Text size="sm">Small (12px)</Text>
      <Text size="xs">Extra Small (10px)</Text>
    </View>
  ),
};

//#endregion Typography Scale

//#region Color Variants

export const ColorVariants: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <Text color="primary">Primary - Main text color</Text>
      <Text color="secondary">Secondary - Less emphasis</Text>
      <Text color="muted">Muted - Minimal emphasis</Text>
      <Text color="error">Error - Error messages</Text>
      <Text color="link">Link - Clickable text</Text>
    </View>
  ),
};

//#endregion Color Variants

//#region Truncation

export const Truncation: Story = {
  args: {
    children:
      "This is a very long text that will be truncated after one line to demonstrate the numberOfLines prop working correctly with ellipsis.",
    numberOfLines: 1,
  },
};

//#endregion Truncation

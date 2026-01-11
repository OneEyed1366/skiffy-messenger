// apps/v2/src/components/Skeleton/Skeleton.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import {
  Skeleton,
  SkeletonGroup,
  SkeletonAvatar,
  SkeletonText,
  SkeletonCard,
  SkeletonList,
} from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  argTypes: {
    shape: {
      control: "select",
      options: ["text", "circle", "rect"],
    },
    width: { control: "text" },
    height: { control: "number" },
    radius: { control: "number" },
    disableAnimation: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16, backgroundColor: "#fff" }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

//#region Base Skeleton Stories

export const Default: Story = {
  args: {
    width: "100%",
    height: 16,
    shape: "rect",
  },
};

export const TextShape: Story = {
  args: {
    shape: "text",
    width: "80%",
    height: 14,
  },
};

export const CircleShape: Story = {
  args: {
    shape: "circle",
    width: 48,
    height: 48,
  },
};

export const RectShape: Story = {
  args: {
    shape: "rect",
    width: 200,
    height: 120,
    radius: 8,
  },
};

export const NoAnimation: Story = {
  args: {
    width: "100%",
    height: 16,
    disableAnimation: true,
  },
};

//#endregion Base Skeleton Stories

//#region SkeletonGroup Stories

export const Group: StoryObj<typeof SkeletonGroup> = {
  render: () => (
    <SkeletonGroup
      count={4}
      gap={12}
      itemProps={{ height: 16, width: "100%" }}
    />
  ),
};

export const GroupRow: StoryObj<typeof SkeletonGroup> = {
  render: () => (
    <SkeletonGroup
      count={3}
      gap={8}
      direction="row"
      itemProps={{ width: 80, height: 80, shape: "rect", radius: 8 }}
    />
  ),
};

//#endregion SkeletonGroup Stories

//#region SkeletonAvatar Stories

export const Avatar: StoryObj<typeof SkeletonAvatar> = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
      <SkeletonAvatar size={32} />
      <SkeletonAvatar size={40} />
      <SkeletonAvatar size={48} />
      <SkeletonAvatar size={64} />
    </View>
  ),
};

//#endregion SkeletonAvatar Stories

//#region SkeletonText Stories

export const TextSingleLine: StoryObj<typeof SkeletonText> = {
  render: () => <SkeletonText lines={1} />,
};

export const TextMultiLine: StoryObj<typeof SkeletonText> = {
  render: () => <SkeletonText lines={3} lastLineWidth={60} />,
};

export const TextParagraph: StoryObj<typeof SkeletonText> = {
  render: () => (
    <SkeletonText lines={5} lineHeight={16} gap={10} lastLineWidth={40} />
  ),
};

//#endregion SkeletonText Stories

//#region Composed Layout Stories

export const Card: StoryObj<typeof SkeletonCard> = {
  render: () => <SkeletonCard showAvatar textLines={2} />,
};

export const CardNoAvatar: StoryObj<typeof SkeletonCard> = {
  render: () => <SkeletonCard showAvatar={false} textLines={3} />,
};

export const List: StoryObj<typeof SkeletonList> = {
  render: () => <SkeletonList count={5} gap={16} showAvatar />,
};

export const ListNoAvatar: StoryObj<typeof SkeletonList> = {
  render: () => <SkeletonList count={3} gap={12} showAvatar={false} />,
};

//#endregion Composed Layout Stories

//#region Use Case Stories

export const ProfilePlaceholder: Story = {
  render: () => (
    <View style={{ alignItems: "center", gap: 12 }}>
      <SkeletonAvatar size={80} />
      <Skeleton shape="text" width={120} height={18} />
      <Skeleton shape="text" width={180} height={14} />
    </View>
  ),
};

export const PostPlaceholder: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <SkeletonAvatar size={40} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton shape="text" width="40%" height={14} />
          <Skeleton shape="text" width="25%" height={12} />
        </View>
      </View>
      <SkeletonText lines={3} lineHeight={14} gap={8} lastLineWidth={70} />
      <Skeleton shape="rect" width="100%" height={180} radius={8} />
    </View>
  ),
};

export const ChannelListPlaceholder: Story = {
  render: () => (
    <View style={{ gap: 4 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingVertical: 8,
            paddingHorizontal: 16,
          }}
        >
          <Skeleton shape="rect" width={20} height={20} radius={4} />
          <Skeleton
            shape="text"
            width={`${60 + Math.random() * 30}%`}
            height={14}
          />
        </View>
      ))}
    </View>
  ),
};

//#endregion Use Case Stories

//#region All Shapes Story

export const AllShapes: Story = {
  render: () => (
    <View style={{ gap: 24 }}>
      <View>
        <Skeleton shape="text" width="100%" height={14} />
      </View>
      <View style={{ flexDirection: "row", gap: 16 }}>
        <Skeleton shape="circle" width={48} height={48} />
        <Skeleton shape="circle" width={32} height={32} />
      </View>
      <View>
        <Skeleton shape="rect" width="100%" height={100} radius={8} />
      </View>
    </View>
  ),
};

//#endregion All Shapes Story

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Components/Display/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    shape: { control: "select", options: ["circle", "square"] },
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl"] },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: { initials: "SN" },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Avatar key={size} initials="SN" size={size} />
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar initials="SN" shape="circle" />
      <Avatar initials="SN" shape="square" />
    </div>
  ),
};

export const WithImage: Story = {
  args: { src: "https://i.pravatar.cc/150?img=12", alt: "Jane Doe" },
};

export const FallbackIcon: Story = {
  args: {},
};

export const OnlineStatus: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar initials="SN" online />
      <Avatar initials="SN" online={false} />
    </div>
  ),
};

export const WithLevel: Story = {
  args: { level: 49, initials: "SN" },
};

export const WithLevelAndPhoto: Story = {
  name: "Level — With Photo",
  args: {
    level: 49,
    src: "https://picsum.photos/seed/avatartest/200/200",
    alt: "Test user",
  },
};

export const LevelOnePerTier: Story = {
  name: "Level — One Per Tier",
  render: () => (
    <div
      style={{
        display: "flex",
        gap: 24,
        flexWrap: "wrap",
        alignItems: "flex-end",
      }}
    >
      {[1, 11, 21, 31, 41].map((level) => (
        <Avatar key={level} level={level} initials="SN" />
      ))}
    </div>
  ),
};

export const LevelSizes: Story = {
  // A gallery: every variant side by side is the point, so it is wider than a
  // phone on purpose. Exempt from the width sweep rather than reshaped.
  tags: ["no-width-sweep"],
  name: "Level — Sizes",
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
      <Avatar level={49} initials="SN" size="sm" />
      <Avatar level={49} initials="SN" size="md" />
      <Avatar level={49} initials="SN" size="lg" />
    </div>
  ),
};

export const AllLevels: Story = {
  // A gallery: every variant side by side is the point, so it is wider than a
  // phone on purpose. Exempt from the width sweep rather than reshaped.
  tags: ["no-width-sweep"],
  name: "Level — All 50",
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(10, 1fr)",
        gap: 20,
      }}
    >
      {Array.from({ length: 50 }, (_, i) => i + 1).map((level) => (
        <Avatar key={level} level={level} initials="SN" size="sm" />
      ))}
    </div>
  ),
};

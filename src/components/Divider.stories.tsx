import type { Meta, StoryObj } from "@storybook/react-vite";
import { Divider } from "./Divider";

const meta: Meta<typeof Divider> = {
  title: "Components/Display/Divider",
  component: Divider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Plain: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Divider />
    </div>
  ),
};

export const Dashed: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Divider line="dashed" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 320,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <Divider label="OR" labelPlacement="left" />
      <Divider label="OR" labelPlacement="center" />
      <Divider label="OR" labelPlacement="right" />
    </div>
  ),
};

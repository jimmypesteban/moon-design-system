import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd } from "./Kbd";

const meta: Meta<typeof Kbd> = {
  title: "Components/Display/Kbd",
  component: Kbd,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const Default: Story = {
  args: { children: "↵" },
};

export const InlineHint: Story = {
  render: () => (
    <span
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 4,
        fontFamily: "system-ui, sans-serif",
        fontSize: 13,
      }}
    >
      Select <Kbd>↵</Kbd> · Navigate <Kbd>↑</Kbd> <Kbd>↓</Kbd> · Enter scope{" "}
      <Kbd>Tab</Kbd> / <Kbd>→</Kbd>
    </span>
  ),
};

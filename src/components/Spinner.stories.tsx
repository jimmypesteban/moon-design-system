import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./Spinner";

const meta: Meta<typeof Spinner> = {
  title: "Components/Feedback/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};

/**
 * Inherits the current text color — set it via `className` to match
 * whatever it's placed on. (`Button`'s own `loading` prop already handles
 * its internal pending-state spinner; this is for standalone loading rows
 * like a table section or an inline "Syncing…" indicator.)
 */
export const WithLabel: Story = {
  render: () => (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: "#313030",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <Spinner size="sm" label="Syncing" />
      Syncing…
    </div>
  ),
};

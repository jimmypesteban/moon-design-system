import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressBar } from "./ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/Feedback/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "radio", options: ["md", "lg"] },
    labelPosition: { control: "radio", options: ["none", "right", "floating"] },
    value: { control: { type: "range", min: 0, max: 100 } },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: { value: 62, size: "md", labelPosition: "none" },
};

export const WithRightLabel: Story = {
  args: { value: 40, labelPosition: "right" },
};

export const WithFloatingLabel: Story = {
  render: () => (
    <div style={{ paddingTop: 24 }}>
      <ProgressBar value={75} labelPosition="floating" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ProgressBar value={30} size="md" labelPosition="right" />
      <ProgressBar value={70} size="lg" labelPosition="right" />
    </div>
  ),
};

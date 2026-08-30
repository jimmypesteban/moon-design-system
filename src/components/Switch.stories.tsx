import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Forms/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

function SwitchDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <Switch
      label="Remember me"
      description="Save my login details for next time"
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
}

export const Default: Story = {
  render: () => <SwitchDemo />,
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Switch key={size} label={size} size={size} defaultChecked />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24 }}>
      <Switch label="Off, disabled" disabled />
      <Switch label="On, disabled" defaultChecked disabled />
    </div>
  ),
};

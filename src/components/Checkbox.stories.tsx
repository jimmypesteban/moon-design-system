import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Forms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "radio", options: ["sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

function CheckboxDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      label="I accept the terms"
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
}

export const Default: Story = {
  render: () => <CheckboxDemo />,
};

export const CheckedByDefault: Story = {
  args: { label: "Send weekly digest", defaultChecked: true },
};

export const WithError: Story = {
  args: {
    label: "I accept the terms",
    error: "You must accept the terms to continue",
  },
};

export const Disabled: Story = {
  args: { label: "Send weekly digest", disabled: true, checked: true },
};

export const Small: Story = {
  args: { label: "Compact size", size: "sm", defaultChecked: true },
};

/**
 * A play function — Storybook replays this interaction after the story
 * mounts and shows each step in the Interactions panel below the canvas
 * (Controls / Actions / Interactions tabs), asserting the checkbox actually
 * toggles rather than just eyeballing it.
 */
export const ClickToCheck: Story = {
  render: () => <CheckboxDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", {
      name: "I accept the terms",
    });

    await expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};

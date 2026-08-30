import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup } from "./RadioGroup";
import { Radio } from "./Radio";

const COHORT_OPTIONS = [
  { value: "school", label: "School" },
  { value: "university", label: "University" },
  { value: "corporate", label: "Corporate" },
];

const meta: Meta<typeof RadioGroup> = {
  title: "Components/Forms/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "radio", options: ["horizontal", "vertical"] },
    size: { control: "radio", options: ["sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

function RadioGroupDemo() {
  const [value, setValue] = useState("school");
  return (
    <RadioGroup
      label="Cohort"
      options={COHORT_OPTIONS}
      value={value}
      onChange={setValue}
    />
  );
}

export const Default: Story = {
  render: () => <RadioGroupDemo />,
};

export const Horizontal: Story = {
  args: {
    label: "Cohort",
    options: COHORT_OPTIONS,
    defaultValue: "school",
    orientation: "horizontal",
  },
};

export const WithError: Story = {
  args: {
    label: "Cohort",
    options: COHORT_OPTIONS,
    error: "Select a cohort to continue",
  },
};

export const Disabled: Story = {
  args: {
    label: "Cohort",
    options: COHORT_OPTIONS,
    defaultValue: "school",
    disabled: true,
  },
};

/**
 * The individual control, which RadioGroup renders one of per option.
 *
 * Documented here rather than on a page of its own. A single Radio and a
 * RadioGroup were two entries in the index whose previews were near-identical,
 * and the split was the library's internals showing through rather than a
 * distinction a reader needs: in almost every case you want the group, which
 * adds the label, the error text, the shared `name` and the arrow-key
 * behaviour. Reach for a bare `Radio` only when you are placing controls in a
 * layout of your own — a row in a table, say — and taking that on yourself.
 */
export const SingleControl: Story = {
  name: "A single Radio",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Radio name="single-demo" label="Small" size="sm" defaultChecked />
      <Radio name="single-demo" label="Medium" size="md" />
      <Radio name="single-demo" label="Disabled" disabled />
    </div>
  ),
};

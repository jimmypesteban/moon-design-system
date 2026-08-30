import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./Select";

const COHORT_OPTIONS = [
  { value: "school", label: "School" },
  { value: "university", label: "University" },
  { value: "corporate", label: "Corporate" },
];

const meta: Meta<typeof Select> = {
  title: "Components/Forms/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {
    audience: { control: "radio", options: ["admin", "student"] },
    size: { control: "radio", options: ["sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: { label: "Cohort", options: COHORT_OPTIONS, audience: "admin" },
};

export const WithPlaceholder: Story = {
  args: {
    label: "Cohort",
    options: COHORT_OPTIONS,
    placeholder: "Select a cohort...",
    audience: "admin",
  },
};

export const WithError: Story = {
  args: {
    label: "Cohort",
    options: COHORT_OPTIONS,
    error: "Select a cohort to continue",
    audience: "admin",
  },
};

export const Disabled: Story = {
  args: {
    label: "Cohort",
    options: COHORT_OPTIONS,
    disabled: true,
    defaultValue: "university",
    audience: "admin",
  },
};

export const StudentAudience: Story = {
  args: {
    label: "Which class are you in?",
    options: COHORT_OPTIONS,
    audience: "student",
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Components/Forms/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    audience: { control: "radio", options: ["admin", "student"] },
    size: { control: "radio", options: ["sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: "Class name",
    placeholder: "e.g. Period 3 English",
    audience: "admin",
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    error: "Enter a valid email address",
    audience: "admin",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Class name",
    helperText: "Shown to students on the join screen",
    audience: "admin",
  },
};

export const Required: Story = {
  args: { label: "Required field", required: true, audience: "admin" },
};

export const Disabled: Story = {
  args: {
    label: "Disabled",
    disabled: true,
    defaultValue: "Can't touch this",
    audience: "admin",
  },
};

export const StudentAudience: Story = {
  args: {
    label: "Your answer",
    placeholder: "Type here...",
    audience: "student",
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Forms/Textarea",
  component: Textarea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { label: "Feedback", placeholder: "Please type your answer" },
};

export const WithHelperText: Story = {
  args: {
    label: "Feedback",
    placeholder: "Please type your answer",
    helperText: "Max 500 characters",
  },
};

export const WithError: Story = {
  args: {
    label: "Feedback",
    placeholder: "Please type your answer",
    error: "Feedback is required",
  },
};

export const Filled: Story = {
  args: {
    label: "Feedback",
    defaultValue: "This lesson was really helpful, thank you!",
  },
};

export const StudentAudience: Story = {
  args: {
    label: "Your answer",
    placeholder: "Please type your answer",
    audience: "student",
  },
};

export const Disabled: Story = {
  args: {
    label: "Feedback",
    placeholder: "Please type your answer",
    disabled: true,
  },
};

export const LargerRows: Story = {
  args: {
    label: "Essay response",
    placeholder: "Please type your answer",
    rows: 8,
  },
};

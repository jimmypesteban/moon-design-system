import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Components/Feedback/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "success", "warning", "danger"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    variant: "info",
    title: "Heads up",
    children: "Grading for this assignment closes Friday at 5pm.",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    title: "All set",
    children: "Every student in this class has submitted.",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "No students enrolled",
    children: "Add students to this class before assigning work.",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    title: "Failed to save",
    children: "Check your connection and try again.",
  },
};

export const WithoutTitle: Story = {
  args: {
    variant: "info",
    children: "Changes are saved automatically as you type.",
  },
};

export const Dismissible: Story = {
  render: () => {
    function Demo() {
      const [visible, setVisible] = useState(true);
      if (!visible)
        return (
          <p style={{ fontFamily: "system-ui, sans-serif", color: "#6B6A66" }}>
            Dismissed — reload the story to bring it back.
          </p>
        );
      return (
        <Alert
          variant="warning"
          title="Draft not published"
          onClose={() => setVisible(false)}
        >
          Students won't see this lesson until you publish it.
        </Alert>
      );
    }
    return <Demo />;
  },
};

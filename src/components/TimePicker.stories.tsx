import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TimePicker } from "./TimePicker";

const meta: Meta<typeof TimePicker> = {
  title: "Components/Forms/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<number | null>(null);
      return (
        <TimePicker label="Start time" value={value} onChange={setValue} />
      );
    }
    return <Demo />;
  },
};

export const FifteenMinuteSteps: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<number | null>(9 * 60);
      return (
        <TimePicker
          label="Class start"
          value={value}
          onChange={setValue}
          stepMinutes={15}
        />
      );
    }
    return <Demo />;
  },
};

export const WithError: Story = {
  args: { label: "Start time", error: "A start time is required" },
};

export const StudentAudience: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<number | null>(null);
      return (
        <TimePicker
          label="What time is it?"
          audience="student"
          value={value}
          onChange={setValue}
        />
      );
    }
    return <Demo />;
  },
};

export const Disabled: Story = {
  args: { label: "Start time", disabled: true },
};

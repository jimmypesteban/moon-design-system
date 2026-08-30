import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DatePicker } from "./DatePicker";

const meta: Meta<typeof DatePicker> = {
  title: "Components/Forms/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<Date | null>(null);
      return <DatePicker label="Due date" value={value} onChange={setValue} />;
    }
    return <Demo />;
  },
};

export const WithInitialValue: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<Date | null>(new Date());
      return <DatePicker label="Due date" value={value} onChange={setValue} />;
    }
    return <Demo />;
  },
};

export const MinMaxRange: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<Date | null>(null);
      const today = new Date();
      const min = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const max = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 14,
      );
      return (
        <DatePicker
          label="Available booking window"
          helperText="Next 14 days only"
          value={value}
          onChange={setValue}
          minDate={min}
          maxDate={max}
        />
      );
    }
    return <Demo />;
  },
};

export const WithError: Story = {
  args: { label: "Due date", error: "A due date is required" },
};

export const StudentAudience: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<Date | null>(null);
      return (
        <DatePicker
          label="When did you take this?"
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
  args: { label: "Due date", disabled: true },
};

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateTimeField } from "./DateTimeField";

const meta: Meta<typeof DateTimeField> = {
  title: "Components/Forms/DateTimeField",
  component: DateTimeField,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DateTimeField>;

/**
 * Type a date directly ("Jun 3, 2026, 9:00 AM"), or click the calendar icon
 * to pick a day and set the time.
 */
export const Default: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<Date | null>(null);
      return (
        <DateTimeField label="Due date" value={value} onChange={setValue} />
      );
    }
    return <Demo />;
  },
};

export const WithHelperText: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<Date | null>(
        new Date(2026, 7, 15, 14, 30),
      );
      return (
        <DateTimeField
          label="Assignment deadline"
          helperText="Students lose access after this time"
          value={value}
          onChange={setValue}
        />
      );
    }
    return <Demo />;
  },
};

export const WithError: Story = {
  args: {
    label: "Start date",
    error: "Start date must be before the end date",
  },
};

export const StudentAudience: Story = {
  args: {
    label: "Reminder time",
    audience: "student",
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState } from "./EmptyState";
import { Button } from "./Button";
import { Mail, Search, Users } from "../icons";

const meta: Meta<typeof EmptyState> = {
  title: "Components/Feedback/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: <Mail size={24} />,
    title: "No submissions yet",
    description: "Once a student submits this activity, it will show up here.",
  },
};

export const WithAction: Story = {
  args: {
    icon: <Users size={24} />,
    title: "No classes yet",
    description:
      "Classes assigned to you will appear here, or create one from scratch.",
    action: <Button variant="secondary">Create a class</Button>,
  },
};

export const NoIcon: Story = {
  args: {
    title: "No results",
    description: "Try a different search term.",
  },
};

export const CustomTint: Story = {
  args: {
    icon: <Search size={24} />,
    iconClassName: "bg-mo-blue-1 text-mo-blue",
    title: "No matches found",
    description: "Adjust your filters and try again.",
  },
};

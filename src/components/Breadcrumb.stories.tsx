import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumb } from "./Breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Navigation/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: {
    items: [
      { label: "Classes", href: "#" },
      { label: "Period 3 English", href: "#" },
      { label: "Student Roster" },
    ],
  },
};

export const TwoLevels: Story = {
  args: {
    items: [{ label: "Classes", href: "#" }, { label: "Current Page" }],
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Steps } from "./Steps";

const meta: Meta<typeof Steps> = {
  title: "Components/Navigation/Steps",
  component: Steps,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Steps>;

const ITEMS = [
  { title: "Account" },
  { title: "Profile" },
  { title: "Confirm" },
];

export const Default: Story = {
  args: { items: ITEMS, current: 1 },
};

export const FirstStep: Story = {
  args: { items: ITEMS, current: 0 },
};

export const LastStep: Story = {
  args: { items: ITEMS, current: 2 },
};

export const WithDescriptions: Story = {
  args: {
    current: 1,
    items: [
      { title: "Finished", description: "This is a description." },
      { title: "In Progress", description: "This is a description." },
      { title: "Waiting", description: "This is a description." },
    ],
  },
};

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Components/Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const TAB_ITEMS = [
  { key: "overview", label: "Overview" },
  { key: "roster", label: "Roster" },
  { key: "reports", label: "Reports" },
  { key: "archived", label: "Archived", disabled: true },
];

function TabsDemo() {
  const [active, setActive] = useState("overview");
  return <Tabs tabs={TAB_ITEMS} activeKey={active} onChange={setActive} />;
}

export const Default: Story = {
  render: () => <TabsDemo />,
};

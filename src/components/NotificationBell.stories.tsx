import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import {
  NotificationBell,
  type NotificationBellItem,
} from "./NotificationBell";
import { Award, Calendar, MessageSquareText } from "../icons";

const meta: Meta<typeof NotificationBell> = {
  title: "Components/Navigation/NotificationBell",
  component: NotificationBell,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NotificationBell>;

const SEED_ITEMS: NotificationBellItem[] = [
  {
    id: "1",
    title: "New badge earned",
    body: 'You unlocked "Consistent Learner" for a 5-day streak.',
    timestamp: "2h ago",
    read: false,
    icon: <Award size={16} />,
    accentClassName: "bg-mo-yellow-1 text-mo-yellow-8",
  },
  {
    id: "2",
    title: "Assignment due tomorrow",
    body: "Chapter 4 Reading Quiz is due Aug 12, 11:59pm.",
    timestamp: "5h ago",
    read: false,
    icon: <Calendar size={16} />,
    accentClassName: "bg-mo-blue-1 text-mo-blue",
  },
  {
    id: "3",
    title: "New message from Ms. Chan",
    body: '"Great work on your last essay revision!"',
    timestamp: "1d ago",
    read: true,
    icon: <MessageSquareText size={16} />,
    accentClassName: "bg-mo-green-1 text-mo-green-8",
  },
];

/**
 * Deliberately presentational — pass already-fetched `items` and handle
 * `onSelect`/`onMarkRead`/`onDismiss`/`onMarkAllRead` yourself. This story
 * wires up local state to demonstrate the interaction; a real app would
 * back these with its own notifications API.
 */
export const Interactive: Story = {
  render: () => {
    function Demo() {
      const [items, setItems] = useState(SEED_ITEMS);
      return (
        <NotificationBell
          items={items}
          onSelect={fn()}
          onMarkRead={(id) =>
            setItems((cur) =>
              cur.map((i) => (i.id === id ? { ...i, read: true } : i)),
            )
          }
          onMarkUnread={(id) =>
            setItems((cur) =>
              cur.map((i) => (i.id === id ? { ...i, read: false } : i)),
            )
          }
          onDismiss={(id) => setItems((cur) => cur.filter((i) => i.id !== id))}
          onMarkAllRead={() =>
            setItems((cur) => cur.map((i) => ({ ...i, read: true })))
          }
          footer={
            <>
              <a href="#" style={{ fontWeight: 600, color: "#7A123F" }}>
                View all
              </a>
              <a href="#" style={{ color: "#6F625C" }}>
                Settings
              </a>
            </>
          }
        />
      );
    }
    return <Demo />;
  },
};

export const Empty: Story = {
  args: { items: [], emptyLabel: "No notifications" },
};

export const Loading: Story = {
  args: { items: [], isLoading: true },
};

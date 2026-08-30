import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommandPalette, type CommandPaletteItem } from "./CommandPalette";
import { Button } from "./Button";
import { LayoutGrid, User, GraduationCap } from "../icons";

const meta: Meta<typeof CommandPalette> = {
  title: "Components/Navigation/CommandPalette",
  component: CommandPalette,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

// Multiple distinct groups + icons — nav pages alongside searched entities.
// Each group renders under its own visible section heading (like GitHub's
// own Cmd+K "Owners" / "Repositories" / "Suggestions"), not an inline
// "Group › Item" prefix.
const DEMO_ITEMS: CommandPaletteItem[] = [
  {
    id: "/admin/activities",
    label: "Activities",
    group: "Pages",
    icon: LayoutGrid,
  },
  {
    id: "/admin/curriculums",
    label: "Curriculums",
    group: "Pages",
    icon: LayoutGrid,
  },
  { id: "/admin/classes", label: "Classes", group: "Pages", icon: LayoutGrid },
  {
    id: "/admin/feature-flags",
    label: "Feature Flags",
    group: "Pages",
    icon: LayoutGrid,
  },
  {
    id: "user-1",
    label: "Ada Lovelace",
    subtitle: "ada@school.edu",
    group: "Users",
    icon: User,
  },
  {
    id: "user-2",
    label: "Grace Hopper",
    subtitle: "grace@school.edu",
    group: "Users",
    icon: User,
  },
  {
    id: "org-1",
    label: "Riverside Secondary",
    group: "Organizations & Classes",
    icon: GraduationCap,
  },
];

// A single group (nav links only, no live search results) — one heading, no
// icons. Confirms a single-section list doesn't look sparse or misaligned.
const NAV_ONLY_ITEMS: CommandPaletteItem[] = [
  { id: "/admin/activities", label: "Activities", group: "Pages" },
  { id: "/admin/curriculums", label: "Curriculums", group: "Pages" },
  { id: "/admin/classes", label: "Classes", group: "Pages" },
  { id: "/admin/feature-flags", label: "Feature Flags", group: "Pages" },
];

function CommandPaletteDemo({
  items,
  placeholder,
}: {
  items: CommandPaletteItem[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [lastSelected, setLastSelected] = useState<string | null>(null);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <Button onClick={() => setOpen(true)}>Open command palette (⌘K)</Button>
      {lastSelected && (
        <p style={{ marginTop: 12, fontSize: 14 }}>Selected: {lastSelected}</p>
      )}
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={items}
        onSelect={(item) => setLastSelected(item.label)}
        placeholder={placeholder}
        label="Admin quick search"
      />
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <CommandPaletteDemo
      items={DEMO_ITEMS}
      placeholder="Jump to a page, user, or organization..."
    />
  ),
};

export const NavOnly: Story = {
  name: "Single Group (no icons)",
  render: () => (
    <CommandPaletteDemo
      items={NAV_ONLY_ITEMS}
      placeholder="Jump to a page..."
    />
  ),
};

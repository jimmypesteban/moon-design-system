import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dropdown } from "./Dropdown";
import { Button } from "./Button";
import { Pencil, Copy, Trash2, MoreVertical } from "../icons";

const meta: Meta<typeof Dropdown> = {
  title: "Components/Navigation/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  render: () => (
    <Dropdown
      items={[
        {
          key: "rename",
          label: "Rename",
          icon: <Pencil size={16} />,
          onSelect: () => alert("Rename"),
        },
        {
          key: "duplicate",
          label: "Duplicate",
          icon: <Copy size={16} />,
          onSelect: () => alert("Duplicate"),
        },
        {
          key: "delete",
          label: "Delete",
          icon: <Trash2 size={16} />,
          danger: true,
          onSelect: () => alert("Delete"),
        },
      ]}
    >
      <Button variant="tertiary" size="sm">
        Actions
      </Button>
    </Dropdown>
  ),
};

export const IconOnlyTrigger: Story = {
  name: "Icon-only trigger (kebab menu)",
  render: () => (
    <Dropdown
      align="end"
      items={[
        { key: "edit", label: "Edit", onSelect: () => alert("Edit") },
        { key: "archive", label: "Archive", onSelect: () => alert("Archive") },
        {
          key: "delete",
          label: "Delete",
          danger: true,
          onSelect: () => alert("Delete"),
        },
      ]}
    >
      <button
        type="button"
        aria-label="More actions"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: 6,
          border: "1px solid #E8DDD5",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        <MoreVertical size={16} />
      </button>
    </Dropdown>
  ),
};

export const WithDisabledItem: Story = {
  render: () => (
    <Dropdown
      items={[
        { key: "view", label: "View details", onSelect: () => alert("View") },
        { key: "export", label: "Export (coming soon)", disabled: true },
        {
          key: "delete",
          label: "Delete",
          danger: true,
          onSelect: () => alert("Delete"),
        },
      ]}
    >
      <Button variant="tertiary" size="sm">
        Row actions
      </Button>
    </Dropdown>
  ),
};

export const RightAligned: Story = {
  render: () => (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <Dropdown
        align="end"
        items={[
          { key: "a", label: "Option A", onSelect: () => {} },
          { key: "b", label: "Option B", onSelect: () => {} },
        ]}
      >
        <Button variant="tertiary" size="sm">
          Aligned right
        </Button>
      </Dropdown>
    </div>
  ),
};

/**
 * The menu, open. Every other story renders its trigger and asks you to click,
 * so there was no way to see the menu in the docs — or in the component index,
 * whose card was a picture of a button.
 */
export const Open: Story = {
  tags: ["overlay-open"],
  render: () => (
    <Dropdown
      defaultOpen
      items={[
        { key: "rename", label: "Rename" },
        { key: "duplicate", label: "Duplicate" },
        { key: "delete", label: "Delete", danger: true },
      ]}
    >
      <Button variant="primary">Actions</Button>
    </Dropdown>
  ),
};

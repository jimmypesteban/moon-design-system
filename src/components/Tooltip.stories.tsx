import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip } from "./Tooltip";
import { Button } from "./Button";
import { Trash2 } from "../icons";
import { within } from "storybook/test";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Overlays/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  argTypes: {
    placement: {
      control: "radio",
      options: ["top", "bottom", "left", "right"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: 60 }}>
      <Tooltip content="Delete class">
        <button
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 8 }}
        >
          <Trash2 size={18} />
        </button>
      </Tooltip>
    </div>
  ),
};

export const AllPlacements: Story = {
  // A gallery: every variant side by side is the point, so it is wider than a
  // phone on purpose. Exempt from the width sweep rather than reshaped.
  tags: ["no-width-sweep"],
  render: () => (
    <div style={{ display: "flex", gap: 60, padding: 60 }}>
      {(["top", "bottom", "left", "right"] as const).map((placement) => (
        <Tooltip
          key={placement}
          content={`Placement: ${placement}`}
          placement={placement}
        >
          <button
            style={{
              padding: "6px 12px",
              border: "1px solid #ccc",
              borderRadius: 8,
            }}
          >
            {placement}
          </button>
        </Tooltip>
      ))}
    </div>
  ),
};

/**
 * Open, against the right edge — where a floating panel is most likely to
 * escape the viewport. Tooltip has no `defaultOpen`; it opens on focus, so the
 * play function focuses the trigger and the panel is on screen by the time the
 * width sweep measures it.
 */
export const OpenNearEdge: Story = {
  tags: ['overlay-open'],
  render: () => (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <Tooltip content="A hint long enough to run past the edge if nothing clamps it">
        <button type="button">Near the edge</button>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button");
    trigger.focus();
  },
};

/**
 * The label, shown. Every other story renders a trigger and asks you to hover,
 * which documents the trigger rather than the Tooltip — and a thumbnail frame is
 * never hovered or focused, so the component index had nothing to show.
 */
export const Open: Story = {
  tags: ["overlay-open"],
  render: () => (
    <Tooltip content="Marked automatically once the deadline passes" defaultOpen placement="bottom">
      <Button variant="primary">Auto-marking</Button>
    </Tooltip>
  ),
};

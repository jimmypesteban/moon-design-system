import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover } from "./Popover";
import { Button } from "./Button";

const meta: Meta<typeof Popover> = {
  title: "Components/Overlays/Popover",
  component: Popover,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover trigger={<Button variant="secondary">Actions</Button>}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 8,
          minWidth: 160,
        }}
      >
        {["Rename", "Duplicate", "Delete"].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => alert(label)}
            style={{
              textAlign: "left",
              padding: "8px 12px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              borderRadius: 6,
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </Popover>
  ),
};

export const AlignedEnd: Story = {
  name: "Aligned to the Right Edge",
  render: () => (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <Popover
        trigger={<Button variant="secondary">Filter</Button>}
        align="end"
      >
        <div
          style={{
            padding: 16,
            minWidth: 200,
            fontFamily: "system-ui, sans-serif",
            fontSize: 14,
          }}
        >
          A popover can hold any content — a form, a list, filters — not just a
          text hint like Tooltip.
        </div>
      </Popover>
    </div>
  ),
};

/**
 * Rendered open, via the controlled `open` prop.
 *
 * Worth having for its own sake — a closed Popover is indistinguishable from
 * its trigger, so there was no story showing the panel without clicking one.
 * The Introduction's component index uses this as its thumbnail for the same
 * reason: every overlay's card was a picture of a button.
 *
 * Tagged `overlay-open` so the width sweep measures the panel against the
 * viewport rather than the page's scrollWidth, as it does for Modal and Tooltip.
 */
export const Open: Story = {
  tags: ["overlay-open"],
  render: () => (
    // `primary`, not the `secondary` the other stories use: secondary is known
    // contrast debt (2.85:1, baselined on Button and both other Popover
    // stories), and a new story should not add another instance of a failure
    // the sweep is only tolerating.
    <Popover open trigger={<Button variant="primary">Actions</Button>}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 8,
          minWidth: 160,
        }}
      >
        {["Rename", "Duplicate", "Delete"].map((label) => (
          <span
            key={label}
            style={{
              textAlign: "left",
              padding: "8px 12px",
              borderRadius: 6,
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </Popover>
  ),
};

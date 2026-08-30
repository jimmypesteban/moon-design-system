import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";
import { Plus, Trash2, Download, Eye } from "../icons";

const meta: Meta<typeof Button> = {
  title: "Components/Actions/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "highlight",
        "secondary",
        "tertiary",
        "danger",
        "ghost",
        "link",
        "outline",
        "soft",
        "info",
        "accent",
      ],
    },
    size: { control: "radio", options: ["sm", "md", "lg", "xl"] },
    shape: { control: "radio", options: ["default", "md", "lg", "pill"] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: "Save changes", variant: "primary", size: "md" },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {(
        [
          "primary",
          "highlight",
          "secondary",
          "tertiary",
          "danger",
          "ghost",
          "link",
          "outline",
          "soft",
          "info",
          "accent",
        ] as const
      ).map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

/**
 * `info` — a tinted violet informational/preview action, distinct from
 * brand-red. Found hand-rolled identically across admin's "Enter Student
 * Mode" toggle, a "Regenerate summaries" action, and tutor "Classroom"
 * links, with no shared variant to reach for.
 */
export const Info: Story = {
  args: {
    children: "Enter Student Mode",
    variant: "info",
    leftIcon: <Eye size={18} />,
  },
};

/**
 * `accent` — solid violet, the established primary-action color for the
 * one-on-one/tutoring and calibration product areas specifically (not a
 * brand-red substitute). `info` is this same hue as a light tint; `accent`
 * is its solid-fill sibling, parallel to how `soft` relates to `danger`.
 */
export const Accent: Story = {
  args: { children: "Manage Activities", variant: "accent" },
};

/**
 * `outline` (neutral, no red) and `soft` (tinted-red, lighter than `danger`)
 * were added after several admin pages had already hand-rolled these exact
 * looks independently — e.g. "Import from Google Classroom" (outline) next
 * to "Upload guest classes" (soft) next to a solid red "Create Class"
 * (danger) on the same toolbar.
 */
export const OutlineAndSoft: Story = {
  // A gallery: every variant side by side is the point, so it is wider than a
  // phone on purpose. Exempt from the width sweep rather than reshaped.
  tags: ["no-width-sweep"],
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Button variant="outline" leftIcon={<Download size={18} />}>
        Import from Google Classroom
      </Button>
      <Button variant="soft" leftIcon={<Plus size={18} />}>
        Upload guest classes
      </Button>
      <Button variant="danger" leftIcon={<Plus size={18} />}>
        Create Class
      </Button>
    </div>
  ),
};

/**
 * `asChild` renders Button's classes onto its child element instead of a
 * `<button>` — for a navigational CTA that needs to stay a real link
 * (`next/link`'s `Link`, here substituted with a plain `<a>` since
 * Storybook isn't a Next.js app) rather than a button with a router.push
 * workaround. Inspect the rendered markup below: it's a real `<a href="...">`,
 * not a `<button>`, with Button's classes and icon/label composition
 * merged onto it.
 */
export const AsChildLink: Story = {
  render: () => (
    <Button asChild variant="danger" leftIcon={<Plus size={18} />}>
      <a href="#create">Create Activity</a>
    </Button>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <Button key={size} size={size}>
          Button {size}
        </Button>
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Button leftIcon={<Plus size={18} />}>Add student</Button>
      <Button variant="danger" rightIcon={<Trash2 size={18} />}>
        Delete
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  args: { children: "Saving...", loading: true },
};

export const Disabled: Story = {
  args: { children: "Save changes", disabled: true },
};

export const FullWidth: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Button fullWidth>Continue</Button>
    </div>
  ),
};

/**
 * `shape` is the radius scale: `default` 12px, `md` 16px, `lg` 24px, `pill` full.
 * `pill` is reserved for student-facing surfaces; `md`/`lg` exist because
 * consuming apps use the larger steps (the consumer app renders modal and hero
 * CTAs at 24px) and previously had no way to reach them through Button.
 */
export const Shapes: Story = {
  // A gallery: every variant side by side is the point, so it is wider than a
  // phone on purpose. Exempt from the width sweep rather than reshaped.
  tags: ["no-width-sweep"],
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(["default", "md", "lg", "pill"] as const).map((shape) => (
        <div
          key={shape}
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <span style={{ width: 64, fontSize: 12, color: "#6B6A66" }}>
            {shape}
          </span>
          <Button shape={shape} variant="danger" size="sm">
            Resume activity
          </Button>
          <Button shape={shape} variant="outline" size="sm">
            View results
          </Button>
          <Button shape={shape} variant="soft" size="sm">
            Badges
          </Button>
          <Button
            shape={shape}
            variant="danger"
            size="sm"
            leftIcon={<Plus size={16} />}
          >
            With icon
          </Button>
        </div>
      ))}
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Display/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    audience: { control: "radio", options: ["admin", "student"] },
    variant: {
      control: "select",
      options: ["default", "success", "warning", "danger", "info"],
    },
    size: { control: "radio", options: ["sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Default",
    audience: "admin",
    variant: "default",
    size: "md",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {(["default", "success", "warning", "danger", "info"] as const).map(
        (variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ),
      )}
    </div>
  ),
};

export const StudentVsAdmin: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <p style={{ fontSize: 12, marginBottom: 8 }}>Student (pill)</p>
        <div style={{ display: "flex", gap: 12 }}>
          <Badge audience="student" variant="success">
            Completed
          </Badge>
          <Badge audience="student" variant="warning">
            Due Soon
          </Badge>
        </div>
      </div>
      <div>
        <p style={{ fontSize: 12, marginBottom: 8 }}>Admin (rounded-rect)</p>
        <div style={{ display: "flex", gap: 12 }}>
          <Badge audience="admin" variant="success">
            Published
          </Badge>
          <Badge audience="admin" variant="warning">
            Pending Review
          </Badge>
        </div>
      </div>
    </div>
  ),
};

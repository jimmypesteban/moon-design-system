import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "./Tag";

const COLORS = [
  "grey",
  "yellow",
  "orange",
  "pink",
  "red",
  "purple",
  "green",
  "forest",
  "blue",
  "ocean",
] as const;

const meta: Meta<typeof Tag> = {
  title: "Components/Display/Tag",
  component: Tag,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "select", options: COLORS },
    variant: {
      control: "select",
      options: ["fill", "fill-reverse", "outline"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  args: { children: "Mathematics", color: "blue", variant: "fill" },
};

export const AllColorsFill: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {COLORS.map((color) => (
        <Tag key={color} color={color} variant="fill">
          {color}
        </Tag>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {(["fill", "fill-reverse", "outline"] as const).map((variant) => (
        <div key={variant} style={{ display: "flex", gap: 8 }}>
          <Tag color="red" variant={variant}>
            {variant}
          </Tag>
          <Tag color="blue" variant={variant}>
            {variant}
          </Tag>
          <Tag color="green" variant={variant}>
            {variant}
          </Tag>
        </div>
      ))}
    </div>
  ),
};

export const Removable: Story = {
  args: {
    children: "Overdue",
    color: "red",
    variant: "outline",
    onRemove: () => alert("removed"),
  },
};

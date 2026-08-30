import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Rating, type ThumbsRatingValue } from "./Rating";

const meta: Meta<typeof Rating> = {
  title: "Components/Forms/Rating",
  component: Rating,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Rating>;

export const Default: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState(3);
      return <Rating value={value} onChange={setValue} />;
    }
    return <Demo />;
  },
};

export const HalfStars: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState(3.5);
      return <Rating value={value} onChange={setValue} allowHalf />;
    }
    return <Demo />;
  },
};

export const ReadOnly: Story = {
  args: { value: 4.5, readOnly: true, allowHalf: true },
};

export const SmallSize: Story = {
  args: { value: 4, readOnly: true, size: "sm" },
};

export const Thumbs: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<ThumbsRatingValue>(null);
      return <Rating type="thumbs" value={value} onChange={setValue} />;
    }
    return <Demo />;
  },
};

export const ThumbsPreselectedUp: Story = {
  name: "Thumbs — Preselected Up",
  args: { type: "thumbs", value: "up" },
};

export const ThumbsPreselectedDown: Story = {
  name: "Thumbs — Preselected Down",
  args: { type: "thumbs", value: "down" },
};

export const ThumbsReadOnly: Story = {
  name: "Thumbs — Read Only",
  args: { type: "thumbs", value: null, readOnly: true },
};

/**
 * A play function demonstrating a click interaction — clicks the 5th star
 * and asserts the value actually changed, visible step-by-step in the
 * Interactions panel below the canvas.
 */
export const ClickToRate: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState(3);
      return <Rating value={value} onChange={setValue} />;
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fifthStar = canvas.getByRole("button", { name: "5 stars" });

    // Starting value is 3, so the 5th star isn't filled yet.
    await expect(fifthStar.querySelector(".fill-mo-yellow")).toBeNull();

    await userEvent.click(fifthStar);

    // Clicking it sets the rating to 5 — the 5th star's icon now renders
    // with the filled (fill-mo-yellow) class.
    await expect(fifthStar.querySelector(".fill-mo-yellow")).not.toBeNull();
  },
};

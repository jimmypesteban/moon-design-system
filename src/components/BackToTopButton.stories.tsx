import type { Meta, StoryObj } from "@storybook/react-vite";
import { BackToTopButton } from "./BackToTopButton";

const meta: Meta<typeof BackToTopButton> = {
  title: "Components/Actions/BackToTopButton",
  component: BackToTopButton,
  tags: ["autodocs"],
  parameters: {
    // Renders fixed to the viewport and only appears past a scroll threshold —
    // the default padded decorator's max-width frame doesn't matter here.
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof BackToTopButton>;

/**
 * Only appears once the page has scrolled past 500px, and hides itself while
 * `document.body` has `data-modal-open` set (so it never floats over an open
 * Modal). Scroll this story's canvas down to see it appear.
 */
/**
 * The real component, visible without scrolling: `threshold={0}` plus a static
 * position so it sits in the frame instead of the viewport corner. This is the
 * story the Introduction's card renders — it used to say "Appears only after
 * scrolling" instead of showing anything.
 */
export const Static: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <BackToTopButton threshold={0} style={{ position: "static" }} />
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <div
      style={{
        height: 2000,
        background: "linear-gradient(#F5F4F0, #DEDCD8)",
        position: "relative",
      }}
    >
      <p
        style={{
          padding: 24,
          fontFamily: "system-ui, sans-serif",
          color: "#6B6A66",
        }}
      >
        Scroll down past 500px to see the button appear, fixed to the
        bottom-right corner.
      </p>
      <BackToTopButton />
    </div>
  ),
};

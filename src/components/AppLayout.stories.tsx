import type { Meta, StoryObj } from "@storybook/react-vite";
import { moonLogoBlack } from "../logos";
import { AppLayout } from "./AppLayout";

const meta: Meta<typeof AppLayout> = {
  title: "Layouts/AppLayout",
  component: AppLayout,
  tags: ["autodocs"],
  parameters: {
    // Renders the app shell itself (TopNav + full-page <main>), not a boxed component.
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof AppLayout>;

/**
 * The full app shell — `TopNav` plus a `<main>` for page content. Pass the
 * same `user`/`onLogout`/`appName` props it forwards straight through to
 * `TopNav`.
 */
export const Default: Story = {
  args: {
    appName: "Lessons",
    logoSrc: moonLogoBlack,
    user: { name: "Alex Rivera", email: "alex@example.com" },
    onLogout: () => alert("Logout clicked"),
    children: (
      <div
        style={{
          padding: 24,
          fontFamily: "system-ui, sans-serif",
          color: "#6B6A66",
        }}
      >
        Page content goes here, inside {"<main>"}.
      </div>
    ),
  },
};

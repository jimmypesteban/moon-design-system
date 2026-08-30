import type { Meta, StoryObj } from "@storybook/react-vite";
import { TopNav } from "./TopNav";

const meta: Meta<typeof TopNav> = {
  title: "Components/Navigation/TopNav",
  component: TopNav,
  tags: ["autodocs"],
  parameters: {
    // Renders as a full-width sticky top bar, not a boxed component.
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof TopNav>;

/**
 * The Mosaic logo (`/mosaic-logo-black.svg`) is a public-path asset each
 * consuming app supplies from its own `/public` folder (same convention as
 * `Logo`) — a real app provides its own file at that path. Storybook shows
 * the actual logo too, via a matching file in `.storybook/public/` wired
 * up through `staticDirs` in `.storybook/main.ts`, so this demo doesn't
 * show a broken-image icon.
 */
export const LoggedOut: Story = {
  args: { appName: "Lessons" },
};

export const LoggedIn: Story = {
  args: {
    appName: "Lessons",
    user: { name: "Alex Rivera", email: "alex@example.com" },
    onLogout: () => alert("Logout clicked"),
  },
};

export const LoggedInNoName: Story = {
  args: {
    appName: "Paper Grader",
    user: { email: "teacher@school.edu" },
    onLogout: () => alert("Logout clicked"),
  },
};

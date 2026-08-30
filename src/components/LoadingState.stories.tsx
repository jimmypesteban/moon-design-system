import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  LoadingScreen,
  LoadingPanel,
  LoadingInline,
  LoadingButtonLabel,
} from "./LoadingState";
import { Button } from "./Button";

const meta: Meta<typeof LoadingPanel> = {
  title: "Components/Feedback/LoadingState",
  component: LoadingPanel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LoadingPanel>;

/**
 * The default, in-content loading state — drop this into a route's
 * `loading.tsx` or anywhere a section of a page is still fetching.
 */
export const Panel: Story = {};

export const PanelSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <LoadingPanel size="sm" />
      <LoadingPanel size="md" />
      <LoadingPanel size="lg" />
    </div>
  ),
};

/**
 * Full-viewport variant for a whole-page loading state (e.g. the root
 * `app/loading.tsx`). Rendered here at a fixed height since it would
 * otherwise fill the whole Storybook canvas.
 */
export const Screen: Story = {
  render: () => (
    <div style={{ height: 420, overflow: "hidden", position: "relative" }}>
      <LoadingScreen />
    </div>
  ),
};

/**
 * Compact variant for next to a heading or inside a small area while a
 * section refreshes.
 */
export const Inline: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <LoadingInline size="xs">Refreshing…</LoadingInline>
      <LoadingInline size="sm">Loading your classes…</LoadingInline>
      <LoadingInline size="md">Saving changes…</LoadingInline>
    </div>
  ),
};

/**
 * For a button's own pending state — pass as `children` while `disabled`.
 */
export const ButtonLabel: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Button disabled>
        <LoadingButtonLabel size="sm">Submitting…</LoadingButtonLabel>
      </Button>
      <Button variant="secondary" disabled>
        <LoadingButtonLabel size="sm" />
      </Button>
    </div>
  ),
};

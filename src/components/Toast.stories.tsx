import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toast } from "./Toast";

const meta: Meta<typeof Toast> = {
  title: "Components/Feedback/Toast",
  component: Toast,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["success", "warning", "danger", "info"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  args: {
    variant: "success",
    title: "Saved",
    children: "Your changes have been saved.",
    onClose: () => alert("dismissed"),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Toast variant="success" title="Toast Title" onClose={() => {}}>
        Successful message
      </Toast>
      <Toast variant="danger" title="Toast Title" onClose={() => {}}>
        Unsuccessful message
      </Toast>
      <Toast variant="warning" title="Not enough sessions" onClose={() => {}}>
        You don&apos;t have enough sessions for 5 lessons. You currently have 3
        sessions available.
      </Toast>
      <Toast variant="info" title="Restoring" onClose={() => {}}>
        Restoring 1 item — 7 sec left.
      </Toast>
    </div>
  ),
};

export const WithAction: Story = {
  args: {
    variant: "danger",
    children: "1 item has failed to delete.",
    action: { label: "Retry", onClick: () => alert("retrying") },
    onClose: () => alert("dismissed"),
  },
};

export const NoTitle: Story = {
  args: {
    variant: "info",
    children: "Sorry, your recording is too short. Please try again!",
    onClose: () => {},
  },
};

export const NoCloseButton: Story = {
  args: {
    variant: "success",
    title: "Saved",
    children: "Your changes have been saved.",
  },
};

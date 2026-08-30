import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Modal, ConfirmDialog, AlertDialog } from "./Modal";
import { Button } from "./Button";

const meta: Meta<typeof Modal> = {
  title: "Components/Overlays/Modal",
  component: Modal,
  tags: ["autodocs"],
  argTypes: {
    audience: { control: "radio", options: ["admin", "student"] },
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete class?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </>
        }
      >
        This action can't be undone. All student submissions for this class will
        be removed.
      </Modal>
    </>
  );
}

export const Default: Story = {
  render: () => <ModalDemo />,
};

/**
 * The "are you sure?" preset — same as `Modal`, but with the Cancel/Confirm
 * footer already wired up.
 */
export const ConfirmDialogExample: Story = {
  render: function ConfirmDialogDemo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete class
        </Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => alert("Deleted!")}
          title="Delete class?"
          message="This can't be undone. All student submissions for this class will be removed."
          confirmText="Delete"
          confirmVariant="danger"
        />
      </>
    );
  },
};

/**
 * A single-button acknowledgement — for a message that just needs an "OK",
 * not a confirm/cancel choice.
 */
export const AlertDialogExample: Story = {
  render: function AlertDialogDemo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Trigger error</Button>
        <AlertDialog
          open={open}
          onClose={() => setOpen(false)}
          title="Upload failed"
          message="That file is too large. Files must be under 25 MB."
        />
      </>
    );
  },
};

/**
 * Open, with more content than fits — the case the width sweep checks.
 *
 * Overlays need different assertions from in-flow layout: a fixed, portalled
 * panel does not extend the page's scrollWidth, it just sits partly off-screen.
 * So the sweep measures its rect against the viewport, and checks that nothing
 * paints above it.
 */
export const OpenWithLongContent: Story = {
  tags: ['overlay-open'],
  render: () => (
    <Modal
      open
      onClose={() => {}}
      title="Delete this class?"
      footer={
        <>
          <Button variant="secondary">Cancel</Button>
          <Button variant="danger">Delete</Button>
        </>
      }
    >
      {Array.from({ length: 20 }, (_, i) => (
        <p key={i} className="mb-3">
          Removing this class also removes its schedule, its roster, and every submission
          attached to it. This cannot be undone.
        </p>
      ))}
    </Modal>
  ),
};

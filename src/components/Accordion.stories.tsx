import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Accordion, type AccordionItem } from "./Accordion";

const meta: Meta<typeof Accordion> = {
  title: "Components/Display/Accordion",
  component: Accordion,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const FAQ_ITEMS: AccordionItem[] = [
  {
    key: "grading",
    title: "How is my grade calculated?",
    content:
      "Each assignment is weighted according to your class syllabus, then averaged across the term.",
  },
  {
    key: "late",
    title: "What happens if I submit late?",
    content:
      "Late submissions are accepted up to 3 days after the due date, with a 10% deduction per day.",
  },
  {
    key: "retake",
    title: "Can I retake a quiz?",
    content: "Quizzes can be retaken once if your first score is below 70%.",
  },
  { key: "disabled", title: "Coming soon", content: "", disabled: true },
];

export const SingleOpen: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState<string[]>(["grading"]);
      return <Accordion items={FAQ_ITEMS} openKeys={open} onChange={setOpen} />;
    }
    return <Demo />;
  },
};

export const MultipleOpen: Story = {
  name: "Multiple Open At Once",
  render: () => {
    function Demo() {
      const [open, setOpen] = useState<string[]>(["grading", "late"]);
      return (
        <Accordion
          items={FAQ_ITEMS}
          openKeys={open}
          onChange={setOpen}
          multiple
        />
      );
    }
    return <Demo />;
  },
};

export const AllClosed: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState<string[]>([]);
      return <Accordion items={FAQ_ITEMS} openKeys={open} onChange={setOpen} />;
    }
    return <Demo />;
  },
};

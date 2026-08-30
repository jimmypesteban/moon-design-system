import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { StepperNav, type StepperNavStep } from "./StepperNav";
import { Button } from "./Button";

const meta: Meta<typeof StepperNav> = {
  title: "Components/Navigation/StepperNav",
  component: StepperNav,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StepperNav>;

const STEPS = [
  { key: "upload", label: "Upload" },
  { key: "review", label: "Review" },
  { key: "publish", label: "Publish" },
];

/**
 * A completed step is revisitable by default; steps ahead of the current
 * one are disabled until they're reached.
 */
export const Interactive: Story = {
  render: () => {
    function Demo() {
      const [index, setIndex] = useState(1);
      const steps: StepperNavStep[] = STEPS.map((s, i) => ({
        ...s,
        status: i < index ? "complete" : i === index ? "current" : "upcoming",
      }));
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StepperNav
            steps={steps}
            currentKey={steps[index].key}
            onNavigate={(key) =>
              setIndex(steps.findIndex((s) => s.key === key))
            }
          />
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant="secondary"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              Back
            </Button>
            <Button
              disabled={index === steps.length - 1}
              onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      );
    }
    return <Demo />;
  },
};

export const AllUpcoming: Story = {
  args: { steps: STEPS, currentKey: "upload" },
};

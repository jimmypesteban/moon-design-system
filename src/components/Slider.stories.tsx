import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Slider } from "./Slider";

const meta: Meta<typeof Slider> = {
  title: "Components/Forms/Slider",
  component: Slider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState(40);
      return <Slider label="Volume" value={value} onChange={setValue} />;
    }
    return <Demo />;
  },
};

export const CustomRange: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState(1);
      return (
        <Slider
          label="Playback speed"
          value={value}
          onChange={setValue}
          min={0.5}
          max={2}
          step={0.1}
        />
      );
    }
    return <Demo />;
  },
};

export const Disabled: Story = {
  args: { label: "Volume", value: 60, disabled: true },
};

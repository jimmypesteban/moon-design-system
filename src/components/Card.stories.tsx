import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";
import { Button } from "./Button";
import { Tag } from "./Tag";
import { Rocket } from "../icons";

const meta: Meta<typeof Card> = {
  title: "Components/Display/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    audience: { control: "radio", options: ["admin", "student"] },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: "Class roster",
    children: "24 students enrolled",
    audience: "admin",
  },
};

export const WithFooter: Story = {
  render: () => (
    <Card
      title="Delete class?"
      footer={
        <>
          <Button variant="secondary">Cancel</Button>
          <Button variant="danger">Delete</Button>
        </>
      }
    >
      This action can't be undone.
    </Card>
  ),
};

export const NoTitle: Story = {
  args: {
    children: "A minimal card with no title or footer.",
  },
};

export const StudentAudience: Story = {
  args: {
    title: "Up next",
    children: "Reading Comprehension — Unit 3",
    audience: "student",
  },
};

/**
 * The shape a Card usually ends up as in the product: an image or tinted block,
 * a title, a couple of tags, and one action. Modelled on the games grid in
 * the consumer app, which builds this by hand today — the point of the story is that
 * Card, Tag and Button already compose into it.
 *
 * Used as this component's thumbnail on the Introduction index, where the plain
 * title-and-a-line-of-text version said very little about what a Card is for.
 */
export const RichContent: Story = {
  render: () => (
    <Card className="w-72">
      <div className="flex flex-col gap-4">
        <div className="flex aspect-[105/74] w-full items-center justify-center rounded-mo-md bg-mo-blue-1">
          <Rocket size={40} className="text-mo-blue" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-heading text-mo-body-lg font-bold text-mo-black">Word Sprint</span>
          <div className="flex flex-wrap gap-1.5">
            {/* fill-reverse on dark colours, because Tag's default tint is
                known contrast debt — every Tag story carries a baselined
                finding for it, and a new story should not add another. */}
            <Tag variant="fill-reverse" color="ocean">
              Vocabulary
            </Tag>
            <Tag variant="fill-reverse" color="forest">
              5 min
            </Tag>
          </div>
        </div>
        <Button variant="primary" className="w-full">
          Play
        </Button>
      </div>
    </Card>
  ),
};

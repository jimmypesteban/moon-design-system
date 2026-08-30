import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container } from "./Container";

const meta: Meta<typeof Container> = {
  title: "Foundations/Container",
  component: Container,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {
  render: () => (
    <Container className="bg-mo-blue/10">
      <div style={{ padding: "24px 0", textAlign: "center" }}>
        Resize the viewport — padding and max-width change at each breakpoint.
      </div>
    </Container>
  ),
};

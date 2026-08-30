import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SearchInput } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Components/Forms/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {
    placeholder: "Search students...",
    onSearch: (v) => alert(`Search: ${v}`),
  },
};

export const WithButtonLabel: Story = {
  args: { placeholder: "Search...", showButtonLabel: true },
};

export const WithMic: Story = {
  args: { placeholder: "Search...", onMicClick: () => alert("mic clicked") },
};

export const AllSizes: Story = {
  // A gallery: every variant side by side is the point, so it is wider than a
  // phone on purpose. Exempt from the width sweep rather than reshaped.
  tags: ["no-width-sweep"],
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 12, width: 320 }}
    >
      <SearchInput size="sm" placeholder="Small" />
      <SearchInput size="md" placeholder="Medium" />
      <SearchInput size="lg" placeholder="Large" />
    </div>
  ),
};

/**
 * A play function demonstrating typing + a mocked callback (`fn()`) — types
 * a query, clicks the search button, and asserts `onSearch` actually fired
 * with the typed text, not just that nothing crashed.
 */
export const TypeAndSearch: Story = {
  args: { placeholder: "Search students...", onSearch: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Search students...");
    const searchButton = canvas.getByRole("button", { name: "Search" });

    await userEvent.type(input, "algebra");
    await expect(input).toHaveValue("algebra");

    await userEvent.click(searchButton);
    await expect(args.onSearch).toHaveBeenCalledWith("algebra");
  },
};

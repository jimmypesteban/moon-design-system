import type { Meta, StoryObj } from "@storybook/react-vite";
import { AudioPlayer } from "./AudioPlayer";

// A short, freely-usable public sample so the player has something real to
// load — not a Mosaic asset, just enough to exercise play/pause/seek.
const SAMPLE_URL = "https://www.w3schools.com/html/horse.mp3";

const meta: Meta<typeof AudioPlayer> = {
  title: "Components/Display/AudioPlayer",
  component: AudioPlayer,
  tags: ["autodocs"],
  argTypes: {
    colorScheme: { control: "radio", options: ["purple", "blue"] },
  },
};

export default meta;
type Story = StoryObj<typeof AudioPlayer>;

export const Default: Story = {
  args: { url: SAMPLE_URL },
};

export const BlueAdminTheme: Story = {
  args: { url: SAMPLE_URL, colorScheme: "blue", label: "Voice Recording" },
};

export const WithTranscript: Story = {
  args: {
    url: SAMPLE_URL,
    colorScheme: "blue",
    label: "Voice Recording",
    transcript:
      "Neigh! (This is a placeholder transcript for the sample clip above.)",
  },
};

/**
 * The player in the results page's fixed sidebar column — the real regression.
 *
 * the consumer app's results view renders "Your Response" inside
 * `xl:grid-cols-[minmax(0,1.18fr)_340px]`, and 340px is right at the edge:
 * minus the card's `p-4` and the row's `px-3` it leaves 284px, while the row's
 * own minimum was 289px (32 play + 12 gap + 217 slider-and-timestamp + 12 gap
 * + 16 volume). A flex item defaults to `min-width: auto`, so the group holding
 * the slider and the timestamp could not shrink below its content — the slider
 * stuck at its 129px intrinsic width and the timestamp and volume icon spilled
 * out past the card's edge.
 *
 * Keep these two stories. The failure only appears below ~324px of card width,
 * which is why it survived: every wider layout looks fine.
 */
export const InsideSidebarColumn: Story = {
  args: { url: SAMPLE_URL },
  render: (args) => (
    <div
      style={{ maxWidth: 340 }}
      className="rounded-mo-lg border border-mo-yellow-2 bg-mo-yellow-1 p-4"
    >
      <h3 className="mb-4 text-lg font-semibold text-[#6B5F55]">
        Your Response
      </h3>
      <AudioPlayer {...args} />
    </div>
  ),
};

/** Well below the threshold — nothing may leave the card here either. */
export const VeryNarrow: Story = {
  args: { url: SAMPLE_URL },
  render: (args) => (
    <div
      style={{ maxWidth: 240 }}
      className="rounded-mo-lg border border-mo-yellow-2 bg-mo-yellow-1 p-3"
    >
      <AudioPlayer {...args} />
    </div>
  ),
};

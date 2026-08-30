// One plain-language "what this is for" line per component, keyed by the
// exact item name Storybook shows after the group (e.g. "Components/Button"
// -> "Button"). Rendered automatically on every autodocs page by
// AutoDocsPage.tsx, based on the story's own title — no per-component-file
// changes needed to pick this up.
//
// Keep this in sync with Introduction.mdx's COMPONENT_GROUPS list: that page
// groups components by purpose with a per-GROUP blurb, this file adds a
// per-COMPONENT blurb one level more specific, shown once someone has
// already clicked in. Add a line here whenever a new component ships.
export const COMPONENT_BLURBS: Record<string, string> = {
  // Layout
  Container: 'Keeps page content from stretching too wide or sitting flush against the screen edge — the outer wrapper most pages start with.',
  Card: 'A bordered, slightly raised box for grouping related content — the basic building block for most panels and lists.',
  Tabs: 'Switches between a few related views without leaving the page, like flipping between tabs in a folder.',
  Accordion: 'A stack of headers that expand to show more content one at a time — good for FAQs or long settings lists.',

  // Forms & Inputs
  Input: 'A single-line text box — names, emails, search terms, anything typed in one line.',
  Textarea: 'A multi-line text box for longer typed answers, like a comment or a written response.',
  Select: 'A dropdown for picking one option from a list, instead of typing it.',
  SearchInput: 'A text box built specifically for search — includes the magnifying-glass icon and clear button.',
  Checkbox: 'A box someone ticks to turn something on or off, or to pick more than one option from a list.',
  RadioGroup: 'A set of round buttons where only one can be picked at a time — used for either/or choices. The single control is documented on the same page.',
  Switch: 'An on/off toggle, styled like a physical light switch — for a single yes/no setting.',
  Slider: 'A draggable handle on a track for picking a number within a range, like a volume control.',
  DatePicker: 'A text box paired with a calendar popup for picking a date.',
  TimePicker: 'A text box paired with a clock-style popup for picking a time of day.',
  DateTimeField: 'One field for picking a date AND a time together — type it directly or use the calendar popup — instead of two separate fields.',
  FileDropzone: 'A drag-and-drop area for uploading files, with a click-to-browse fallback and a list of what\'s already been added.',
  StepperNav: 'A row of clickable step pills for navigating a multi-step wizard — click a completed step to go back to it. (Steps, by contrast, is just a display, not clickable.)',

  // Actions
  Button: 'The default clickable action — save, submit, delete, confirm, or any other action someone takes on purpose.',
  FloatingActionButton: 'A round button that floats above the page in a fixed spot (usually a corner) for the page\'s single most important action.',
  Pagination: 'The page-number controls at the bottom of a long list or table, for moving between pages of results.',
  Breadcrumb: 'The "you are here" trail near the top of a page, showing the path back to where someone came from.',

  // Feedback & Status
  Badge: 'A small colored label attached to something else — a count, a status word, or a short tag.',
  Tag: 'A small removable chip, usually shown in a group — filters, keywords, or categories someone has picked.',
  Toast: 'A brief message that pops up, usually in a corner, and disappears on its own — "Saved!", "Copied to clipboard."',
  Alert: 'A banner that stays on the page until someone dismisses it or the underlying issue is resolved — for anything more important than a Toast.',
  ProgressBar: 'A horizontal bar that fills up to show how much of something is done.',
  Skeleton: 'A gray placeholder shape shown while real content is still loading, so the page doesn\'t look empty or broken.',
  Spinner: 'A small spinning icon shown while something is loading, when there\'s nothing else useful to show yet.',
  LoadingState: 'The branded Moon loading animation (mascot face + colored blocks) — for a full page, an in-page panel, an inline "Saving…" label, or inside a button.',
  EmptyState: 'The "nothing here yet" screen — an icon, a title, an optional description, and an optional button, for whenever a list or page has no content to show.',
  NotificationBell: 'A bell icon with an unread-count badge that opens a popover list of notifications.',
  Steps: 'A row of numbered steps showing progress through a multi-step process, like a checkout or setup wizard.',
  Tooltip: 'A short label that appears when someone hovers over or focuses something, explaining what it does.',
  Popover: 'A small floating panel that opens next to whatever was clicked — for menus, extra options, or a short form.',
  Modal: "A popup box that takes over the screen until someone closes it or finishes what it's asking — confirmations, forms, important messages. Includes two ready-made presets on the same page: ConfirmDialog (a Cancel/Confirm \"are you sure?\" box) and AlertDialog (a single-button \"OK\" acknowledgement).",

  // Rating & Identity
  Rating: 'Lets someone give or see a rating, either as star icons or a thumbs up/down.',
  Avatar: 'A small round photo or initials representing a person — can also show their level/tier as a decorative frame.',
  Divider: 'A thin line (with an optional label) used to visually separate two sections of content.',

  // Brand
  Logo: 'The real Moon wordmark and mark, in every brand color, ready to view and download as SVG or PNG.',
  CustomIcon: 'Renders one of Moon\'s custom, non-Lucide icons (mascot, language flags, education-specific icons) by name.',

  // Navigation & Shell
  // Said "sidebar plus main content area" for a component that has no
  // sidebar — its props are appName, user, onLogout and children, and it
  // renders TopNav over a <main>. The index preview looked broken because it
  // disagreed with this sentence, and the sentence was the wrong half.
  AppLayout: 'The app shell — the top navigation bar above a <main> for page content, which full pages are built on.',
  TopNav: 'The top navigation bar shown across the top of the app.',
  BackToTopButton: 'A small button that appears after scrolling down and jumps back to the top of the page when clicked.',

  // Media
  AudioPlayer: 'A styled audio player for playing back a sound clip or recording.',

  // Menus
  Dropdown: 'A button that opens a small floating menu of actions when clicked.',

  // Added when the index started showing a card per component: a
  // component with no description leaves a blank card, and there is no
  // good reason for the system to be unable to say what it is for.
  Kbd: 'A small key-shaped label for a keyboard shortcut, like the ⌘K shown next to a search box.',
  CommandPalette: 'The ⌘K search overlay for jumping straight to a page or action without navigating there.',
};

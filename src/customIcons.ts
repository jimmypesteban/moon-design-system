// Mosaic custom icons — concepts the product needs that have no generic
// lucide equivalent (see icons.ts for why the two sets are separate). Each
// SVG uses `currentColor` so it can be sized and recolored the same way as
// a lucide icon via the <CustomIcon> component.

import aiGraded from '../assets/icons/ai-graded.svg?raw';
import answer from '../assets/icons/answer.svg?raw';
import bot from '../assets/icons/bot.svg?raw';
import challenge from '../assets/icons/challenge.svg?raw';
import classIcon from '../assets/icons/class.svg?raw';
import hard from '../assets/icons/hard.svg?raw';
import highlight from '../assets/icons/highlight.svg?raw';
import listening from '../assets/icons/listening.svg?raw';
import rank from '../assets/icons/rank.svg?raw';
import raiseHand from '../assets/icons/raise-hand.svg?raw';
import reading from '../assets/icons/reading.svg?raw';
import sessions from '../assets/icons/sessions.svg?raw';
import slides from '../assets/icons/slides.svg?raw';
import speaking from '../assets/icons/speaking.svg?raw';
import spot from '../assets/icons/spot.svg?raw';
import strengths from '../assets/icons/strengths.svg?raw';
import teacher from '../assets/icons/teacher.svg?raw';
import timerUnlimited from '../assets/icons/timer-unlimited.svg?raw';
import weakness from '../assets/icons/weakness.svg?raw';
import writing from '../assets/icons/writing.svg?raw';

export const CUSTOM_ICONS = {
  'ai-graded': aiGraded,
  'answer': answer,
  'bot': bot,
  'challenge': challenge,
  'class': classIcon,
  'hard': hard,
  'highlight': highlight,
  'listening': listening,
  'rank': rank,
  'raise-hand': raiseHand,
  'reading': reading,
  'sessions': sessions,
  'slides': slides,
  'speaking': speaking,
  'spot': spot,
  'strengths': strengths,
  'teacher': teacher,
  'timer-unlimited': timerUnlimited,
  'weakness': weakness,
  'writing': writing,
} as const;

export type CustomIconName = keyof typeof CUSTOM_ICONS;

export const CUSTOM_ICON_NAMES = Object.keys(CUSTOM_ICONS) as CustomIconName[];

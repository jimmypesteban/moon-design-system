import React from 'react';
import { X } from '../icons';

export type TagColor =
  | 'grey'
  | 'yellow'
  | 'orange'
  | 'pink'
  | 'red'
  | 'purple'
  | 'green'
  | 'forest'
  | 'blue'
  | 'ocean';
export type TagVariant = 'fill' | 'fill-reverse' | 'outline';

export interface TagProps {
  children: React.ReactNode;
  color?: TagColor;
  variant?: TagVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Shows a remove (×) button and calls this when clicked */
  onRemove?: () => void;
  className?: string;
}

// Every class string is written out in full (not built via template
// concatenation) so Tailwind's static scanner can find it — see
// src/foundations/Icons.mdx's curated-icons note for the same reasoning.
const FILL_CLASSES: Record<TagColor, string> = {
  grey: 'bg-mo-grey text-mo-white',
  yellow: 'bg-mo-yellow text-mo-black',
  orange: 'bg-mo-orange text-mo-white',
  pink: 'bg-mo-pink text-mo-white',
  red: 'bg-mo-red text-mo-white',
  purple: 'bg-mo-purple text-mo-white',
  green: 'bg-mo-green text-mo-black',
  forest: 'bg-mo-forest text-mo-white',
  blue: 'bg-mo-blue text-mo-white',
  ocean: 'bg-mo-ocean text-mo-white',
};

const FILL_REVERSE_CLASSES: Record<TagColor, string> = {
  grey: 'bg-mo-grey-2 text-mo-grey-8',
  yellow: 'bg-mo-yellow-1 text-mo-yellow-8',
  orange: 'bg-mo-orange-1 text-mo-orange-8',
  pink: 'bg-mo-pink-1 text-mo-pink-8',
  red: 'bg-mo-red-1 text-mo-red-7',
  purple: 'bg-mo-purple-1 text-mo-purple-7',
  green: 'bg-mo-green-1 text-mo-green-8',
  forest: 'bg-mo-forest-1 text-mo-forest-7',
  blue: 'bg-mo-blue-1 text-mo-blue-8',
  ocean: 'bg-mo-ocean-1 text-mo-ocean-7',
};

const OUTLINE_CLASSES: Record<TagColor, string> = {
  grey: 'bg-transparent border border-mo-grey-5 text-mo-grey-8',
  yellow: 'bg-transparent border border-mo-yellow-6 text-mo-yellow-8',
  orange: 'bg-transparent border border-mo-orange-6 text-mo-orange-8',
  pink: 'bg-transparent border border-mo-pink-6 text-mo-pink-8',
  red: 'bg-transparent border border-mo-red-6 text-mo-red-7',
  purple: 'bg-transparent border border-mo-purple-6 text-mo-purple-7',
  green: 'bg-transparent border border-mo-green-6 text-mo-green-8',
  forest: 'bg-transparent border border-mo-forest-6 text-mo-forest-7',
  blue: 'bg-transparent border border-mo-blue-6 text-mo-blue-8',
  ocean: 'bg-transparent border border-mo-ocean-6 text-mo-ocean-7',
};

const VARIANT_CLASSES: Record<TagVariant, Record<TagColor, string>> = {
  fill: FILL_CLASSES,
  'fill-reverse': FILL_REVERSE_CLASSES,
  outline: OUTLINE_CLASSES,
};

/**
 * Tag — generic categorization chip across any of the 10 brand hues, with
 * fill / fill-reverse / outline styles. Distinct from `Badge`: `Badge` is a
 * fixed 5-way semantic status chip (success/warning/danger/info/default),
 * `Tag` is for arbitrary data categorization (e.g. subject tags, filters).
 *
 * @example
 * ```tsx
 * <Tag color="blue">Mathematics</Tag>
 * <Tag color="red" variant="outline" onRemove={() => removeFilter('red')}>Overdue</Tag>
 * ```
 */
export function Tag({
  children,
  color = 'grey',
  variant = 'fill',
  leftIcon,
  rightIcon,
  onRemove,
  className = '',
}: TagProps) {
  const classes = [
    'inline-flex items-center gap-1 rounded-mo-sm font-body text-sm font-medium leading-none px-2.5 py-1',
    VARIANT_CLASSES[variant][color],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {leftIcon}
      {children}
      {rightIcon}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="-my-2 ml-0.5 flex size-6 items-center justify-center rounded-full hover:opacity-70"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}

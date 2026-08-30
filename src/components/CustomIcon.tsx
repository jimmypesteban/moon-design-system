import { CUSTOM_ICONS, type CustomIconName } from '../customIcons';

export interface CustomIconProps {
  name: CustomIconName;
  /** Pixel size (width and height). @default 24 */
  size?: number;
  /** CSS color applied via `currentColor` — ignored by flags/logos that ship their own colors. */
  color?: string;
  className?: string;
}

/**
 * Renders one of Moon's custom (non-lucide) icons — real SVG artwork for
 * concepts lucide has no equivalent for (education-domain modes, the
 * product bot, etc). See
 * `customIcons.ts` for the full list and `icons.ts` for why these are separate
 * from the lucide-based set.
 */
export function CustomIcon({ name, size = 24, color = 'currentColor', className }: CustomIconProps) {
  return (
    <span
      role="img"
      aria-label={name}
      className={className}
      style={{ display: 'inline-flex', width: size, height: size, color, flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: CUSTOM_ICONS[name] }}
    />
  );
}

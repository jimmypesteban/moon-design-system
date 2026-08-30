'use client';

import React, { useState } from 'react';
import { Star, ThumbsDown, ThumbsUp } from '../icons';

export type RatingSize = 'sm' | 'md';
export type ThumbsRatingValue = 'up' | 'down' | null;

export interface StarsRatingProps {
  /** Star rating (default) — a 0-5-ish scale, optionally in halves. */
  type?: 'stars';
  /** Current rating, in halves (e.g. 3.5) */
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  /** Allow selecting half-star values by clicking the left/right half of a star */
  allowHalf?: boolean;
  readOnly?: boolean;
  size?: RatingSize;
  className?: string;
}

export interface ThumbsRatingProps {
  /** Thumbs-up/thumbs-down toggle pair instead of stars. */
  type: 'thumbs';
  value: ThumbsRatingValue;
  onChange?: (value: ThumbsRatingValue) => void;
  readOnly?: boolean;
  size?: RatingSize;
  className?: string;
}

export type RatingProps = StarsRatingProps | ThumbsRatingProps;

const STAR_SIZE: Record<RatingSize, number> = {
  sm: 18,
  md: 24,
};

const THUMB_SIZE: Record<RatingSize, number> = {
  sm: 16,
  md: 20,
};

function fillForStar(displayValue: number, starIndex: number) {
  const diff = displayValue - starIndex;
  if (diff >= 1) return 'full';
  if (diff >= 0.5) return 'half';
  return 'empty';
}

function ThumbsRatingView({ value, onChange, readOnly, size = 'md', className = '' }: Omit<ThumbsRatingProps, 'type'>) {
  const thumbSize = THUMB_SIZE[size];
  const toggle = (next: 'up' | 'down') => {
    if (readOnly) return;
    onChange?.(value === next ? null : next);
  };

  return (
    <div className={['inline-flex items-center gap-2', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        disabled={readOnly}
        aria-pressed={value === 'up'}
        aria-label="Thumbs up"
        onClick={() => toggle('up')}
        className={[
          'rounded-mo-sm p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          value === 'up' ? 'text-mo-green' : 'text-mo-black/50 hover:bg-mo-white hover:text-mo-black',
        ].join(' ')}
      >
        <ThumbsUp size={thumbSize} fill={value === 'up' ? 'currentColor' : 'none'} />
      </button>
      <button
        type="button"
        disabled={readOnly}
        aria-pressed={value === 'down'}
        aria-label="Thumbs down"
        onClick={() => toggle('down')}
        className={[
          'rounded-mo-sm p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          value === 'down' ? 'text-mo-red' : 'text-mo-black/50 hover:bg-mo-white hover:text-mo-black',
        ].join(' ')}
      >
        <ThumbsDown size={thumbSize} fill={value === 'down' ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}

function StarsRatingView({
  value,
  onChange,
  max = 5,
  allowHalf = false,
  readOnly = false,
  size = 'md',
  className = '',
}: Omit<StarsRatingProps, 'type'>) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;
  const starSize = STAR_SIZE[size];

  const valueFromEvent = (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!allowHalf) return starIndex + 1;
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    return isLeftHalf ? starIndex + 0.5 : starIndex + 1;
  };

  return (
    <div
      className={['inline-flex items-center gap-1', className].filter(Boolean).join(' ')}
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: max }, (_, starIndex) => {
        const fill = fillForStar(displayValue, starIndex);
        return (
          <button
            key={starIndex}
            type="button"
            disabled={readOnly}
            aria-label={`${starIndex + 1} star${starIndex === 0 ? '' : 's'}`}
            onMouseMove={(e) => !readOnly && setHoverValue(valueFromEvent(starIndex, e))}
            onClick={(e) => !readOnly && onChange?.(valueFromEvent(starIndex, e))}
            className={[
              // The halo that grows an 18px star to a 24px target while preserving
              // the row's 4px rhythm to the pixel; rounding to the grid would shift
              // every star.
              // agent-review-ignore ARBITRARY_SPACING: exactly (24 - 18) / 2, load-bearing
              'flex min-h-6 min-w-6 items-center justify-center -mx-[3px]',
              readOnly ? 'cursor-default' : 'cursor-pointer',
            ].join(' ')}
          >
            <span className="relative inline-block" style={{ width: starSize, height: starSize }}>
              <Star size={starSize} className="absolute inset-0 text-mo-black/20" />
              {fill === 'full' && <Star size={starSize} className="absolute inset-0 fill-mo-yellow text-mo-yellow" />}
              {fill === 'half' && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star size={starSize} className="fill-mo-yellow text-mo-yellow" />
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Rating — user feedback input, either star rating (default) or a
 * thumbs-up/thumbs-down toggle pair. Pass `type="thumbs"` for the latter;
 * `value`/`onChange` types switch accordingly: a number for stars, or
 * `"up" | "down" | null` for thumbs.
 *
 * Keep an inline code span on one line. Storybook renders this block as
 * markdown, and a backtick span broken across lines parses as a code *block* —
 * which dropped an 80px scroll panel with a Copy button into the middle of
 * this sentence, and put a `div` inside a `p`.
 *
 * @example
 * ```tsx
 * <Rating value={rating} onChange={setRating} allowHalf />
 * <Rating value={4.5} readOnly />
 * <Rating type="thumbs" value={feedback} onChange={setFeedback} />
 * ```
 */
export function Rating(props: RatingProps) {
  if (props.type === 'thumbs') {
    const { type: _type, ...rest } = props;
    return <ThumbsRatingView {...rest} />;
  }
  const { type: _type, ...rest } = props;
  return <StarsRatingView {...rest} />;
}

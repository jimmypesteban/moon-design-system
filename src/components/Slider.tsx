'use client';

import React, { useId } from 'react';

export interface SliderProps {
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Slider — single-value range input, e.g. for volume or a numeric setting.
 * The filled portion is a layered visual track behind a transparent native
 * `<input type="range">`, since cross-browser track-fill styling via
 * pseudo-elements alone is unreliable.
 *
 * @example
 * ```tsx
 * <Slider label="Playback speed" value={speed} onChange={setSpeed} min={0.5} max={2} step={0.1} />
 * ```
 */
export function Slider({ value, onChange, min = 0, max = 100, step = 1, label, disabled, className = '' }: SliderProps) {
  const id = useId();
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={['flex flex-col gap-1.5 font-body', className].filter(Boolean).join(' ')}>
      {label && (
        <div className="flex items-center justify-between text-sm font-medium text-mo-black">
          <label htmlFor={id}>{label}</label>
          <span className="text-mo-black/60">{value}</span>
        </div>
      )}
      <div className={['relative flex h-3.5 items-center', disabled ? 'opacity-50' : ''].join(' ')}>
        <div className="pointer-events-none absolute inset-x-0 h-1 rounded-full bg-mo-black/10" />
        <div
          className="pointer-events-none absolute left-0 h-1 rounded-full bg-mo-blue"
          style={{ width: `${percent}%` }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className={[
            'relative h-3.5 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed',
            '[&::-webkit-slider-runnable-track]:bg-transparent',
            '[&::-moz-range-track]:bg-transparent',
            '[&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-mo-blue [&::-webkit-slider-thumb]:bg-white',
            '[&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-mo-blue [&::-moz-range-thumb]:bg-white',
          ].join(' ')}
        />
      </div>
    </div>
  );
}

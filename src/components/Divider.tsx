import React from 'react';

export type DividerLine = 'solid' | 'dashed';
export type DividerLabelPlacement = 'left' | 'center' | 'right';

export interface DividerProps {
  line?: DividerLine;
  /** Optional label rendered inline on the divider */
  label?: React.ReactNode;
  labelPlacement?: DividerLabelPlacement;
  className?: string;
}

const JUSTIFY_CLASSES: Record<DividerLabelPlacement, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

/**
 * Divider — horizontal rule, optionally with an inline label.
 *
 * @example
 * <Divider />
 * <Divider label="OR" labelPlacement="center" />
 */
export function Divider({ line = 'solid', label, labelPlacement = 'center', className = '' }: DividerProps) {
  const lineClass = line === 'dashed' ? 'border-dashed' : 'border-solid';

  if (!label) {
    return <hr className={['border-t border-mo-black/15', lineClass, className].filter(Boolean).join(' ')} />;
  }

  return (
    <div
      role="separator"
      className={['relative flex items-center font-body', JUSTIFY_CLASSES[labelPlacement], className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={['absolute inset-x-0 border-t border-mo-black/15', lineClass].join(' ')} />
      <span className="relative bg-white px-3 text-sm text-mo-black">{label}</span>
    </div>
  );
}

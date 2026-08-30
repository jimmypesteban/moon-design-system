'use client';

import React from 'react';

export interface TabItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

/**
 * Tabs — underline-style tab navigation, used across the admin and
 * consumer apps. The source design system also has a segmented-control
 * ("pill") tab style and a vertical sidebar-tabs style — not built here yet,
 * add them as separate components if a surface actually needs one.
 *
 * @example
 * ```tsx
 * <Tabs tabs={[{ key: 'overview', label: 'Overview' }, { key: 'roster', label: 'Roster' }]} activeKey={tab} onChange={setTab} />
 * ```
 */
export function Tabs({ tabs, activeKey, onChange, className = '' }: TabsProps) {
  return (
    <div role="tablist" className={['flex gap-6 border-b border-mo-black/10 font-body', className].filter(Boolean).join(' ')}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.key)}
            className={[
              'flex items-center gap-1.5 border-b-2 px-1 py-2.5 text-sm font-medium transition-colors -mb-px',
              'disabled:opacity-40 disabled:pointer-events-none',
              isActive ? 'border-mo-blue text-mo-blue' : 'border-transparent text-mo-black/60 hover:text-mo-black',
            ].join(' ')}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

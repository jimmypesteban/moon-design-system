'use client';

import React from 'react';
import { ChevronDown } from '../icons';

export interface AccordionItem {
  key: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Which item key(s) are expanded — fully controlled, same convention as `Tabs`' activeKey */
  openKeys: string[];
  onChange: (openKeys: string[]) => void;
  /** Allow more than one section open at once. @default false */
  multiple?: boolean;
  /**
   * Destroy a section's content when it collapses instead of hiding it.
   * @default false
   *
   * Hiding is the default because unmounting makes the component unusable for
   * the most obvious thing to put in it: a form. Collapsing a panel would
   * throw away whatever the user had typed, which is silent data loss rather
   * than a layout choice, and it cost at least one team a hand-rolled
   * disclosure instead. Hidden content keeps its state, and `hidden` keeps it
   * out of the accessibility tree and out of tab order too.
   *
   * Opt in when a section genuinely should reset — or when it holds something
   * that must actually stop, such as a video or a polling widget.
   */
  unmountOnClose?: boolean;
  className?: string;
}

/**
 * Accordion — expand/collapse sections, for FAQs, grouped settings, or any
 * list of content where only one (or a few) items need to be visible at
 * once. No drawn source exists for this in the reference design file — built
 * from the same visual language as `Tabs`/`Card` (mo-black/10 borders,
 * mo-blue active accents) rather than a specific layer.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState<string[]>(['billing']);
 * <Accordion
 *   items={[{ key: 'billing', title: 'Billing', content: <BillingPanel /> }]}
 *   openKeys={open}
 *   onChange={setOpen}
 * />
 * ```
 */
export function Accordion({
  items,
  openKeys,
  onChange,
  multiple = false,
  unmountOnClose = false,
  className = '',
}: AccordionProps) {
  const toggle = (key: string) => {
    const isOpen = openKeys.includes(key);
    if (multiple) {
      onChange(isOpen ? openKeys.filter((k) => k !== key) : [...openKeys, key]);
    } else {
      onChange(isOpen ? [] : [key]);
    }
  };

  return (
    <div className={['flex flex-col divide-y divide-mo-black/10 overflow-hidden rounded-mo-sm border border-mo-black/10 bg-mo-grey-1 font-body', className].filter(Boolean).join(' ')}>
      {items.map((item) => {
        const isOpen = openKeys.includes(item.key);
        const panelId = `accordion-panel-${item.key}`;
        const buttonId = `accordion-trigger-${item.key}`;
        return (
          <div key={item.key}>
            <button
              type="button"
              id={buttonId}
              disabled={item.disabled}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(item.key)}
              className={[
                'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-mo-black transition-colors',
                'hover:bg-mo-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
              ].join(' ')}
            >
              {item.title}
              <ChevronDown
                size={18}
                className={['shrink-0 text-mo-black/50 transition-transform', isOpen ? 'rotate-180' : ''].join(' ')}
              />
            </button>
            {(isOpen || !unmountOnClose) && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className="px-4 pb-4 text-sm text-mo-black/80"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

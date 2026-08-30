import React from 'react';
import mosaicMark from '../assets/mosaic-mark.svg';

export interface DesignSystemHeaderProps {
  /** Breadcrumb's first segment, e.g. "Foundations" or "Components". Omit on
   * the root Introduction page, which has nothing to be a breadcrumb of. */
  group?: string;
  /** Breadcrumb's bold second segment, and the big page title below it */
  title: string;
  /** Rendered as the description paragraph under the title */
  children?: React.ReactNode;
}

/**
 * Banner used atop every Foundations/Components page — logomark +
 * breadcrumb, a crayon + big page title, and a description paragraph. The
 * mark links back to the Introduction, mirroring the docs footer.
 */
export function DesignSystemHeader({ group, title, children }: DesignSystemHeaderProps) {
  return (
    <div className="mb-8! overflow-hidden rounded-mo-lg border border-mo-grey-3 not-italic">
      <div className="h-2 bg-mo-red" />
      <div className="bg-mo-white px-8 py-8">
        {/* mb-4! (not mb-4): Storybook's own docs typography CSS
            (":where(div...)" in its markdown-content wrapper, unlayered)
            zeroes margin-bottom on every plain div with no !important — a
            layered Tailwind utility loses to that regardless of specificity
            or value. The ! suffix forces !important, which always wins over
            a non-important declaration irrespective of either side's layer
            — same fix already applied below via mb-0!. Verified via
            computed style: without the bang, this row measured 0px. */}
        <div className="mb-4! flex flex-wrap items-center gap-3">
          <a href="/?path=/docs/introduction--docs" target="_top" aria-label="Mosaic" className="shrink-0">
            <img src={mosaicMark} alt="" width={28} height={28} />
          </a>
          {group && (
            <>
              <span className="font-body text-lg text-mo-grey-7">{group}</span>
              <span className="font-body text-lg text-mo-black">→</span>
            </>
          )}
          <span className="break-words font-body text-lg font-bold text-mo-black">{title}</span>
        </div>
        <div className="mb-4! flex min-w-0 items-center gap-4">
          <span className="text-4xl leading-none" aria-hidden="true">
            🖍️
          </span>
          <h1 className="min-w-0 break-words font-heading text-5xl font-bold tracking-tight text-mo-black">
            {title}
          </h1>
        </div>
        {children && (
          <div className="max-w-none break-words font-body text-lg text-mo-grey-7 [&>*:last-child]:mb-0! [&_.docblock-source]:mb-0!">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

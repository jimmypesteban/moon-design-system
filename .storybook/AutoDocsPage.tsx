import React from 'react';
import { useOf, Description, Primary, Controls, Stories } from '@storybook/addon-docs/blocks';
import { DesignSystemHeader } from './DesignSystemHeader';
import { COMPONENT_BLURBS } from './component-blurbs';
import { DocsFooter } from './DocsFooter';

// e.g. "Components/Rating" -> { group: "Components", title: "Rating" }
function splitTitle(title: string) {
  const parts = title.trim().split(/\s*\/\s*/);
  const item = parts.pop() || title;
  const group = parts.join('/') || 'Components';
  return { group, item };
}

/**
 * Replaces Storybook's default autodocs page template (Title, Subtitle,
 * Description, Primary, Controls, Stories) with the same layout, swapping
 * Title+Subtitle for `DesignSystemHeader` — set as `parameters.docs.page` in
 * preview.ts, so every `tags: ['autodocs']` component picks this up for
 * free with no per-file changes.
 */
export function AutoDocsPage() {
  const resolvedOf = useOf('meta', ['meta']);
  const title = resolvedOf.preparedMeta?.title ?? '';
  const { group, item } = splitTitle(title);
  const { stories } = resolvedOf.csfFile;
  const isSingleStory = Object.keys(stories).length === 1;
  const blurb = COMPONENT_BLURBS[item];

  return (
    <>
      <DesignSystemHeader group={group} title={item}>
        {/* The plain-language "what this is for" line always leads — a
            props table with no explanation at all is exactly what read as
            intimidating to non-technical visitors. The component's own
            JSDoc description (sourcing notes, when to reach for this
            vs. a similar component, etc.) still renders right below,
            unchanged, for anyone who wants the fuller technical context. */}
        {blurb ?? <Description of="meta" />}
      </DesignSystemHeader>
      {blurb && <Description of="meta" />}
      {isSingleStory && <Description of="story" />}
      <Primary />
      <Controls />
      {!isSingleStory && <Stories />}
      {/* Every component page ends the same way, so somebody who arrived on a
          deep link still learns what this is and when it was last touched. */}
      <DocsFooter />
    </>
  );
}

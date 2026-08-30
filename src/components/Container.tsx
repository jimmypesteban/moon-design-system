import React from 'react';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * Container — centers content and applies the design system's responsive
 * page margins, from the reference design file's own "Grid layouts" page.
 * Confirmed data points: at a 1440px viewport the container is 1280px wide
 * (80px side margin); at 1600px it's 1440px wide (still 80px). Tablet/mobile
 * go full-bleed with just inner padding — sm/md/lg padding steps here are
 * interpolated between the mobile and confirmed-desktop values, not
 * individually confirmed (see tokens.mjs `container` for the raw numbers).
 *
 * @example
 * ```tsx
 * <Container>
 *   <PageContent />
 * </Container>
 * ```
 */
export function Container({ children, className = '', as: Component = 'div' }: ContainerProps) {
  return (
    <Component
      className={[
        'mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:max-w-320 xl:px-20 2xl:max-w-360',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Component>
  );
}

'use client';

import { type CSSProperties, useEffect, useState } from 'react';

export type BackToTopButtonProps = {
  className?: string;
  style?: CSSProperties;
  /** Scroll depth (px) past which the button appears. 0 shows it immediately. */
  threshold?: number;
};

export function BackToTopButton({ className = '', style, threshold = 500 }: BackToTopButtonProps) {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // >=, not >: the contract is "threshold={0} shows it immediately", and at
    // load scrollY is exactly 0. With strict >, the docs card rendered a live
    // iframe of nothing — which looked more broken than the placeholder it
    // replaced. At the default 500 the boundary pixel is imperceptible.
    const onScroll = () => setVisible(window.scrollY >= threshold);
    // Evaluate once on mount, not only on the next scroll event: a page
    // restored mid-scroll (an anchor link, back-navigation) was already past
    // the threshold and showed no button until the user moved. Also what lets
    // threshold={0} render the button immediately — which the docs index card
    // uses instead of a "cannot preview this" placeholder.
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setModalOpen(document.body.hasAttribute('data-modal-open'));
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['data-modal-open'] });
    return () => obs.disconnect();
  }, []);

  if (!visible || modalOpen) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={[
        'fixed bottom-6 right-6 z-[49] flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        className,
      ].filter(Boolean).join(' ')}
      style={{ backgroundColor: '#B82431', ...style }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </button>
  );
}

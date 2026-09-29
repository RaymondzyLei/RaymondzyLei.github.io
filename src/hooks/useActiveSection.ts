import { useEffect, useState } from 'react';

/** Tracks the section occupying the most visible space below the sticky navigation. */
export const useActiveSection = (sectionIds: string[], offset = 0): string => {
  const [active, setActive] = useState<string>(sectionIds[0] ?? '');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      () => {
        let best = '';
        let bestHeight = 0;
        for (const element of elements) {
          // Ratios favor short sections and cached entries go stale between thresholds.
          const rect = element.getBoundingClientRect();
          const height = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, offset);
          if (height > bestHeight) {
            best = element.id;
            bestHeight = height;
          }
        }
        if (best) setActive(best);
      },
      {
        rootMargin: `-${offset}px 0px 0px 0px`,
        threshold: Array.from({ length: 101 }, (_, index) => index / 100),
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [sectionIds, offset]);

  return active;
};

import { useEffect, useState } from 'react';

/**
 * Tracks which section is currently active in the viewport, for nav highlighting
 * (apple-design §16 wayfinding: "Where am I?").
 *
 * Uses IntersectionObserver on the section roots. The section whose root is
 * most in view wins; we pick the topmost entry when several intersect, with a
 * small threshold so the active item updates just before a section fully arrives.
 *
 * No-op safe: returns the first id until the observer fires.
 */
export const useActiveSection = (sectionIds: string[], offset = 0): string => {
  const [active, setActive] = useState<string>(sectionIds[0] ?? '');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    // Pick the section whose top is closest to (but above) the offset line,
    // favoring the topmost intersecting section for ties.
    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }
        if (visible.size === 0) return;
        // Choose the section with the highest intersection ratio; tie-break by
        // document order (the first one in sectionIds).
        let best = '';
        let bestRatio = -1;
        for (const id of sectionIds) {
          const ratio = visible.get(id);
          if (ratio !== undefined && ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        if (best) setActive(best);
      },
      {
        // Trigger near the top of the viewport (account for sticky AppBar ~64px).
        rootMargin: `-${offset}px 0px -55% 0px`,
        threshold: [0, 0.25, 0.5, 1],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [sectionIds, offset]);

  return active;
};

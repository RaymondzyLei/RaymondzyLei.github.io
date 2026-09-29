import { useCallback, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import { useLenis } from 'lenis/react';

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const update = useCallback((progress: number) => {
    if (ref.current) {
      ref.current.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    }
  }, []);
  useLenis((lenis) => update(lenis.progress));

  useEffect(() => {
    const onResize = () => {
      // Lenis auto-resizes without a scroll event; read current root geometry here.
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      update(limit > 0 ? window.scrollY / limit : 1);
    };
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(onResize);
    observer?.observe(document.body);
    window.addEventListener('resize', onResize);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [update]);

  return (
    <Box
      ref={ref}
      data-scroll-progress
      aria-hidden="true"
      sx={{
        position: 'absolute',
        insetInline: 0,
        bottom: 0,
        height: 2,
        bgcolor: 'primary.main',
        pointerEvents: 'none',
        transform: 'scaleX(0)',
        transformOrigin: 'left',
      }}
    />
  );
}

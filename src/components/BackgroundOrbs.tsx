import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import { alpha, useTheme, useColorScheme } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import { zIndex } from '../theme';
import { ACCENT, MOUSE_ORB as MOUSE_ORB_COLOR } from '../styles/colors';

const ORB_SIZE = 440;
const MOUSE_ORB_SIZE = 240;
const MOUSE_ORB_LERP = 0.1; // fraction of remaining distance per frame

const drift1 = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0); }
  33% { transform: translate3d(60px, -40px, 0); }
  66% { transform: translate3d(-30px, 30px, 0); }
`;

const drift2 = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0); }
  40% { transform: translate3d(-50px, 60px, 0); }
  75% { transform: translate3d(40px, -20px, 0); }
`;

const reduceMotionStyles = {
  '@media (prefers-reduced-motion: reduce)': {
    '.bg-orb': {
      animation: 'none !important',
    },
  },
};

interface OrbData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scrollFactor: number;
}

const getInitialOrbs = (): OrbData[] => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const maxX = Math.max(0, w - ORB_SIZE);
  const maxY = Math.max(0, h - ORB_SIZE);
  return [
    { x: 0.1 * maxX, y: 0.15 * maxY, vx: 0.5, vy: 0.35, scrollFactor: 0.12 },
    { x: 0.65 * maxX, y: 0.5 * maxY, vx: -0.4, vy: 0.55, scrollFactor: 0.18 },
  ];
};

/** OS-level media query with live `change` subscription (never a one-shot capture). */
const useMediaFlag = (query: string): boolean => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
};

/**
 * 3rd background orb: follows the mouse with a lerp trail (desktop,
 * motion-safe only — gated by the parent). Starts at opacity 0; the first
 * mousemove snaps it to the cursor (no cross-screen fly-in) and fades it in.
 */
const MouseOrb: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef<{ x: number; y: number } | null>(null);
  const appearedRef = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    let rafId = 0;
    const animate = () => {
      const target = targetRef.current;
      const el = wrapperRef.current;
      if (target && el) {
        const pos = posRef.current;
        if (!appearedRef.current) {
          appearedRef.current = true;
          pos.x = target.x;
          pos.y = target.y;
          el.style.opacity = '1';
        } else {
          pos.x += (target.x - pos.x) * MOUSE_ORB_LERP;
          pos.y += (target.y - pos.y) * MOUSE_ORB_LERP;
        }
        el.style.transform = `translate3d(${pos.x - MOUSE_ORB_SIZE / 2}px, ${pos.y - MOUSE_ORB_SIZE / 2}px, 0)`;
      }
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  const color = alpha(isDark ? MOUSE_ORB_COLOR.dark : MOUSE_ORB_COLOR.light, isDark ? 0.15 : 0.25);

  return (
    <Box
      ref={wrapperRef}
      data-testid="mouse-orb"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: MOUSE_ORB_SIZE,
        height: MOUSE_ORB_SIZE,
        borderRadius: '50%',
        backgroundColor: color,
        filter: 'blur(100px)',
        // emotion class holds opacity 0; the rAF loop flips an inline style to
        // '1' on first mousemove (inline wins over the class) -> CSS fade-in.
        opacity: 0,
        transition: 'opacity 600ms ease',
        willChange: 'transform',
      }}
    />
  );
};

export const BackgroundOrbs: React.FC = () => {
  const theme = useTheme();
  const { mode } = useColorScheme();
  const isDark = mode === 'dark';

  // Mouse orb is desktop + motion-safe only: no mousemove on coarse pointers,
  // and cursor-chasing is motion itself under prefers-reduced-motion.
  const isCoarsePointer = useMediaFlag('(pointer: coarse)');
  const prefersReducedMotion = useMediaFlag('(prefers-reduced-motion: reduce)');

  const [initialOrbs] = useState(() => getInitialOrbs());

  const wrapper1Ref = useRef<HTMLDivElement>(null);
  const wrapper2Ref = useRef<HTMLDivElement>(null);
  const wrappersRef = useRef([wrapper1Ref, wrapper2Ref]);
  const orbsRef = useRef<OrbData[]>(initialOrbs.map((o) => ({ ...o })));

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onResize = () => {
      const newMaxX = Math.max(0, window.innerWidth - ORB_SIZE);
      const newMaxY = Math.max(0, window.innerHeight - ORB_SIZE);
      for (const orb of orbsRef.current) {
        if (orb.x > newMaxX) orb.x = newMaxX;
        if (orb.y > newMaxY) orb.y = newMaxY;
      }
    };
    window.addEventListener('resize', onResize);

    let rafId = 0;

    const animate = () => {
      const maxX = Math.max(0, window.innerWidth - ORB_SIZE);
      const maxY = Math.max(0, window.innerHeight - ORB_SIZE);
      const scrollOffset = -window.scrollY;

      for (let i = 0; i < orbsRef.current.length; i++) {
        const orb = orbsRef.current[i];
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < 0) {
          orb.x = 0;
          orb.vx = -orb.vx;
        } else if (orb.x > maxX) {
          orb.x = maxX;
          orb.vx = -orb.vx;
        }
        if (orb.y < 0) {
          orb.y = 0;
          orb.vy = -orb.vy;
        } else if (orb.y > maxY) {
          orb.y = maxY;
          orb.vy = -orb.vy;
        }

        const el = wrappersRef.current[i].current;
        if (el) {
          const targetY = orb.y + scrollOffset * orb.scrollFactor;
          const clampedY = Math.max(0, Math.min(maxY, targetY));
          el.style.transform = `translate3d(${orb.x}px, ${clampedY}px, 0)`;
        }
      }

      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Orb1 is a fixed violet brand color, intentionally decoupled from
  // palette.primary (dark-mode text accents use ACCENT.dark instead).
  const orb1Color = alpha(isDark ? ACCENT.orbDark : ACCENT.light, isDark ? 0.16 : 0.32);
  const orb2Color = alpha(theme.palette.info.main, isDark ? 0.12 : 0.26);

  return (
    <>
      <GlobalStyles styles={reduceMotionStyles} />
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: zIndex.backgroundOrb,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <Box
          ref={wrapper1Ref}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            willChange: 'transform',
            transform: `translate3d(${initialOrbs[0].x}px, ${initialOrbs[0].y}px, 0)`,
          }}
        >
          <Box
            className="bg-orb"
            sx={{
              width: ORB_SIZE,
              height: ORB_SIZE,
              borderRadius: '50%',
              backgroundColor: orb1Color,
              filter: 'blur(100px)',
              animation: `${drift1} 15s ease-in-out infinite`,
              willChange: 'transform',
            }}
          />
        </Box>
        <Box
          ref={wrapper2Ref}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            willChange: 'transform',
            transform: `translate3d(${initialOrbs[1].x}px, ${initialOrbs[1].y}px, 0)`,
          }}
        >
          <Box
            className="bg-orb"
            sx={{
              width: ORB_SIZE,
              height: ORB_SIZE,
              borderRadius: '50%',
              backgroundColor: orb2Color,
              filter: 'blur(100px)',
              animation: `${drift2} 22s ease-in-out infinite`,
              willChange: 'transform',
            }}
          />
        </Box>
        {!isCoarsePointer && !prefersReducedMotion && <MouseOrb isDark={isDark} />}
      </Box>
    </>
  );
};

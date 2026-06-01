import { useEffect, useRef, type RefObject } from 'react';

interface UseTiltOptions {
  maxAngle?: number;
}

/**
 * 3D tilt effect hook. Attach the returned ref to the target element.
 * On mousemove, the element tilts based on cursor position (max ±maxAngle degrees).
 * Smoothly interpolates via requestAnimationFrame. No-op when prefers-reduced-motion is set.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(
  options?: UseTiltOptions
): RefObject<T> {
  const ref = useRef<T>(null);
  const max = options?.maxAngle ?? 5;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    let rafId = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const setTransform = () => {
      el.style.transform = `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;
    };

    const animate = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
        currentX = targetX;
        currentY = targetY;
        setTransform();
        rafId = 0;
        return;
      }
      currentX += dx * 0.15;
      currentY += dy * 0.15;
      setTransform();
      rafId = requestAnimationFrame(animate);
    };

    const start = () => {
      if (!rafId) rafId = requestAnimationFrame(animate);
    };

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetY = -ny * 2 * max;
      targetX = nx * 2 * max;
      start();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      start();
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transform = '';
    };
  }, [max]);

  return ref as RefObject<T>;
}

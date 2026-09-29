import { useEffect, useRef, type RefObject } from 'react';

interface UseTiltOptions {
  maxAngle?: number;
}

export function useTilt<T extends HTMLElement = HTMLDivElement>(
  options?: UseTiltOptions,
): RefObject<T> {
  const ref = useRef<T>(null);
  const max = Math.max(0, Math.min(5, options?.maxAngle ?? 5));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hoverMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    let active = !mq.matches && hoverMq.matches;
    let rect: DOMRect | null = null;
    let rafId = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const setTransform = () => {
      el.style.transform =
        currentX === 0 && currentY === 0
          ? ''
          : `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;
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

    const onMove = (e: PointerEvent) => {
      if (!active || e.pointerType === 'touch') return;
      if (!rect) {
        // Measure the resting plane, including when re-entering during the return animation.
        const transform = el.style.transform;
        el.style.transform = 'none';
        rect = el.getBoundingClientRect();
        el.style.transform = transform;
      }
      if (!rect.width || !rect.height) return;
      const nx = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2));
      const ny = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height - 0.5) * 2));
      targetX = -ny * max;
      targetY = nx * max;
      start();
    };

    const onLeave = () => {
      rect = null;
      if (!active) return;
      targetX = 0;
      targetY = 0;
      if (currentX || currentY || rafId) start();
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointercancel', onLeave);
    window.addEventListener('scroll', onLeave, true);
    window.addEventListener('resize', onLeave);

    const onMqChange = () => {
      active = !mq.matches && hoverMq.matches;
      if (!active) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        targetX = targetY = currentX = currentY = 0;
        rect = null;
        el.style.transform = '';
      }
    };
    mq.addEventListener('change', onMqChange);
    hoverMq.addEventListener('change', onMqChange);

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointercancel', onLeave);
      window.removeEventListener('scroll', onLeave, true);
      window.removeEventListener('resize', onLeave);
      mq.removeEventListener('change', onMqChange);
      hoverMq.removeEventListener('change', onMqChange);
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transform = '';
    };
  }, [max]);

  return ref as RefObject<T>;
}

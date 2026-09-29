import { describe, it, expect, afterEach, vi } from 'vitest';
import { screen, cleanup, act, fireEvent } from '@testing-library/react';

// Side-effect: initialize the real i18n instance (localStorage empty -> 'en').
// Not strictly needed for BackgroundOrbs, but keeps the pattern consistent.
import '../i18n/i18n';
import { BackgroundOrbs } from './BackgroundOrbs';
import { renderWithTheme } from '../test/render';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function installMotionControls(reduced = false) {
  const frames = new Map<number, FrameRequestCallback>();
  let id = 0;
  const listeners = new Set<() => void>();
  const mq = {
    matches: reduced,
    addEventListener: (_: string, callback: () => void) => listeners.add(callback),
    removeEventListener: (_: string, callback: () => void) => listeners.delete(callback),
  };
  vi.stubGlobal('matchMedia', (query: string) =>
    query === '(prefers-reduced-motion: reduce)'
      ? mq
      : {
          matches: false,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
        },
  );
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (frame: number) => frames.delete(frame));
  return {
    frames,
    listeners,
    tick() {
      const pending = [...frames.values()];
      frames.clear();
      act(() => pending.forEach((callback) => callback(0)));
    },
    reduce(value: boolean) {
      act(() => {
        mq.matches = value;
        listeners.forEach((callback) => callback());
      });
    },
  };
}

const coarsePointerMedia = (): MediaQueryList =>
  ({
    matches: true,
    media: '(pointer: coarse)',
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;

describe('BackgroundOrbs', () => {
  it('stops all JS motion live and resumes drift when reduced motion is disabled', () => {
    const controls = installMotionControls();
    const { container } = renderWithTheme(<BackgroundOrbs />);
    controls.tick();
    const wrapper = container.querySelector('.bg-orb')!.parentElement!;
    const transform = wrapper.style.transform;
    controls.reduce(true);
    expect(controls.frames.size).toBe(0);
    controls.tick();
    expect(wrapper.style.transform).toBe(transform);
    expect(screen.queryByTestId('mouse-orb')).not.toBeInTheDocument();
    controls.reduce(false);
    controls.tick();
    expect(wrapper.style.transform).not.toBe(transform);
  });

  it('starts no frames when initially reduced, but responds to a live opt-in', () => {
    const controls = installMotionControls(true);
    renderWithTheme(<BackgroundOrbs />);
    expect(controls.frames.size).toBe(0);
    controls.reduce(false);
    expect(controls.frames.size).toBe(1);
  });

  it('schedules mouse frames only on input and stops when settled', () => {
    const controls = installMotionControls();
    renderWithTheme(<BackgroundOrbs />);
    expect(controls.frames.size).toBe(1);
    fireEvent.mouseMove(window, { clientX: 200, clientY: 200 });
    controls.tick();
    const mouse = screen.getByTestId('mouse-orb');
    expect(mouse.style.transform).toBe('translate3d(80px, 80px, 0)');
    expect(mouse.style.opacity).toBe('1');
    expect(controls.frames.size).toBe(1);
    fireEvent.mouseMove(window, { clientX: 400, clientY: 300 });
    expect(controls.frames.size).toBe(2);
    for (let i = 0; i < 100; i++) controls.tick();
    expect(mouse.style.transform).toBe('translate3d(280px, 180px, 0)');
    expect(controls.frames.size).toBe(1);
  });

  it('removes frames, mouse listeners and media subscriptions on unmount', () => {
    const controls = installMotionControls();
    const { unmount } = renderWithTheme(<BackgroundOrbs />);
    fireEvent.mouseMove(window, { clientX: 200, clientY: 200 });
    unmount();
    expect(controls.frames.size).toBe(0);
    expect(controls.listeners.size).toBe(0);
    fireEvent.mouseMove(window, { clientX: 300, clientY: 300 });
    expect(controls.frames.size).toBe(0);
  });

  it('renders the mouse orb on fine pointers without reduced motion', () => {
    // setup.ts's matchMedia stub returns matches:false -> fine pointer,
    // no reduced motion -> mouse orb gated in.
    renderWithTheme(<BackgroundOrbs />);
    expect(screen.getByTestId('mouse-orb')).toBeInTheDocument();
  });

  it('omits the mouse orb on coarse pointers (touch devices)', () => {
    vi.stubGlobal('matchMedia', () => coarsePointerMedia());
    renderWithTheme(<BackgroundOrbs />);
    expect(screen.queryByTestId('mouse-orb')).not.toBeInTheDocument();
  });

  it('omits the mouse orb under prefers-reduced-motion', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));
    renderWithTheme(<BackgroundOrbs />);
    expect(screen.queryByTestId('mouse-orb')).not.toBeInTheDocument();
  });

  it('keeps the two drifting orbs regardless of gating', () => {
    vi.stubGlobal('matchMedia', () => coarsePointerMedia());
    const { container } = renderWithTheme(<BackgroundOrbs />);
    // The fixed layer still exists and hosts the two drifting wrappers.
    const layers = container.querySelectorAll('[aria-hidden="true"]');
    expect(layers.length).toBeGreaterThan(0);
  });
});

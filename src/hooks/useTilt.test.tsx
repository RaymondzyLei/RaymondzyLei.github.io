import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import { useTilt } from './useTilt';

const REDUCED = '(prefers-reduced-motion: reduce)';
const FINE_HOVER = '(hover: hover) and (pointer: fine)';
let frames: Map<number, FrameRequestCallback>;
let media: Map<string, ReturnType<typeof makeMedia>>;

function makeMedia(matches: boolean) {
  const listeners = new Set<(event: { matches: boolean }) => void>();
  return {
    matches,
    addEventListener: (_: string, listener: (event: { matches: boolean }) => void) =>
      listeners.add(listener),
    removeEventListener: (_: string, listener: (event: { matches: boolean }) => void) =>
      listeners.delete(listener),
    fire(next: boolean) {
      this.matches = next;
      listeners.forEach((listener) => listener({ matches: next }));
    },
    listeners,
  };
}

function TiltProbe({ maxAngle }: { maxAngle?: number }) {
  const ref = useTilt({ maxAngle });
  return <div ref={ref} data-testid="tilt" />;
}

function move(el: HTMLElement, x: number, y: number, pointerType = 'mouse') {
  const event = new MouseEvent('pointermove', { clientX: x, clientY: y });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  fireEvent(el, event);
}

function tick() {
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach((callback) => callback(0));
}

function settle() {
  for (let i = 0; i < 100 && frames.size; i++) tick();
  expect(frames.size).toBe(0);
}

beforeEach(() => {
  frames = new Map();
  let nextId = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextId, callback);
    return nextId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  media = new Map([
    [REDUCED, makeMedia(false)],
    [FINE_HOVER, makeMedia(true)],
  ]);
  vi.stubGlobal('matchMedia', (query: string) => media.get(query));
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    right: 100,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => {},
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useTilt', () => {
  it('maps horizontal movement to Y rotation and vertical movement to X rotation', () => {
    render(<TiltProbe />);
    const el = screen.getByTestId('tilt');
    move(el, 75, 50);
    settle();
    expect(el.style.transform).toContain('rotateX(0deg) rotateY(2.5deg)');
    move(el, 50, 75);
    settle();
    expect(el.style.transform).toContain('rotateX(-2.5deg) rotateY(0deg)');
  });

  it.each([undefined, 10])(
    'bounds out-of-rect coordinates to five degrees (option %s)',
    (maxAngle) => {
      render(<TiltProbe maxAngle={maxAngle} />);
      const el = screen.getByTestId('tilt');
      move(el, 300, -100);
      settle();
      expect(el.style.transform).toContain('rotateX(5deg) rotateY(5deg)');
    },
  );

  it('allows a smaller tilt limit', () => {
    render(<TiltProbe maxAngle={2} />);
    const el = screen.getByTestId('tilt');
    move(el, 100, 50);
    settle();
    expect(el.style.transform).toContain('rotateY(2deg)');
  });

  it('measures an untransformed box once per interaction, not on each move', () => {
    render(<TiltProbe />);
    const el = screen.getByTestId('tilt');
    const measure = vi.spyOn(el, 'getBoundingClientRect');
    move(el, 75, 50);
    tick();
    move(el, 75, 50);
    settle();
    expect(measure).toHaveBeenCalledTimes(1);
    expect(el.style.transform).toContain('rotateY(2.5deg)');
    fireEvent.pointerLeave(el);
    settle();
    expect(el.style.transform).toBe('');
    move(el, 75, 50);
    expect(measure).toHaveBeenCalledTimes(2);
  });

  it('smoothly retargets a single running frame loop', () => {
    render(<TiltProbe />);
    const el = screen.getByTestId('tilt');
    move(el, 100, 50);
    tick();
    expect(el.style.transform).toContain('rotateY(0.75deg)');
    move(el, 0, 50);
    expect(frames.size).toBe(1);
    expect(el.style.transform).toContain('rotateY(0.75deg)');
    settle();
    expect(el.style.transform).toContain('rotateY(-5deg)');
  });

  it('remeasures without tilt when re-entering before the return animation settles', () => {
    render(<TiltProbe />);
    const el = screen.getByTestId('tilt');
    move(el, 100, 50);
    tick();
    fireEvent.pointerLeave(el);
    const previous = el.style.transform;
    const box = el.getBoundingClientRect();
    vi.spyOn(el, 'getBoundingClientRect').mockImplementation(() => {
      expect(el.style.transform).toBe('none');
      return box;
    });
    move(el, 0, 50);
    expect(el.style.transform).toBe(previous);
    settle();
    expect(el.style.transform).toContain('rotateY(-5deg)');
  });

  it.each([REDUCED, FINE_HOVER])('does not start motion when initially gated by %s', (query) => {
    media.get(query)!.matches = query === REDUCED;
    render(<TiltProbe />);
    move(screen.getByTestId('tilt'), 100, 50);
    expect(frames.size).toBe(0);
    expect(screen.getByTestId('tilt').style.transform).toBe('');
  });

  it.each([REDUCED, FINE_HOVER])('gates motion and cancels live animation for %s', (query) => {
    render(<TiltProbe />);
    const el = screen.getByTestId('tilt');
    move(el, 100, 50);
    tick();
    media.get(query)!.fire(query === REDUCED);
    expect(el.style.transform).toBe('');
    expect(frames.size).toBe(0);
    move(el, 100, 50);
    expect(frames.size).toBe(0);
    media.get(query)!.fire(query !== REDUCED);
    move(el, 50, 50);
    settle();
    expect(el.style.transform).toBe('');
  });

  it('does not tilt touch input even on a fine-hover device', () => {
    render(<TiltProbe />);
    move(screen.getByTestId('tilt'), 100, 100, 'touch');
    expect(frames.size).toBe(0);
  });

  it.each(['scroll', 'resize'])('returns to rest and invalidates measurements on %s', (event) => {
    render(<TiltProbe />);
    const el = screen.getByTestId('tilt');
    move(el, 100, 50);
    tick();
    fireEvent(window, new Event(event));
    settle();
    expect(el.style.transform).toBe('');
  });

  it('cleans up pending frames, transforms, and media subscriptions on unmount', () => {
    const { unmount } = render(<TiltProbe />);
    const el = screen.getByTestId('tilt');
    move(el, 100, 50);
    tick();
    unmount();
    expect(frames.size).toBe(0);
    expect(el.style.transform).toBe('');
    expect([...media.values()].every((entry) => entry.listeners.size === 0)).toBe(true);
    move(el, 100, 50);
    expect(frames.size).toBe(0);
  });
});

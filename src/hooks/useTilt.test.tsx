import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import { useTilt } from './useTilt';

// matchMedia mql mock with controllable matches + change listeners (useTilt
// subscribes to 'change'). window.matchMedia is a FUNCTION returning an mql.
function makeMatchMedia(matches: boolean) {
  const listeners = new Set<(e: { matches: boolean }) => void>();
  return {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: (_: string, l: (e: { matches: boolean }) => void) => listeners.add(l),
    removeEventListener: (_: string, l: (e: { matches: boolean }) => void) => listeners.delete(l),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    fire: (m: boolean) => listeners.forEach((l) => l({ matches: m })),
  };
}

function TiltProbe({ maxAngle }: { maxAngle?: number }) {
  const ref = useTilt(maxAngle ? { maxAngle } : undefined);
  return <div ref={ref} data-testid="tilt" style={{ width: 100, height: 100 }} />;
}

// jsdom: stub rAF to run cb synchronously (animate converges in <20 recursions),
// stub cancelAnimationFrame (no-op), stub getBoundingClientRect to a 100x100 box at (0,0).
function installStubs() {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
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
  } as DOMRect);
}

beforeEach(() => {
  installStubs();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  cleanup();
});

describe('useTilt', () => {
  it('writes a non-zero rotateX transform on mousemove', () => {
    vi.stubGlobal('matchMedia', () => makeMatchMedia(false));
    render(<TiltProbe />);
    const el = screen.getByTestId('tilt');
    // clientX=75 -> nx=(75-0)/100-0.5=0.25 -> targetX=0.25*2*5=2.5 -> converges to rotateX(2.5deg)
    fireEvent.mouseMove(el, { clientX: 75, clientY: 50 });
    expect(el.style.transform).toContain('perspective(1000px)');
    expect(el.style.transform).toContain('rotateX(2.5deg)');
  });

  it('resets transform to zero on mouseleave', () => {
    vi.stubGlobal('matchMedia', () => makeMatchMedia(false));
    render(<TiltProbe />);
    const el = screen.getByTestId('tilt');
    fireEvent.mouseMove(el, { clientX: 75, clientY: 50 });
    el.dispatchEvent(new MouseEvent('mouseleave'));
    expect(el.style.transform).toContain('rotateX(0deg)');
  });

  it('does not write transform under reduced-motion', () => {
    vi.stubGlobal('matchMedia', () => makeMatchMedia(true));
    render(<TiltProbe />);
    const el = screen.getByTestId('tilt');
    fireEvent.mouseMove(el, { clientX: 75, clientY: 50 });
    expect(el.style.transform).toBe('');
  });

  it('clears transform when matchMedia changes to reduced mid-interaction', () => {
    const mql = makeMatchMedia(false);
    vi.stubGlobal('matchMedia', () => mql);
    render(<TiltProbe />);
    const el = screen.getByTestId('tilt');
    fireEvent.mouseMove(el, { clientX: 75, clientY: 50 });
    expect(el.style.transform).not.toBe('');
    // flip to reduced-motion -> onMqChange clears transform
    mql.fire(true);
    expect(el.style.transform).toBe('');
  });

  it('clamps tilt to maxAngle option', () => {
    vi.stubGlobal('matchMedia', () => makeMatchMedia(false));
    render(<TiltProbe maxAngle={10} />);
    const el = screen.getByTestId('tilt');
    // clientX=100 -> nx=0.5 -> targetX=0.5*2*10=10 (the max)
    fireEvent.mouseMove(el, { clientX: 100, clientY: 50 });
    expect(el.style.transform).toContain('rotateX(10deg)');
  });
});

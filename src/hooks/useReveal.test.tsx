import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Mock react-intersection-observer's useInView so we control `inView` directly,
// avoiding the lib's real IntersectionObserver wiring (fragile in jsdom — it
// throws "IntersectionObserver is not defined" even on the reduced-motion path,
// because useInView's effect still constructs an observer).
const { useInViewMock } = vi.hoisted(() => ({
  useInViewMock: vi.fn(),
}));
vi.mock('react-intersection-observer', () => ({
  useInView: (opts: unknown) => useInViewMock(opts),
}));

import { useReveal } from './useReveal';

// matchMedia mock: window.matchMedia is a FUNCTION returning an mql object.
function mockMatchMedia(matches: boolean) {
  return () => ({
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

function Probe() {
  const { isVisible } = useReveal();
  return <div data-testid="probe" data-visible={isVisible} />;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  useInViewMock.mockReset();
  cleanup();
});

describe('useReveal', () => {
  it('isVisible is false when not in view and motion is enabled', () => {
    useInViewMock.mockReturnValue({ ref: { current: null }, inView: false });
    render(<Probe />);
    expect(screen.getByTestId('probe').getAttribute('data-visible')).toBe('false');
  });

  it('isVisible becomes true when in view', () => {
    useInViewMock.mockReturnValue({ ref: { current: null }, inView: true });
    render(<Probe />);
    expect(screen.getByTestId('probe').getAttribute('data-visible')).toBe('true');
  });

  it('isVisible is true under reduced-motion without intersection', () => {
    useInViewMock.mockReturnValue({ ref: { current: null }, inView: false });
    vi.stubGlobal('matchMedia', mockMatchMedia(true));
    render(<Probe />);
    expect(screen.getByTestId('probe').getAttribute('data-visible')).toBe('true');
  });
});

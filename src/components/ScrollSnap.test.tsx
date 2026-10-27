import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

import { ScrollSnap } from './ScrollSnap';
import { renderWithTheme } from '../test/render';

// Keep lifecycle and motion-gating checks independent of Lenis internals.
const snapInstances: {
  options: Record<string, unknown> | undefined;
  destroy: ReturnType<typeof vi.fn>;
}[] = [];

vi.mock('lenis/snap', () => {
  return {
    default: class {
      options: Record<string, unknown> | undefined;
      destroy = vi.fn();
      constructor(_lenis: unknown, options: Record<string, unknown> | undefined) {
        this.options = options;
        snapInstances.push(this);
      }
      add() {
        return () => {};
      }
    },
  };
});

// Mock lenis/react's useLenis: by default returns a stub Lenis instance.
const useLenisMock = vi.fn((): unknown => ({ scrollTo: vi.fn() }));
vi.mock('lenis/react', () => ({
  useLenis: () => useLenisMock(),
}));

// Render sections with the expected ids so ScrollSnap can look them up.
const renderSections = () => {
  const { container } = renderWithTheme(
    <>
      {['hero', 'skills', 'qualifications', 'academic', 'portfolio', 'contact'].map((id) => (
        <section id={id} key={id} />
      ))}
      <ScrollSnap />
    </>,
  );
  return container;
};

describe('ScrollSnap', () => {
  beforeEach(() => {
    snapInstances.length = 0;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    );
    useLenisMock.mockClear();
    // setup.ts's matchMedia stub returns matches:false -> fine pointer,
    // no reduced motion -> snap active.
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it('does not create a Snap under prefers-reduced-motion', () => {
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
    renderSections();
    expect(snapInstances).toHaveLength(0);
  });

  it('does not create a Snap on coarse pointers (touch devices)', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      media: '(pointer: coarse)',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));
    renderSections();
    expect(snapInstances).toHaveLength(0);
  });

  it('destroys the Snap on unmount', () => {
    const { unmount } = renderWithTheme(
      <>
        <section id="hero" />
        <ScrollSnap />
      </>,
    );
    expect(snapInstances).toHaveLength(1);
    unmount();
    expect(snapInstances[0].destroy).toHaveBeenCalledTimes(1);
  });

  it('does nothing when lenis is not yet available', () => {
    useLenisMock.mockImplementationOnce(() => undefined);
    renderSections();
    expect(snapInstances).toHaveLength(0);
  });
});

import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

import { ScrollSnap } from './ScrollSnap';
import { renderWithTheme } from '../test/render';

// Mock lenis/snap: capture the constructor options and the elements registered
// via addElements, expose destroy for the unmount assertion.
const snapInstances: {
  options: Record<string, unknown> | undefined;
  addedElements: HTMLElement[];
  addedElementOptions: Record<string, unknown> | undefined;
  destroy: ReturnType<typeof vi.fn>;
}[] = [];

vi.mock('lenis/snap', () => {
  return {
    default: class {
      options: Record<string, unknown> | undefined;
      addedElements: HTMLElement[] = [];
      addedElementOptions: Record<string, unknown> | undefined;
      destroy = vi.fn();
      constructor(_lenis: unknown, options: Record<string, unknown> | undefined) {
        this.options = options;
        snapInstances.push(this);
      }
      addElements(elements: HTMLElement[], options?: Record<string, unknown>) {
        this.addedElements.push(...elements);
        this.addedElementOptions = options;
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
    useLenisMock.mockClear();
    // setup.ts's matchMedia stub returns matches:false -> fine pointer,
    // no reduced motion -> snap active.
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it('creates a proximity Snap and registers the 6 homepage sections', () => {
    renderSections();
    expect(snapInstances).toHaveLength(1);
    expect(snapInstances[0].options).toEqual({ type: 'proximity', distanceThreshold: '20%' });
    expect(snapInstances[0].addedElements).toHaveLength(6);
    // All 6 sections, in section order.
    expect(snapInstances[0].addedElements.map((el) => el.id)).toEqual([
      'hero',
      'skills',
      'qualifications',
      'academic',
      'portfolio',
      'contact',
    ]);
    // Sections carry the reveal translateY(24px) at mount; rect math must
    // ignore transforms or the offset gets baked into the snap points.
    expect(snapInstances[0].addedElementOptions).toEqual({
      align: 'start',
      ignoreTransform: true,
    });
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

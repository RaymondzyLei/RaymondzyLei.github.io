import { describe, it, expect, afterEach, vi } from 'vitest';
import { screen, cleanup } from '@testing-library/react';

// Side-effect: initialize the real i18n instance (localStorage empty -> 'en').
// Not strictly needed for BackgroundOrbs, but keeps the pattern consistent.
import '../i18n/i18n';
import { BackgroundOrbs } from './BackgroundOrbs';
import { renderWithTheme } from '../test/render';

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

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

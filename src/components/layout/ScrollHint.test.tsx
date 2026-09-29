import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type Lenis from 'lenis';
import type { ScrollCallback } from 'lenis';
import { LenisContext } from 'lenis/react';
import '../../i18n/i18n';
import { renderWithTheme } from '../../test/render';
import { ScrollHint } from './ScrollHint';

const { scrollToSection } = vi.hoisted(() => ({ scrollToSection: vi.fn() }));
vi.mock('../../hooks/useScrollToSection', () => ({ useScrollToSection: () => scrollToSection }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it('guides the visitor at the top, hides after scrolling, and reappears on return', () => {
  vi.stubGlobal('scrollY', 0);
  const callbacks = new Set<ScrollCallback>();
  const lenis = { scroll: 0 } as Lenis;
  const removeCallback = vi.fn((callback: ScrollCallback) => callbacks.delete(callback));
  const { unmount } = renderWithTheme(
    <LenisContext.Provider
      value={{
        lenis,
        addCallback: (callback) => {
          callbacks.add(callback);
        },
        removeCallback,
      }}
    >
      <ScrollHint />
      <section id="skills" />
    </LenisContext.Provider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Scroll to explore' }));
  expect(scrollToSection).toHaveBeenCalledWith(document.getElementById('skills'));
  act(() => {
    Object.defineProperty(lenis, 'scroll', { value: 20, configurable: true });
    callbacks.forEach((callback) => callback(lenis));
  });
  expect(screen.queryByRole('button', { name: 'Scroll to explore' })).not.toBeInTheDocument();
  act(() => {
    Object.defineProperty(lenis, 'scroll', { value: 0, configurable: true });
    callbacks.forEach((callback) => callback(lenis));
  });
  expect(screen.getByRole('button', { name: 'Scroll to explore' })).toBeVisible();
  unmount();
  expect(callbacks.size).toBe(0);
});

it('does not show over a restored scroll position', () => {
  vi.stubGlobal('scrollY', 800);
  renderWithTheme(<ScrollHint />);
  expect(screen.queryByRole('button', { name: 'Scroll to explore' })).not.toBeInTheDocument();
});

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getHashTarget } from './useHashScroll';

describe('getHashTarget', () => {
  beforeEach(() => {
    document.body.innerHTML = '<section id="skills"></section><section id="hero"></section>';
  });

  it('returns the element for a valid hash', () => {
    const el = getHashTarget('#skills');
    expect(el).not.toBeNull();
    expect(el?.id).toBe('skills');
  });

  it('returns null for an empty hash', () => {
    expect(getHashTarget('')).toBeNull();
    expect(getHashTarget('#')).toBeNull();
  });

  it('returns null for a hash with no matching element', () => {
    expect(getHashTarget('#foobar')).toBeNull();
  });
});

// Mock lenis/react and useMediaQuery so the hook can run outside <ReactLenis>.
const scrollTo = vi.fn();
vi.mock('lenis/react', () => ({ useLenis: () => ({ scrollTo }) }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => false }));

import { renderHook } from '@testing-library/react';
import { useHashScroll } from './useHashScroll';

describe('useHashScroll', () => {
  const addEventListener = window.addEventListener;
  const removeEventListener = window.removeEventListener;
  let mountedListeners: Map<string, EventListener> = new Map();
  let hashChangeSpy: (() => void) | null = null;

  beforeEach(() => {
    scrollTo.mockClear();
    document.body.innerHTML = '<section id="skills"></section>';
    // Intercept hashchange listener registration so we can fire it manually.
    mountedListeners = new Map();
    hashChangeSpy = null;
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === 'hashchange') {
          mountedListeners.set(type, listener as EventListener);
          hashChangeSpy = listener as () => void;
        } else {
          addEventListener.call(window, type, listener);
        }
      },
    );
    vi.spyOn(window, 'removeEventListener').mockImplementation(
      (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === 'hashchange') {
          mountedListeners.delete(type);
        } else {
          removeEventListener.call(window, type, listener);
        }
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers a hashchange listener and cleans up on unmount', () => {
    const { unmount } = renderHook(() => useHashScroll());
    expect(mountedListeners.has('hashchange')).toBe(true);
    unmount();
    expect(mountedListeners.has('hashchange')).toBe(false);
  });

  it('scrolls to the section matching the current hash on mount', () => {
    window.location.hash = 'skills';
    renderHook(() => useHashScroll());
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo.mock.calls[0][0]).toBe(document.getElementById('skills'));
  });

  it('scrolls when the hashchange listener fires at runtime', () => {
    window.location.hash = '';
    renderHook(() => useHashScroll());
    window.location.hash = 'skills';
    // jsdom may or may not auto-fire hashchange — fire the intercepted listener
    // manually to guarantee the test is deterministic.
    hashChangeSpy?.();
    expect(scrollTo).toHaveBeenCalled();
    expect(scrollTo.mock.calls[0][0]).toBe(document.getElementById('skills'));
  });

  it('ignores an invalid hash', () => {
    window.location.hash = 'foobar';
    renderHook(() => useHashScroll());
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

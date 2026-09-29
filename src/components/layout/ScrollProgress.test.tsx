import { Profiler } from 'react';
import type Lenis from 'lenis';
import type { ScrollCallback } from 'lenis';
import { LenisContext } from 'lenis/react';
import { act, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ScrollProgress } from './ScrollProgress';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ScrollProgress', () => {
  it('refreshes when the document height changes without scrolling and disconnects', () => {
    const observers: Array<{
      notify: () => void;
      observe: ReturnType<typeof vi.fn>;
      disconnect: ReturnType<typeof vi.fn>;
    }> = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn();
        disconnect = vi.fn();
        notify: () => void;
        constructor(callback: () => void) {
          this.notify = callback;
          observers.push(this);
        }
      },
    );
    let height = 2000;
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockImplementation(() => height);
    vi.stubGlobal('innerHeight', 1000);
    vi.stubGlobal('scrollY', 500);
    const lenis = { progress: 0.5 } as Lenis;
    const onRender = vi.fn();
    const { container, unmount } = renderWithTheme(
      <LenisContext.Provider value={{ lenis, addCallback: () => {}, removeCallback: () => {} }}>
        <Profiler id="progress" onRender={onRender}>
          <ScrollProgress />
        </Profiler>
      </LenisContext.Provider>,
    );
    const bar = container.querySelector('[data-scroll-progress]');
    expect(bar).toHaveStyle({ transform: 'scaleX(0.5)' });
    const commits = onRender.mock.calls.length;
    height = 3000;
    act(() => observers.forEach((observer) => observer.notify()));
    expect(bar).toHaveStyle({ transform: 'scaleX(0.25)' });
    expect(onRender).toHaveBeenCalledTimes(commits);
    expect(
      observers.some((observer) =>
        observer.observe.mock.calls.some(([target]) => target === document.body),
      ),
    ).toBe(true);
    unmount();
    expect(observers.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true);
  });

  it('initializes from Lenis, updates without React commits, and unsubscribes', () => {
    const lenis = { progress: 0.25 } as Lenis;
    const callbacks = new Set<ScrollCallback>();
    const removeCallback = vi.fn((callback: ScrollCallback) => callbacks.delete(callback));
    const onRender = vi.fn();
    const { container, unmount } = renderWithTheme(
      <LenisContext.Provider
        value={{
          lenis,
          addCallback: (callback) => {
            callbacks.add(callback);
          },
          removeCallback,
        }}
      >
        <Profiler id="progress" onRender={onRender}>
          <ScrollProgress />
        </Profiler>
      </LenisContext.Provider>,
    );
    const bar = container.querySelector('[data-scroll-progress]');
    expect(bar).toHaveAttribute('aria-hidden', 'true');
    expect(bar).not.toHaveAttribute('tabindex');
    expect(bar).toHaveStyle({
      transform: 'scaleX(0.25)',
      position: 'absolute',
      pointerEvents: 'none',
    });
    const commits = onRender.mock.calls.length;
    for (const [progress, expected] of [
      [0, 0],
      [0.5, 0.5],
      [1, 1],
      [1.2, 1],
      [-0.2, 0],
    ]) {
      act(() => {
        Object.defineProperty(lenis, 'progress', { value: progress, configurable: true });
        callbacks.forEach((callback) => callback(lenis));
      });
      expect(bar).toHaveStyle({ transform: `scaleX(${expected})` });
    }
    expect(onRender).toHaveBeenCalledTimes(commits);
    unmount();
    expect(removeCallback).toHaveBeenCalledOnce();
    expect(callbacks.size).toBe(0);
  });
});

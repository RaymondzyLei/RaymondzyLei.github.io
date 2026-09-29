import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActiveSection } from './useActiveSection';

// IntersectionObserver mock: we control which entries are "intersecting".
class IOObserver {
  static instances: IOObserver[] = [];
  cb: IntersectionObserverCallback;
  targets = new Set<Element>();
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
    IOObserver.instances.push(this);
  }
  observe(target: Element) {
    this.targets.add(target);
  }
  unobserve(target: Element) {
    this.targets.delete(target);
  }
  disconnect() {
    this.targets.clear();
  }
  // Test helper: fire a callback with given visible ids + ratios.
  fire(entries: Array<{ id: string; isIntersecting: boolean; ratio: number }>) {
    const mapped = entries.map((e) => ({
      target: { id: e.id } as Element,
      isIntersecting: e.isIntersecting,
      intersectionRatio: e.ratio,
    }));
    this.cb(mapped as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
  }
}

beforeEach(() => {
  IOObserver.instances = [];
  // Reset body to a clean slate for each test.
  document.body.replaceChildren();
});

describe('useActiveSection', () => {
  it('returns the first section id before any observation fires', () => {
    vi.stubGlobal('IntersectionObserver', IOObserver);
    const { result } = renderHook(() => useActiveSection(['hero', 'skills']));
    expect(result.current).toBe('hero');
    vi.unstubAllGlobals();
  });

  it('updates to the section occupying the most visible viewport space', () => {
    vi.stubGlobal('IntersectionObserver', IOObserver);
    const ids = ['hero', 'skills', 'contact'];
    const bounds = [
      { top: -500, bottom: 100 },
      { top: 100, bottom: 700 },
      { top: 700, bottom: 1300 },
    ];
    for (const [index, id] of ids.entries()) {
      const el = document.createElement('div');
      el.id = id;
      el.getBoundingClientRect = () => bounds[index] as DOMRect;
      document.body.appendChild(el);
    }
    const { result } = renderHook(() => useActiveSection(ids));

    // skills is most in view
    act(() => {
      IOObserver.instances[0].fire([
        { id: 'hero', isIntersecting: true, ratio: 0.1 },
        { id: 'skills', isIntersecting: true, ratio: 0.6 },
        { id: 'contact', isIntersecting: false, ratio: 0 },
      ]);
    });
    expect(result.current).toBe('skills');
    vi.unstubAllGlobals();
  });

  it('prefers the visible body of a tall section over the tail of a short section', () => {
    vi.stubGlobal('IntersectionObserver', IOObserver);
    const ids = ['skills', 'qualifications'];
    for (const [index, id] of ids.entries()) {
      const el = document.createElement('section');
      el.id = id;
      el.getBoundingClientRect = () =>
        ({ top: index === 0 ? -400 : 130, bottom: index === 0 ? 130 : 1630 }) as DOMRect;
      document.body.appendChild(el);
    }
    const { result } = renderHook(() => useActiveSection(ids, 64));
    act(() => {
      IOObserver.instances[0].fire([
        { id: 'skills', isIntersecting: true, ratio: 0.25 },
        { id: 'qualifications', isIntersecting: true, ratio: 0.18 },
      ]);
    });
    expect(result.current).toBe('qualifications');
    vi.unstubAllGlobals();
  });

  it('does not change active when no section is intersecting', () => {
    vi.stubGlobal('IntersectionObserver', IOObserver);
    for (const id of ['hero', 'skills']) {
      const el = document.createElement('div');
      el.id = id;
      document.body.appendChild(el);
    }
    const { result } = renderHook(() => useActiveSection(['hero', 'skills']));
    act(() => {
      IOObserver.instances[0].fire([{ id: 'hero', isIntersecting: true, ratio: 0.5 }]);
    });
    expect(result.current).toBe('hero');
    // Now both leave -- active stays at the last value.
    act(() => {
      IOObserver.instances[0].fire([{ id: 'hero', isIntersecting: false, ratio: 0 }]);
    });
    expect(result.current).toBe('hero');
    vi.unstubAllGlobals();
  });
});

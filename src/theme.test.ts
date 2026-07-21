import { describe, it, expect } from 'vitest';
import { createTheme } from '@mui/material/styles';
import { glass, easing, duration, default as theme } from './theme';

describe('glass', () => {
  const light = createTheme({ palette: { mode: 'light' } });
  const dark = createTheme({ palette: { mode: 'dark' } });

  it('returns backdrop blur and border for both modes', () => {
    for (const t of [light, dark]) {
      const g = glass(t);
      expect(g.backdropFilter).toContain('blur(20px)');
      expect(g.border).toBe('1px solid');
    }
  });

  it('has different boxShadow in light vs dark', () => {
    expect(glass(light).boxShadow).not.toBe(glass(dark).boxShadow);
  });

  it('background is semi-transparent', () => {
    expect(glass(light).backgroundColor).toMatch(/rgba?\(/);
    expect(glass(dark).backgroundColor).toMatch(/rgba?\(/);
  });
});

describe('easing & duration tokens', () => {
  it('exposes custom cubic-bezier easings (not built-in weak ones)', () => {
    expect(easing.easeOut).toMatch(/^cubic-bezier\(/);
    expect(easing.easeOut).not.toBe('ease-out');
    expect(easing.easeInOut).toMatch(/^cubic-bezier\(/);
  });

  it('keeps UI durations under 300ms (emil rule)', () => {
    expect(duration.press).toBeLessThan(300);
    expect(duration.hover).toBeLessThan(300);
    expect(duration.standard).toBeLessThanOrEqual(300);
  });
});

describe('typography optical sizing', () => {
  it('tightens letter-spacing as heading size grows (apple-design §15)', () => {
    const t = theme.typography;
    // h1 most negative, h6 neutral -- monotonic increase
    const spacings = [t.h1, t.h2, t.h3, t.h4, t.h5, t.h6].map((h) => h.letterSpacing);
    for (let i = 0; i < spacings.length - 1; i++) {
      const cur = parseFloat(spacings[i] as string);
      const next = parseFloat(spacings[i + 1] as string);
      expect(cur).toBeLessThanOrEqual(next);
    }
    expect(t.h1.letterSpacing).toBe('-0.03em');
    expect(t.h6.letterSpacing).toBe('0');
  });

  it('line-height tracks size inversely (tight on large headings)', () => {
    const h1Lh = parseFloat(String(theme.typography.h1.lineHeight));
    const h6Lh = parseFloat(String(theme.typography.h6.lineHeight));
    expect(h1Lh).toBeLessThan(h6Lh);
  });
});

describe('component focus-visible & active overrides', () => {
  it('MuiButton scales on :active for press feedback', () => {
    const root = theme.components?.MuiButton?.styleOverrides?.root as Record<string, unknown>;
    expect(root['&:active']).toEqual({ transform: 'scale(0.97)' });
  });

  it('exposes focus-visible ring on key interactive components', () => {
    const components = [
      'MuiButton',
      'MuiIconButton',
      'MuiMenuItem',
      'MuiChip',
      'MuiAccordionSummary',
    ];
    for (const name of components) {
      const root = (theme.components as Record<string, unknown>)[name] as {
        styleOverrides: { root: Record<string, unknown> };
      };
      const fv = root.styleOverrides.root['&:focus-visible'] as Record<string, string>;
      expect(fv.outline).toContain('2px solid');
      expect(fv.outline).toContain('var(--mui-palette-primary-main)');
    }
  });
});

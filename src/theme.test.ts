import { describe, it, expect } from 'vitest';
import { createTheme } from '@mui/material/styles';
import { glass } from './theme';

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

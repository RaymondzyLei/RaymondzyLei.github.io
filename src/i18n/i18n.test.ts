import { describe, it, expect } from 'vitest';
import { isSupportedLanguage } from './i18n';

describe('isSupportedLanguage', () => {
  it('accepts "en" and "zh"', () => {
    expect(isSupportedLanguage('en')).toBe(true);
    expect(isSupportedLanguage('zh')).toBe(true);
  });

  it('rejects null', () => {
    expect(isSupportedLanguage(null)).toBe(false);
  });

  it('rejects empty string and unsupported codes', () => {
    expect(isSupportedLanguage('')).toBe(false);
    expect(isSupportedLanguage('fr')).toBe(false);
    expect(isSupportedLanguage('ja')).toBe(false);
  });
});

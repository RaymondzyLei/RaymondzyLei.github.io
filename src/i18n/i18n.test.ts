import { describe, it, expect } from 'vitest';
import {
  isSupportedLanguage,
  matchBrowserLanguage,
  resolveInitialLanguage,
  default as i18n,
} from './i18n';

describe('resolveInitialLanguage', () => {
  it('prefers a valid URL language over the saved preference', () => {
    expect(resolveInitialLanguage('zh', 'en')).toBe('zh');
    expect(resolveInitialLanguage('en', 'zh')).toBe('en');
  });

  it('falls back to the saved preference when the URL has no lang', () => {
    expect(resolveInitialLanguage(null, 'zh')).toBe('zh');
  });

  it('falls back to the saved preference when the URL lang is invalid', () => {
    expect(resolveInitialLanguage('fr', 'zh')).toBe('zh');
  });

  it('is case-sensitive on the URL language', () => {
    expect(resolveInitialLanguage('ZH', 'en')).toBe('en');
  });

  it('prefers the saved preference over the browser language', () => {
    expect(resolveInitialLanguage(null, 'en', 'zh')).toBe('en');
  });

  it('prefers the browser language over English when nothing is saved', () => {
    expect(resolveInitialLanguage(null, null, 'zh')).toBe('zh');
  });

  it('falls back to English when the browser language is null', () => {
    expect(resolveInitialLanguage(null, null)).toBe('en');
    expect(resolveInitialLanguage(null, null, null)).toBe('en');
  });
});

describe('matchBrowserLanguage', () => {
  it('matches exact supported tags', () => {
    expect(matchBrowserLanguage(['zh'])).toBe('zh');
    expect(matchBrowserLanguage(['en'])).toBe('en');
  });

  it('matches the primary language subtag of regional variants', () => {
    expect(matchBrowserLanguage(['zh-CN'])).toBe('zh');
    expect(matchBrowserLanguage(['zh-TW'])).toBe('zh');
    expect(matchBrowserLanguage(['en-GB'])).toBe('en');
  });

  it('matches the first supported language in navigator order', () => {
    expect(matchBrowserLanguage(['ja', 'zh-CN', 'en'])).toBe('zh');
    expect(matchBrowserLanguage(['en-GB', 'zh-CN'])).toBe('en');
  });

  it('handles script subtags', () => {
    expect(matchBrowserLanguage(['zh-Hans-SG'])).toBe('zh');
  });

  it('returns null for unsupported or empty lists', () => {
    expect(matchBrowserLanguage(['ja'])).toBeNull();
    expect(matchBrowserLanguage([])).toBeNull();
  });

  it('skips malformed entries instead of failing', () => {
    expect(matchBrowserLanguage(['', 'zh-CN'])).toBe('zh');
  });
});

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

describe('html lang sync', () => {
  it('updates document.documentElement.lang when language changes', async () => {
    await i18n.changeLanguage('zh');
    expect(document.documentElement.lang).toBe('zh');

    await i18n.changeLanguage('en');
    expect(document.documentElement.lang).toBe('en');
  });
});

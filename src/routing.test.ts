import { describe, it, expect } from 'vitest';
import { resolveRoute, resumeLangUrl, langQueryUrl } from './routing';

describe('resolveRoute', () => {
  it('returns home for "/"', () => {
    expect(resolveRoute('/')).toEqual({ type: 'home' });
  });

  it('returns resume for "/resume"', () => {
    expect(resolveRoute('/resume')).toEqual({ type: 'resume', lang: 'en' });
  });

  it('returns zh resume for "?lang=zh"', () => {
    expect(resolveRoute('/resume', '?lang=zh')).toEqual({ type: 'resume', lang: 'zh' });
  });

  it('keeps other query params intact when reading lang', () => {
    expect(resolveRoute('/resume', '?lang=zh&x=1')).toEqual({ type: 'resume', lang: 'zh' });
  });

  it.each([
    ['missing query', ''],
    ['unsupported lang', '?lang=fr'],
    ['wrong case', '?lang=ZH'],
  ])('falls back to English for %s', (_name, search) => {
    expect(resolveRoute('/resume', search)).toEqual({ type: 'resume', lang: 'en' });
  });

  it('returns notFound for the removed "/resume/zh" path', () => {
    expect(resolveRoute('/resume/zh')).toEqual({ type: 'notFound' });
  });

  it('returns redirect for a path listed in REDIRECTS', () => {
    const result = resolveRoute('/google');
    expect(result.type).toBe('redirect');
    if (result.type === 'redirect') {
      expect(result.rule.path).toBe('/google');
      expect(result.rule.targetUrl).toBe('https://www.google.com');
    }
  });

  it('returns notFound for an unknown path', () => {
    expect(resolveRoute('/does-not-exist')).toEqual({ type: 'notFound' });
  });
});

describe('resumeLangUrl', () => {
  it('mirrors an explicit English choice into the query', () => {
    expect(resumeLangUrl('en')).toBe('/resume?lang=en');
  });

  it('encodes Chinese as the ?lang= query', () => {
    expect(resumeLangUrl('zh')).toBe('/resume?lang=zh');
  });
});

describe('langQueryUrl', () => {
  it('mirrors both languages into ?lang= on any pathname', () => {
    expect(langQueryUrl('/', 'en')).toBe('/?lang=en');
    expect(langQueryUrl('/', 'zh')).toBe('/?lang=zh');
    expect(langQueryUrl('/resume', 'en')).toBe('/resume?lang=en');
    expect(langQueryUrl('/resume', 'zh')).toBe('/resume?lang=zh');
  });

  it('preserves the hash fragment', () => {
    expect(langQueryUrl('/', 'zh', 'skills')).toBe('/?lang=zh#skills');
    expect(langQueryUrl('/', 'en', 'skills')).toBe('/?lang=en#skills');
    expect(langQueryUrl('/resume', 'zh', 'skills')).toBe('/resume?lang=zh#skills');
  });
});

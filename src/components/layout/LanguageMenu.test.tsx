import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import i18n from '../../i18n/i18n';
import { LanguageMenu } from './LanguageMenu';
import { renderWithTheme } from '../../test/render';

// Locks the real contract: picking a language mirrors it into the URL query
// (history.replaceState) while keeping path + hash. Both languages write
// ?lang=<code> — same convention as the resume page. Bare URLs (no query)
// resolve through the init priority chain, so nothing is written on a
// first visit.

beforeEach(async () => {
  // i18n is a module-level singleton; tests above may have switched it.
  await i18n.changeLanguage('en');
  localStorage.clear();
  window.history.replaceState(null, '', '/');
});

afterEach(cleanup);

describe('LanguageMenu', () => {
  it('writes ?lang=zh into the URL on switching to Chinese, keeping the hash', () => {
    window.history.replaceState(null, '', '/#skills');
    renderWithTheme(<LanguageMenu />);

    fireEvent.click(screen.getByRole('button', { name: /change language/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: '中文' }));

    expect(window.location.pathname).toBe('/');
    expect(window.location.search).toBe('?lang=zh');
    expect(window.location.hash).toBe('#skills');
  });

  it('writes ?lang=en into the URL on switching to English, keeping the hash', () => {
    window.history.replaceState(null, '', '/?lang=zh#skills');
    renderWithTheme(<LanguageMenu />);

    fireEvent.click(screen.getByRole('button', { name: /change language/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'English' }));

    expect(window.location.pathname).toBe('/');
    expect(window.location.search).toBe('?lang=en');
    expect(window.location.hash).toBe('#skills');
  });
});

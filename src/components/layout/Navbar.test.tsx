import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { renderWithTheme } from '../../test/render';
import { Navbar } from './Navbar';

const state = vi.hoisted(() => ({ active: 'skills', mobile: false, scroll: vi.fn() }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('./LanguageMenu', () => ({ LanguageMenu: () => null }));
vi.mock('../../hooks/useActiveSection', () => ({ useActiveSection: () => state.active }));
vi.mock('../../hooks/useScrollToSection', () => ({ useScrollToSection: () => state.scroll }));
vi.mock('@mui/material/useMediaQuery', () => ({
  default: (query: string) => query.includes('max-width') && state.mobile,
}));
vi.mock('lenis/react', () => ({ useLenis: () => undefined }));

afterEach(cleanup);
beforeEach(() => {
  state.mobile = false;
  state.scroll.mockClear();
  history.replaceState(null, '', '/?lang=zh');
});

describe('Navbar', () => {
  it('marks only the current section and shows decorative reading progress on home', () => {
    const { container } = renderWithTheme(<Navbar />);
    expect(screen.getByRole('button', { name: 'nav.skills' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(1);
    expect(container.querySelector('[data-scroll-progress]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
  it('keeps auxiliary routes free of progress and current-section claims', () => {
    const { container } = renderWithTheme(<Navbar isNotFound />);
    expect(container.querySelector('[aria-current]')).toBeNull();
    expect(container.querySelector('[data-scroll-progress]')).toBeNull();
    expect(screen.getByRole('link', { name: 'nav.skills' })).toHaveAttribute('href', '/');
  });
  it('uses the shared scroll helper and preserves the language query', () => {
    const { container } = renderWithTheme(
      <>
        <Navbar />
        <section id="skills" />
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'nav.skills' }));
    expect(state.scroll).toHaveBeenCalledWith(container.querySelector('#skills'));
    expect(location.search + location.hash).toBe('?lang=zh#skills');
  });
  it('exposes the active section in the mobile drawer', () => {
    state.mobile = true;
    renderWithTheme(<Navbar />);
    fireEvent.click(screen.getByRole('button', { name: 'layout.openMenu' }));
    expect(screen.getByRole('button', { name: 'nav.skills' })).toHaveAttribute(
      'aria-current',
      'location',
    );
  });
});

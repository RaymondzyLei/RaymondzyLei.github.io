import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import i18n from '../i18n/i18n';
import { renderWithTheme } from '../test/render';
import { Hero } from './Hero';

const { scroll } = vi.hoisted(() => ({ scroll: vi.fn() }));
vi.mock('../hooks/useScrollToSection', () => ({ useScrollToSection: () => scroll }));
vi.mock('../hooks/useReveal', () => ({ useReveal: () => ({ ref: null, isVisible: true }) }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('shows a non-interactive decorative section number without adding a heading', () => {
  renderWithTheme(<Hero />);
  const number = screen.getByText('01');
  expect(number).toHaveAttribute('aria-hidden', 'true');
  expect(number).toHaveStyle({ pointerEvents: 'none' });
  expect(screen.getAllByRole('heading')).toHaveLength(1);
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
});

it('links to the resume in the current language', async () => {
  renderWithTheme(<Hero />);
  expect(screen.getByRole('link', { name: 'See my resume' })).toHaveAttribute(
    'href',
    '/resume?lang=en',
  );
  await act(() => i18n.changeLanguage('zh'));
  expect(screen.getByRole('link', { name: '查看我的简历' })).toHaveAttribute(
    'href',
    '/resume?lang=zh',
  );
  await act(() => i18n.changeLanguage('en'));
});

it('routes the contact action through the shared scroll helper', () => {
  renderWithTheme(
    <>
      <Hero />
      <section id="contact" />
    </>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Get in touch' }));
  expect(scroll).toHaveBeenLastCalledWith(document.getElementById('contact'));
});

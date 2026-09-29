import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import '../i18n/i18n';
import { renderWithTheme } from '../test/render';
import { Academic } from './Academic';
import { achievementsData } from '../data/achievements';

vi.mock('../hooks/useReveal', () => ({ useReveal: () => ({ ref: null, isVisible: true }) }));
afterEach(cleanup);

it('links every category control to a named region with valid ID references', () => {
  renderWithTheme(<Academic />);
  for (const name of ['Competition', 'Academic Award', 'Research', 'Scholarship']) {
    const control = screen.getByRole('button', { name });
    if (control.getAttribute('aria-expanded') !== 'true') fireEvent.click(control);
    const region = screen.getByRole('region', { name });
    expect(control.id).not.toMatch(/\s/);
    expect(control).toHaveAttribute('aria-controls', region.id);
    expect(region).toHaveAttribute('aria-labelledby', control.id);
  }
});

it('keeps categories expandable and every certificate destination available', () => {
  renderWithTheme(<Academic />);
  const category = screen.getByRole('button', { name: 'Competition' });
  expect(category).toHaveAttribute('aria-expanded', 'true');
  for (const achievement of achievementsData) {
    if (achievement.file) {
      expect(
        screen
          .getAllByRole('link')
          .some((link) => link.getAttribute('href') === achievement.file?.path),
      ).toBe(true);
    }
  }
  fireEvent.click(category);
  expect(category).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(category);
  expect(category).toHaveAttribute('aria-expanded', 'true');
});

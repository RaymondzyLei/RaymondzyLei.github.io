import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { renderWithTheme } from '../test/render';
import { Section } from './Section';
import { SECTIONS } from '../sections';

vi.mock('../hooks/useReveal', () => ({ useReveal: () => ({ ref: () => {}, isVisible: true }) }));
afterEach(cleanup);

describe('Section', () => {
  it.each(SECTIONS.map((section, index) => [section.id, String(index + 1).padStart(2, '0')]))(
    'derives the decorative number for %s from registry order',
    (id, number) => {
      const { container } = renderWithTheme(
        <Section id={id} title="Title">
          Content
        </Section>,
      );
      expect(screen.getByText(number)).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByRole('heading', { level: 2, name: 'Title' })).toBeInTheDocument();
      expect(container.querySelector('section')).toHaveStyle({
        paddingTop: '64px',
        paddingBottom: '64px',
      });
    },
  );
});

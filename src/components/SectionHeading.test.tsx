import { describe, it, expect, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { SectionHeading } from './SectionHeading';
import { renderWithTheme } from '../test/render';

afterEach(cleanup);

describe('SectionHeading', () => {
  it('renders an h2 with the title', () => {
    renderWithTheme(<SectionHeading title="Skills" />);
    const h = screen.getByRole('heading', { level: 2 });
    expect(h).toHaveTextContent('Skills');
  });
});

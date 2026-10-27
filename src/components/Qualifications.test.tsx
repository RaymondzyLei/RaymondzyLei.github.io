import { describe, it, expect, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';

// Side-effect: initialize the real i18n instance (localStorage empty -> 'en').
import '../i18n/i18n';
import { Qualifications } from './Qualifications';
import { renderWithTheme } from '../test/render';

afterEach(cleanup);

describe('Qualifications', () => {
  it('renders education titles and institutions', () => {
    renderWithTheme(<Qualifications />);
    expect(screen.getByText('B.Eng. in Computer Science and Technology')).toBeInTheDocument();
    expect(screen.getByText(/University of Science and Technology of China/)).toBeInTheDocument();
    expect(
      screen.getByText('Structure and Interpretation of Computer Programs (SICP)'),
    ).toBeInTheDocument();
  });

  it('renders a download button only for entries with a file', () => {
    renderWithTheme(<Qualifications />);
    // Only timeline id '3' (SICP) has file.path set.
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/files/nus-sicp-certificate.pdf');
  });
});

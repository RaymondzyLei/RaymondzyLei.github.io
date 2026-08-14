import { describe, it, expect, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { CertDownloadButton } from './CertDownloadButton';
import { renderWithTheme } from '../test/render';

afterEach(cleanup);

describe('CertDownloadButton', () => {
  it('renders an anchor with href, download attribute, and label', () => {
    renderWithTheme(<CertDownloadButton file={{ path: '/certs/a.pdf' }} label="Download" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/certs/a.pdf');
    expect(link).toHaveAttribute('download', 'a.pdf');
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('falls back to a present download attribute when path has empty basename (ends with /)', () => {
    renderWithTheme(<CertDownloadButton file={{ path: 'certs/' }} label="Get" />);
    // pop()='' (falsy) -> download={true} -> React renders the attribute present
    expect(screen.getByRole('link')).toHaveAttribute('download');
  });
});

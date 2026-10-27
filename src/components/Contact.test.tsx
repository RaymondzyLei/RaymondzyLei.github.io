import { describe, it, expect, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';

// Side-effect: initialize the real i18n instance (localStorage empty -> 'en').
import '../i18n/i18n';
import { Contact } from './Contact';
import { renderWithTheme } from '../test/render';

afterEach(cleanup);

describe('Contact', () => {
  it('offers GitHub, X, and both email contact destinations', () => {
    renderWithTheme(<Contact />);
    expect(screen.getByRole('link', { name: 'https://github.com/RaymondzyLei' })).toHaveAttribute(
      'href',
      'https://github.com/RaymondzyLei',
    );
    expect(screen.getByRole('link', { name: 'https://x.com/RaymondzyLei' })).toHaveAttribute(
      'href',
      'https://x.com/RaymondzyLei',
    );
    expect(screen.getByRole('link', { name: 'raymond.lei@mail.ustc.edu.cn' })).toHaveAttribute(
      'href',
      'mailto:raymond.lei@mail.ustc.edu.cn',
    );
    expect(screen.getByRole('link', { name: 'raymond.zy.lei@outlook.com' })).toHaveAttribute(
      'href',
      'mailto:raymond.zy.lei@outlook.com',
    );
  });

  it('renders useful-link rows as anchors with their hrefs', () => {
    renderWithTheme(<Contact />);
    const reposRow = screen.getByText('GitHub Repositories').closest('a');
    expect(reposRow).toHaveAttribute('href', 'https://github.com/RaymondzyLei?tab=repositories');
    const resumeRow = screen.getByText('Resume Download').closest('a');
    expect(resumeRow).toHaveAttribute('href', '/resume');
    expect(screen.getByText('Portfolio Website')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });
});

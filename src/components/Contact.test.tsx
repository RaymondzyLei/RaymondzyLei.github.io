import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';

// Same react-intersection-observer mock rationale as Qualifications.test.tsx
// (useReveal runs inside Section + both cards).
const { useInViewMock } = vi.hoisted(() => ({ useInViewMock: vi.fn() }));
vi.mock('react-intersection-observer', () => ({
  useInView: (opts: unknown) => useInViewMock(opts),
}));

// Side-effect: initialize the real i18n instance (localStorage empty -> 'en').
import '../i18n/i18n';
import { Contact } from './Contact';
import { renderWithTheme } from '../test/render';

beforeEach(() => {
  useInViewMock.mockReturnValue({ ref: { current: null }, inView: true });
});

afterEach(cleanup);

describe('Contact', () => {
  it('keeps email contact available while GitHub and X are hidden during review', () => {
    renderWithTheme(<Contact />);
    expect(
      screen.queryByRole('link', { name: 'https://github.com/RaymondzyLei' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'https://x.com/RaymondzyLei' }),
    ).not.toBeInTheDocument();
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

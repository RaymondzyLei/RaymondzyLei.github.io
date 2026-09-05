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
  it('renders both card intros', () => {
    renderWithTheme(<Contact />);
    expect(screen.getByText('Connect With Me')).toBeInTheDocument();
    expect(screen.getByText('Useful Links')).toBeInTheDocument();
    // Double-quoted string: the copy contains an apostrophe (I'm).
    expect(
      screen.getByText(
        "Feel free to reach out through any of these channels. I'm always happy to connect and discuss opportunities.",
      ),
    ).toBeInTheDocument();
  });

  it('renders a LiquidGlassButton per social link with its href', () => {
    renderWithTheme(<Contact />);
    // aria-label of LiquidGlassButton = label i18n (the URL text in en.json).
    expect(screen.getByRole('link', { name: 'https://github.com/RaymondzyLei' })).toHaveAttribute(
      'href',
      'https://github.com/RaymondzyLei',
    );
    expect(screen.getByRole('link', { name: 'https://x.com/RaymondzyLei' })).toHaveAttribute(
      'href',
      'https://x.com/RaymondzyLei',
    );
    expect(screen.getByText('Email (School)')).toBeInTheDocument();
    expect(screen.getByText('Email (Personal)')).toBeInTheDocument();
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

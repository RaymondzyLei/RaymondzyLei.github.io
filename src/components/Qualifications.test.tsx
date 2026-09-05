import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';

// useReveal -> react-intersection-observer's useInView constructs a real
// IntersectionObserver even under reduced-motion; jsdom lacks the API.
// Mock it (same pattern as useReveal.test.tsx) so we control inView directly.
const { useInViewMock } = vi.hoisted(() => ({ useInViewMock: vi.fn() }));
vi.mock('react-intersection-observer', () => ({
  useInView: (opts: unknown) => useInViewMock(opts),
}));

// Side-effect: initialize the real i18n instance (localStorage empty -> 'en').
import '../i18n/i18n';
import { Qualifications } from './Qualifications';
import { renderWithTheme } from '../test/render';

beforeEach(() => {
  useInViewMock.mockReturnValue({ ref: { current: null }, inView: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

describe('Qualifications', () => {
  it('desktop layout renders timeline cards with titles and institution', () => {
    // setup.ts's matchMedia stub returns matches:false -> useMediaQuery
    // breakpoints.down('sm') is false -> desktop Timeline layout.
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

  it('mobile layout renders the same content as stacked cards', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      media: '(max-width:600px)',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));
    renderWithTheme(<Qualifications />);
    expect(screen.getByText('B.Eng. in Computer Science and Technology')).toBeInTheDocument();
    expect(screen.getByText('Senior High School Education')).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/files/nus-sicp-certificate.pdf');
  });
});

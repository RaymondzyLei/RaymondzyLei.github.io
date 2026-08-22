import { describe, it, expect, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { LiquidGlassButton } from './LiquidGlassButton';
import { renderWithTheme } from '../test/render';

afterEach(cleanup);

describe('LiquidGlassButton', () => {
  it('opens in a new tab with noopener when external (default)', () => {
    renderWithTheme(<LiquidGlassButton icon={<span>i</span>} label="X" href="https://x.com" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://x.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('aria-label', 'X');
  });

  it('omits target/rel when external=false', () => {
    renderWithTheme(
      <LiquidGlassButton icon={<span>i</span>} label="Y" href="/resume" external={false} />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/resume');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });
});

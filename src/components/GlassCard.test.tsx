import { describe, it, expect, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { GlassCard } from './GlassCard';
import { renderWithTheme } from '../test/render';

afterEach(cleanup);

describe('GlassCard', () => {
  it('renders children for accent=none', () => {
    renderWithTheme(<GlassCard>hello</GlassCard>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders with accent=left without crashing', () => {
    renderWithTheme(<GlassCard accent="left">left</GlassCard>);
    expect(screen.getByText('left')).toBeInTheDocument();
  });

  it('renders with accent=top without crashing', () => {
    renderWithTheme(<GlassCard accent="top">top</GlassCard>);
    expect(screen.getByText('top')).toBeInTheDocument();
  });
});

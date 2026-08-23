import { describe, it, expect, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { SoftChip } from './SoftChip';
import { renderWithTheme } from '../test/render';

afterEach(cleanup);

describe('SoftChip', () => {
  it('renders its label', () => {
    renderWithTheme(<SoftChip label="C++" />);
    expect(screen.getByText('C++')).toBeInTheDocument();
  });

  it('forwards size="small" without crashing', () => {
    renderWithTheme(<SoftChip size="small" label="竞赛" />);
    expect(screen.getByText('竞赛')).toBeInTheDocument();
  });
});

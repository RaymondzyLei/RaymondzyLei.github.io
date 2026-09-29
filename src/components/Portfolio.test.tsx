import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import '../i18n/i18n';
import { renderWithTheme } from '../test/render';
import { projectsData } from '../data/projects';
import { Portfolio } from './Portfolio';

vi.mock('../hooks/useReveal', () => ({ useReveal: () => ({ ref: null, isVisible: true }) }));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('renders every project as a complete featured composition', () => {
  vi.spyOn(projectsData, 'map').mockImplementation((callback) =>
    [projectsData[0], { ...projectsData[0], id: 'second-project' }].map(callback),
  );
  renderWithTheme(<Portfolio />);
  expect(screen.getAllByRole('img')).toHaveLength(2);
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
  expect(screen.getAllByRole('link', { name: 'View Code' })).toHaveLength(2);
  expect(screen.getAllByRole('link', { name: 'View Demo' })).toHaveLength(2);
});

it('shows an uncropped featured screenshot and preserves both destinations', () => {
  renderWithTheme(<Portfolio />);
  const image = screen.getByRole('img');
  expect(image).toHaveStyle({ height: 'auto', objectFit: 'contain' });
  expect(image).toHaveAttribute('src', projectsData[0].imageUrl);
  expect(screen.getByRole('link', { name: 'View Code' })).toHaveAttribute(
    'href',
    projectsData[0].githubUrl,
  );
  expect(screen.getByRole('link', { name: 'View Demo' })).toHaveAttribute(
    'href',
    projectsData[0].demoUrl,
  );
});

import { describe, it, expect, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { EducationItem, AwardItem, SkillGroup } from './ResumeBits';
import { renderWithTheme } from '../../test/render';

afterEach(cleanup);

describe('EducationItem', () => {
  it('renders institution, location, degree, period and bullet list', () => {
    renderWithTheme(
      <EducationItem
        institution="USTC"
        location="Hefei"
        degree="B.Eng. CS"
        period="2025 - Present"
        bullets={['First line', 'Second line']}
      />,
    );
    expect(screen.getByText('USTC')).toBeInTheDocument();
    expect(screen.getByText('Hefei')).toBeInTheDocument();
    expect(screen.getByText('B.Eng. CS')).toBeInTheDocument();
    expect(screen.getByText('2025 - Present')).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('First line');
  });
});

describe('AwardItem', () => {
  // textContent = concatenation of rendered text in JSX order:
  // [title, date] row, level, then details (when non-empty).
  it('renders title, level, date and details', () => {
    const { container } = renderWithTheme(
      <AwardItem title="Second Prize" level="National" date="Summer 2026" details="OS track" />,
    );
    expect(container.textContent).toBe('Second PrizeSummer 2026NationalOS track');
  });

  it('omits the details line when details is empty', () => {
    const { container } = renderWithTheme(
      <AwardItem title="Second Prize" level="National" date="Summer 2026" details="" />,
    );
    expect(container.textContent).toBe('Second PrizeSummer 2026National');
  });
});

describe('SkillGroup', () => {
  it('renders the label and every skill item', () => {
    renderWithTheme(
      <SkillGroup
        label="Programming Languages"
        items={[{ text: 'C++', strong: true }, { text: 'Rust' }]}
      />,
    );
    expect(screen.getByText('Programming Languages')).toBeInTheDocument();
    expect(screen.getByText('C++')).toBeInTheDocument();
    expect(screen.getByText('Rust')).toBeInTheDocument();
  });
});

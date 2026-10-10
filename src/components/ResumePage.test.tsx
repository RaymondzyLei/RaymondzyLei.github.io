import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import i18n from '../i18n/i18n';
import { renderWithTheme } from '../test/render';
import { ResumePage } from './ResumePage';

afterEach(() => {
  cleanup();
  history.replaceState(null, '', '/');
});

describe('ResumePage PDF download', () => {
  it('keeps navigation controls in a wrapping toolbar outside the resume body', () => {
    renderWithTheme(<ResumePage lang="en" />);
    const backHome = screen.getByRole('link', { name: "Back to Raymond's HomePage" });
    const toolbar = backHome.closest('.no-print');
    expect(toolbar).toHaveStyle({ display: 'flex', flexWrap: 'wrap' });
    expect(toolbar).not.toHaveStyle({ position: 'fixed' });
    expect(toolbar).toContainElement(screen.getByRole('button', { name: '中文' }));
  });

  it.each(['en', 'zh'] as const)('links to the English PDF in the %s page', (lang) => {
    renderWithTheme(<ResumePage lang={lang} />);
    const download = screen.getByRole('link', { name: i18n.getFixedT(lang)('resume.downloadPdf') });
    expect(download).toHaveAttribute('href', '/files/zhangyue-lei-resume.pdf');
    expect(download).toHaveAttribute('download', 'Zhangyue-Lei-Resume.pdf');
    expect(download.closest('.no-print')).not.toBeNull();
  });

  it('updates the download label without changing the PDF when switching language', () => {
    renderWithTheme(<ResumePage lang="en" />);
    fireEvent.click(screen.getByRole('button', { name: '中文' }));
    const download = screen.getByRole('link', { name: '下载简历（英文 PDF）' });
    expect(download).toHaveAttribute('href', '/files/zhangyue-lei-resume.pdf');
    expect(location.search).toBe('?lang=zh');
    expect(document.documentElement.lang).toBe('zh');
  });
});

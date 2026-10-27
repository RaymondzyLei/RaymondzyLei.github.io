import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, screen, within } from '@testing-library/react';
import i18n from '../i18n/i18n';
import { projectsData, researchProjects } from '../data/projects';
import { renderWithTheme } from '../test/render';
import { Portfolio } from './Portfolio';
import { ResumePage } from './ResumePage';

afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

describe('shared research projects', () => {
  it('retains the original project and adds exactly three research entries without fabricated assets', () => {
    expect(projectsData.find((project) => project.id === '1')).toEqual({
      id: '1',
      imageUrl: '/projects/class-arrange.webp',
      technologies: ['React', 'TypeScript'],
      githubUrl: 'https://github.com/RaymondzyLei/class-arrange',
      demoUrl: 'https://class-arrange.raymondzylei.me',
    });
    expect(researchProjects.map((project) => project.id)).toEqual([
      'nexos',
      'vit-retinamnist',
      'cs229',
    ]);
    for (const project of researchProjects) {
      expect(project.githubUrl).toBeUndefined();
      expect(project.demoUrl).toBeUndefined();
      expect(project.imageUrl).toBeUndefined();
    }
  });

  describe.each(['en', 'zh'] as const)('%s', (lang) => {
    it.each(['portfolio', 'resume'] as const)(
      'renders all contributions in %s',
      async (context) => {
        // Resume must use its URL language, even when the global picker differs.
        await i18n.changeLanguage(context === 'resume' ? (lang === 'en' ? 'zh' : 'en') : lang);
        const t = i18n.getFixedT(lang);
        renderWithTheme(context === 'resume' ? <ResumePage lang={lang} /> : <Portfolio />);

        for (const project of researchProjects) {
          const p = `data.projects.${project.id}`;
          const title = screen.getByRole('heading', { name: t(`${p}.title`) });
          const article = title.closest('article');
          expect(article).not.toBeNull();
          const content = within(article!);
          expect(content.getByText(t(`${p}.period`))).toBeInTheDocument();
          expect(content.getByText(t(`${p}.description`))).toBeInTheDocument();
          for (const id of project.contributionIds ?? []) {
            const detail = content.getByText(t(`${p}.contributions.${id}`));
            expect(detail).toBeInTheDocument();
            if (context === 'resume') {
              expect(detail).toHaveStyle({ lineHeight: '1.6', marginTop: '4px' });
              expect(detail).not.toHaveStyle({ overflow: 'hidden' });
              expect(article).toHaveStyle({ marginBottom: '24px' });
            }
          }
          expect(content.getAllByRole('listitem')).toHaveLength(project.contributionIds!.length);
          expect(content.queryAllByRole('link')).toHaveLength(0);
          expect(content.queryAllByRole('img')).toHaveLength(0);
        }
        expect(screen.getByText(/3\.98×|3\.98 倍/)).toHaveTextContent('74.9%');
        expect(screen.getByText(/16\.2×|16\.2 倍/)).toHaveTextContent('SHA-256');
        expect(screen.getByText(/4-bit compression|4 比特压缩/)).toHaveTextContent('F1');

        if (context === 'portfolio') {
          expect(
            screen.getByRole('heading', { name: t('data.projects.1.title') }),
          ).toBeInTheDocument();
          expect(screen.getByRole('link', { name: t('portfolio.viewCode') })).toHaveAttribute(
            'href',
            'https://github.com/RaymondzyLei/class-arrange',
          );
          expect(screen.getByRole('link', { name: t('portfolio.viewDemo') })).toHaveAttribute(
            'href',
            'https://class-arrange.raymondzylei.me',
          );
          expect(screen.getAllByRole('img')).toHaveLength(1);
          expect(screen.getByRole('img')).toHaveAttribute('src', '/projects/class-arrange.webp');
          expect(screen.getAllByRole('link')).toHaveLength(2);
        } else {
          const section = screen.getByRole('region', { name: t('resume.section.research') });
          expect(section.previousElementSibling).toHaveTextContent(t('resume.section.education'));
          expect(section.nextElementSibling).toHaveTextContent(t('resume.section.awards'));
          expect(screen.getByRole('link', { name: t('resume.downloadPdf') })).toHaveAttribute(
            'href',
            '/files/zhangyue-lei-resume.pdf',
          );
        }
      },
    );
  });
});

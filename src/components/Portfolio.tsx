import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { projectsData, type Project } from '../data/projects';
import { HomeCard } from './HomeCard';
import { SoftChip } from './SoftChip';
import { Section } from './Section';

const ProjectCardView: React.FC<{ project: Project }> = ({ project }) => {
  const { t, i18n } = useTranslation();
  const prefix = `data.projects.${project.id}`;
  const periodKey = `${prefix}.period`;

  return (
    <Box component="article" sx={{ minWidth: 0 }}>
      <HomeCard sx={{ height: '100%' }}>
        {project.imageUrl && (
          <Box
            component="img"
            src={project.imageUrl}
            alt={t('portfolio.projectAlt', { title: t(`${prefix}.title`) })}
            loading="lazy"
            decoding="async"
            sx={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: 1,
              display: 'block',
              mb: 2,
            }}
          />
        )}
        <Typography component="h3" variant="h5" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
          {t(`${prefix}.title`)}
        </Typography>
        {i18n.exists(periodKey) && (
          <Typography sx={{ color: 'text.secondary', mt: 1 }}>{t(periodKey)}</Typography>
        )}
        <Typography sx={{ color: 'text.secondary', lineHeight: 1.6, mt: 1, mb: 2 }}>
          {t(`${prefix}.description`)}
        </Typography>
        {project.contributionIds && project.contributionIds.length > 0 && (
          <Box component="ul" sx={{ pl: 3, my: 2 }}>
            {project.contributionIds.map((id) => (
              <Typography component="li" key={id} sx={{ lineHeight: 1.7, mb: 1 }}>
                {t(`${prefix}.contributions.${id}`)}
              </Typography>
            ))}
          </Box>
        )}
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          {project.technologies.map((tech) => (
            <SoftChip key={tech} label={tech} size="small" />
          ))}
        </Stack>
        {(project.githubUrl || project.demoUrl) && (
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {project.githubUrl && (
              <Button
                size="small"
                startIcon={<GitHubIcon />}
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('portfolio.viewCode')}
              </Button>
            )}
            {project.demoUrl && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<OpenInNewIcon />}
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('portfolio.viewDemo')}
              </Button>
            )}
          </Stack>
        )}
      </HomeCard>
    </Box>
  );
};

export const Portfolio: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Section id="portfolio" title={t('portfolio.title')}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 4,
        }}
      >
        {projectsData.map((project) => (
          <ProjectCardView key={project.id} project={project} />
        ))}
      </Box>
    </Section>
  );
};

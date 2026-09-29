import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { styled, alpha } from '@mui/material/styles';
import { projectsData, type Project } from '../data/projects';
import { useTilt } from '../hooks/useTilt';
import { useReveal } from '../hooks/useReveal';
import { revealSx } from '../styles/reveal';
import { glass, glassHoverShadow } from '../theme';
import { SoftChip } from './SoftChip';
import { Section } from './Section';

const StyledProjectCard = styled(Card)(({ theme }) => ({
  ...glass(theme),
  height: '100%',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
  },
  alignItems: 'center',
  transition: theme.transitions.create(['boxShadow', 'borderColor'], {
    duration: theme.transitions.duration.standard,
  }),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    pointerEvents: 'none',
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    // H5: animate transform (translateX), not the `left` layout property --
    // GPU-friendly per emil/review-animations. translateX(-100%) -> translateX(100%)
    // sweeps across the card; overflow:hidden clips it.
    transform: 'translateX(-100%)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.standard,
    }),
  },
  '&:hover': {
    boxShadow: glassHoverShadow(theme),
    '&::before': {
      transform: 'translateX(100%)',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
    '&::before': { display: 'none' },
  },
}));

const ProjectCardView: React.FC<{ project: Project }> = ({ project }) => {
  const { t } = useTranslation();
  const tiltRef = useTilt();
  const prefix = `data.projects.${project.id}`;
  const img = project.imageUrl;
  return (
    <StyledProjectCard ref={tiltRef}>
      <Box sx={{ p: { xs: 2, md: 3 }, minWidth: 0 }}>
        {img ? (
          <Box
            component="img"
            src={img}
            alt={t('portfolio.projectAlt', { title: t(`${prefix}.title`) })}
            loading="lazy"
            decoding="async"
            sx={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: 1,
              boxShadow: 3,
              display: 'block',
            }}
          />
        ) : (
          <Paper
            sx={{
              height: 200,
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.contrastText',
              fontSize: '3rem',
            }}
          >
            P{project.id}
          </Paper>
        )}
      </Box>
      <Box sx={{ minWidth: 0, p: { xs: 1, md: 2 } }}>
        <CardContent>
          <Typography
            gutterBottom
            variant="h4"
            component="h3"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: { xs: '1.4rem', md: '1.75rem' },
            }}
          >
            {t(`${prefix}.title`)}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 2,
              lineHeight: 1.6,
            }}
          >
            {t(`${prefix}.description`)}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {project.technologies.map((tech) => (
              <SoftChip key={tech} label={tech} size="small" />
            ))}
          </Stack>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 3, gap: 1, flexWrap: 'wrap' }}>
          {project.githubUrl && (
            <Button
              size="small"
              startIcon={<GitHubIcon />}
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.main' }}
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
              sx={{ color: 'primary.main' }}
            >
              {t('portfolio.viewDemo')}
            </Button>
          )}
        </CardActions>
      </Box>
    </StyledProjectCard>
  );
};

const ProjectCardCell: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const { ref: revealRef, isVisible } = useReveal();
  return (
    <Box ref={revealRef} sx={revealSx(isVisible, index * 60)}>
      <ProjectCardView project={project} />
    </Box>
  );
};

export const Portfolio: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Section id="portfolio" title={t('portfolio.title')} maxWidth="lg">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 4,
        }}
      >
        {projectsData.map((project, index) => (
          <ProjectCardCell key={project.id} project={project} index={index} />
        ))}
      </Box>
    </Section>
  );
};

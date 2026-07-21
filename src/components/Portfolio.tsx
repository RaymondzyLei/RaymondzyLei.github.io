import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { styled } from '@mui/material/styles';
import { projectsData, type Project } from '../data/projects';
import { useTilt } from '../hooks/useTilt';
import { useReveal } from '../hooks/useReveal';
import { revealSx } from '../styles/reveal';
import { glass } from '../theme';
import { SectionHeading } from './SectionHeading';

const StyledProjectCard = styled(Card)(({ theme }) => ({
  ...glass(theme),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: theme.transitions.create(['boxShadow', 'borderColor'], {
    duration: theme.transitions.duration.standard,
  }),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    // H5: animate transform (translateX), not the `left` layout property --
    // GPU-friendly per emil/review-animations. translateX(-100%) -> translateX(100%)
    // sweeps across the card; overflow:hidden clips it.
    transform: 'translateX(-100%)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.standard,
    }),
  },
  '&:hover': {
    boxShadow: theme.shadows[16],
    '&::before': {
      transform: 'translateX(100%)',
    },
  },
}));

const ProjectCardView: React.FC<{ project: Project }> = ({ project }) => {
  const { t } = useTranslation();
  const tiltRef = useTilt();
  const prefix = `data.projects.${project.id}`;
  const img = project.imageUrl;
  return (
    <StyledProjectCard ref={tiltRef}>
      {img ? (
        <Box
          component="img"
          src={img}
          alt={t('portfolio.projectAlt', { title: t(`${prefix}.title`) })}
          loading="lazy"
          decoding="async"
          sx={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
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

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          gutterBottom
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {t(`${prefix}.title`)}
        </Typography>
        <Typography
          variant="body2"
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
            <Chip
              key={tech}
              label={tech}
              size="small"
              variant="outlined"
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
              }}
            />
          ))}
        </Stack>
      </CardContent>

      <CardActions>
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
    </StyledProjectCard>
  );
};

const ProjectCardCell: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const { ref: revealRef, isVisible } = useReveal();
  return (
    <Box ref={revealRef} sx={revealSx(isVisible, index * 100)}>
      <ProjectCardView project={project} />
    </Box>
  );
};

export const Portfolio: React.FC = () => {
  const { t } = useTranslation();
  const { ref: sectionRef, isVisible: sectionVisible } = useReveal();

  return (
    <Box
      id="portfolio"
      ref={sectionRef}
      component="section"
      sx={{
        py: 8,
        ...revealSx(sectionVisible),
      }}
    >
      <Container maxWidth="lg">
        <SectionHeading title={t('portfolio.title')} />

        <Grid
          container
          spacing={3}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          }}
        >
          {projectsData.map((project, index) => (
            <ProjectCardCell key={project.id} project={project} index={index} />
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

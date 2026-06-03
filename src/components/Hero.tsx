import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import { socialLinks } from '../data/social';
import { useTilt } from '../hooks/useTilt';
import { useLenis } from 'lenis/react';

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  transition: theme.transitions.create(['transform', 'boxShadow'], {
    duration: theme.transitions.duration.standard,
  }),
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.3) rotateZ(5deg)',
    boxShadow: theme.shadows[12],
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: theme.transitions.create(['boxShadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    transition: theme.transitions.create('width', {
      duration: theme.transitions.duration.shorter,
    }),
  },
  '&:hover::before': {
    width: '300px',
    height: '300px',
  },
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  transition: theme.transitions.create(['transform', 'color'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    transform: 'scale(1.5) rotate(var(--rotate-direction, 15deg))',
    backgroundColor: 'transparent',
  },
}));

export const Hero: React.FC = () => {
  const { t } = useTranslation();
  const ctaTiltRef = useTilt<HTMLButtonElement>();
  const lenis = useLenis();
  const handleContactClick = () => {
    const element = document.getElementById('contact');
    if (element) {
      lenis?.scrollTo(element);
    }
  };

  return (
    <Box
      id="hero"
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '90vh',
      }}
    >
      <Container maxWidth="md">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={10} sx={{ alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, width: '100%' }}>
          <Stack spacing={2} sx={{ alignItems: { xs: 'center', md: 'flex-start' }, textAlign: { xs: 'center', md: 'left' }, width: '100%', order: { xs: 2, md: 1 } }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  color: 'text.primary',
                }}
              >
                {t('hero.title')}
              </Typography>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                }}
              >
                RaymondzyLei
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                {t('hero.subtitle')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  maxWidth: '600px',
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                }}
              >
                {t('hero.bio')}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', mt: 2 }}>
                {socialLinks.map((link, index) => {
                  const Icon = link.icon;
                  const rotateDirection = index % 2 === 0 ? '15deg' : '-15deg';
                  return (
                    <Box
                      key={link.name}
                      component="a"
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                        '--rotate-direction': rotateDirection,
                      } as React.CSSProperties}
                    >
                      <StyledIconButton
                        sx={{
                          color: 'inherit',
                          '&:hover': {
                            backgroundColor: 'transparent',
                          },
                        }}
                        aria-label={link.label}
                      >
                        <Icon />
                      </StyledIconButton>
                    </Box>
                  );
                })}
              </Stack>
              <StyledButton
                ref={ctaTiltRef}
                variant="contained"
                size="large"
                onClick={handleContactClick}
                sx={{
                  mt: 2,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                {t('hero.cta')}
              </StyledButton>
            </Stack>
            <AnimatedAvatar
              src="/avatar.jpg"
              alt="Avatar"
              sx={{
                width: { xs: 200, md: 320 },
                height: { xs: 200, md: 320 },
                fontSize: '3rem',
                fontWeight: 'bold',
                order: { xs: 1, md: 2 },
              }}
            />
          </Stack>
      </Container>
    </Box>
  );
};

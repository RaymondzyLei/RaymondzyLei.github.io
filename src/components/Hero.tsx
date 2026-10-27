import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { keyframes } from '@mui/material/styles';
import { socialLinks } from '../data/social';
import { useScrollToSection } from '../hooks/useScrollToSection';
import { focusVisibleRing } from '../theme';
import { HOME } from '../styles/colors';
import { resumeLangUrl } from '../routing';
import { isSupportedLanguage } from '../i18n/languages';

const rise = keyframes`
  from { transform: translateY(6px); }
  to { transform: translateY(0); }
`;
const appear = keyframes`
  from { opacity: 0; filter: blur(2px); }
  to { opacity: 1; filter: blur(0); }
`;

const entrance = (delay: number, move = true) => ({
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${move ? `${rise} 2400ms cubic-bezier(0.16, 1, 0.3, 1) ${delay * 3}ms backwards, ` : ''}${appear} 1800ms cubic-bezier(0.33, 1, 0.68, 1) ${delay * 3}ms backwards`,
  },
});

export const Hero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const resumeLang = isSupportedLanguage(i18n.language) ? i18n.language : 'en';
  const scrollToSection = useScrollToSection();
  const handleContactClick = () => {
    const element = document.getElementById('contact');
    if (element) scrollToSection(element);
  };

  return (
    <Box
      id="hero"
      component="section"
      sx={{ py: 8, px: 2, minHeight: '90vh', display: 'flex', alignItems: 'center' }}
    >
      <Box
        sx={{
          maxWidth: '1152px',
          mx: 'auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          alignItems: 'center',
          gap: { xs: 4, md: 8 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="p"
            sx={{ ...entrance(0), fontSize: '20px', fontWeight: 600, mb: 1 }}
          >
            {t('hero.title')}
          </Typography>
          <Typography
            component="h1"
            sx={{
              ...entrance(60),
              fontSize: { xs: '40px', md: '48px' },
              lineHeight: 1.15,
              fontWeight: 700,
              overflowWrap: 'anywhere',
              mb: 1,
            }}
          >
            {t('hero.name')}
          </Typography>
          <Typography
            component="p"
            sx={(theme) => ({
              ...entrance(120),
              fontSize: { xs: '24px', md: '30px' },
              fontWeight: 600,
              color: 'primary.main',
              mb: 3,
              '@supports (background-clip: text)': {
                backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${HOME.gradientEnd})`,
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              },
            })}
          >
            {t('hero.subtitle')}
          </Typography>
          <Typography
            sx={{
              ...entrance(180),
              color: 'text.secondary',
              fontSize: '18px',
              lineHeight: 1.7,
              mb: 3,
            }}
          >
            {t('hero.bio')}
          </Typography>
          <Box sx={{ ...entrance(240), display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Button variant="contained" size="large" href={resumeLangUrl(resumeLang)}>
              {t('hero.resumeCta')}
            </Button>
            <Button variant="outlined" size="large" onClick={handleContactClick}>
              {t('hero.cta')}
            </Button>
          </Box>
          <Box sx={{ ...entrance(300), display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Box
                  key={link.id}
                  component="a"
                  href={link.url}
                  aria-label={t(`data.social.${link.id}.label`)}
                  {...(link.url.startsWith('http')
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  sx={{
                    ...focusVisibleRing(2),
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 44,
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  <Icon />
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box
          sx={{ ...entrance(360, false), display: 'flex', justifyContent: 'center', minWidth: 0 }}
        >
          <Avatar
            src="/avatar.webp"
            srcSet="/avatar.webp 1x, /avatar-2x.webp 2x"
            alt={t('hero.avatarAlt')}
            slotProps={{ img: { decoding: 'async' } }}
            sx={{
              width: { xs: 256, md: 320 },
              maxWidth: '100%',
              height: 'auto',
              aspectRatio: '1',
              border: '4px solid',
              borderColor: 'background.paper',
              boxShadow: 3,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

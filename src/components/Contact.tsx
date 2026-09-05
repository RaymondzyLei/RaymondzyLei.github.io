import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import FolderIcon from '@mui/icons-material/Folder';
import { socialLinks } from '../data/social';
import { contactLinks } from '../data/contact';
import { useTilt } from '../hooks/useTilt';
import { useReveal } from '../hooks/useReveal';
import { revealSx } from '../styles/reveal';
import { GlassCard } from './GlassCard';
import { LiquidGlassButton } from './LiquidGlassButton';
import { Section } from './Section';
import { easing, default as theme } from '../theme';

/** Card header: title + description, shared by both contact cards. */
const CardIntro: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
      {description}
    </Typography>
  </>
);

/** Right-side text block of a link row (name + label), shared by both cards. */
const LinkText: React.FC<{ name: string; label: string }> = ({ name, label }) => (
  <Box>
    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
      {name}
    </Typography>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
  </Box>
);

export const Contact: React.FC = () => {
  const { t } = useTranslation();
  const connectTiltRef = useTilt();
  const linksTiltRef = useTilt();
  const { ref: connectCellRef, isVisible: connectVisible } = useReveal();
  const { ref: linksCellRef, isVisible: linksVisible } = useReveal();

  return (
    <Section id="contact" title={t('contact.title')} maxWidth="md" revealDelay={0}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 4,
        }}
      >
        <Box ref={connectCellRef} sx={revealSx(connectVisible, 0)}>
          <GlassCard ref={connectTiltRef} sx={{ p: 3, height: '100%' }}>
            <CardIntro title={t('contact.connectTitle')} description={t('contact.connectDesc')} />
            <Stack spacing={2}>
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Box
                    key={link.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <LiquidGlassButton
                      icon={<Icon />}
                      label={t(`data.social.${link.id}.label`)}
                      href={link.url}
                    />
                    <LinkText
                      name={t(`data.social.${link.id}.name`)}
                      label={t(`data.social.${link.id}.label`)}
                    />
                  </Box>
                );
              })}
            </Stack>
          </GlassCard>
        </Box>

        <Box ref={linksCellRef} sx={revealSx(linksVisible, 60)}>
          <GlassCard ref={linksTiltRef} sx={{ p: 3, height: '100%' }}>
            <CardIntro title={t('contact.linksTitle')} description={t('contact.linksDesc')} />
            <Stack spacing={2}>
              {contactLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Box
                    key={link.id}
                    component="a"
                    href={link.url}
                    {...(link.url.startsWith('http')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      textDecoration: 'none',
                      p: 1,
                      borderRadius: 1,
                      transition: theme.transitions.create(['background-color'], {
                        duration: theme.transitions.duration.shorter,
                        easing: easing.easeOut,
                      }),
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.contrastText',
                      }}
                    >
                      {Icon ? <Icon /> : <FolderIcon />}
                    </Box>
                    <LinkText
                      name={t(`data.contact.${link.id}.name`)}
                      label={t(`data.contact.${link.id}.label`)}
                    />
                  </Box>
                );
              })}
            </Stack>
          </GlassCard>
        </Box>
      </Box>
    </Section>
  );
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import FolderIcon from '@mui/icons-material/Folder';
import { socialLinks } from '../data/social';
import { contactLinks } from '../data/contact';
import type { ContactLink } from '../data/contact';
import { focusVisibleRing } from '../theme';
import { HomeCard } from './HomeCard';
import { Section } from './Section';

const CardIntro: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <>
    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
      {description}
    </Typography>
  </>
);

const LinkText: React.FC<{ name: string; label: string }> = ({ name, label }) => (
  <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
      {name}
    </Typography>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
  </Box>
);

const rowSx = {
  ...focusVisibleRing(2),
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  minHeight: 44,
  textDecoration: 'none',
  p: 1,
  borderRadius: '8px',
  color: 'primary.main',
  '&:hover': { backgroundColor: 'action.hover' },
};

const ContactLinkRow: React.FC<{ link: ContactLink }> = ({ link }) => {
  const { t } = useTranslation();
  const Icon = link.icon || FolderIcon;
  return (
    <Box
      component="a"
      href={link.url}
      {...(link.url.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      sx={rowSx}
    >
      <Icon />
      <LinkText
        name={t(`data.contact.${link.id}.name`)}
        label={t(`data.contact.${link.id}.label`)}
      />
    </Box>
  );
};

export const Contact: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Section id="contact" title={t('contact.title')}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          alignItems: 'start',
          gap: 4,
        }}
      >
        <HomeCard>
          <CardIntro title={t('contact.connectTitle')} description={t('contact.connectDesc')} />
          <Stack spacing={1}>
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
                  sx={rowSx}
                >
                  <Icon />
                  <LinkText
                    name={t(`data.social.${link.id}.name`)}
                    label={t(`data.social.${link.id}.label`)}
                  />
                </Box>
              );
            })}
          </Stack>
        </HomeCard>
        <HomeCard>
          <CardIntro title={t('contact.linksTitle')} description={t('contact.linksDesc')} />
          <Stack spacing={1}>
            {contactLinks.map((link) => (
              <ContactLinkRow key={link.id} link={link} />
            ))}
          </Stack>
        </HomeCard>
      </Box>
    </Section>
  );
};

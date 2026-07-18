import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import FolderIcon from '@mui/icons-material/Folder';
import { socialLinks } from '../data/social';
import { contactLinks } from '../data/contact';
import { useTilt } from '../hooks/useTilt';
import { useReveal } from '../hooks/useReveal';
import { revealSx } from '../styles/reveal';
import { GlassCard } from './GlassCard';
import { LiquidGlassButton } from './LiquidGlassButton';

export const Contact: React.FC = () => {
  const { t } = useTranslation();
  const connectTiltRef = useTilt();
  const linksTiltRef = useTilt();
  const { ref: sectionRef, isVisible: sectionVisible } = useReveal();
  const { ref: connectCellRef, isVisible: connectVisible } = useReveal();
  const { ref: linksCellRef, isVisible: linksVisible } = useReveal();

  return (
    <Box
      id="contact"
      ref={sectionRef}
      component="section"
      sx={{
        py: 8,
        ...revealSx(sectionVisible, 0),
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          component="h2"
          sx={{
            mb: 6,
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'text.primary',
          }}
        >
          {t('contact.title')}
        </Typography>

        <Grid
          container
          spacing={4}
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}
        >
          <Box ref={connectCellRef} sx={revealSx(connectVisible, 0)}>
            <GlassCard ref={connectTiltRef} sx={{ p: 3, height: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: 'text.primary',
                }}
              >
                {t('contact.connectTitle')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                {t('contact.connectDesc')}
              </Typography>

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
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                          }}
                        >
                          {t(`data.social.${link.id}.name`)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                          }}
                        >
                          {t(`data.social.${link.id}.label`)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </GlassCard>
          </Box>

          <Box ref={linksCellRef} sx={revealSx(linksVisible, 100)}>
            <GlassCard ref={linksTiltRef} sx={{ p: 3, height: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: 'text.primary',
                }}
              >
                {t('contact.linksTitle')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                {t('contact.linksDesc')}
              </Typography>

              <Stack spacing={2}>
                {contactLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Box
                      key={link.id}
                      component="a"
                      href={link.url}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        textDecoration: 'none',
                        p: 1,
                        borderRadius: 1,
                        transition: 'background-color 0.2s',
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
                          color: 'background.paper',
                        }}
                      >
                        {Icon ? <Icon /> : <FolderIcon />}
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                          }}
                        >
                          {t(`data.contact.${link.id}.name`)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                          }}
                        >
                          {t(`data.contact.${link.id}.label`)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </GlassCard>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
};
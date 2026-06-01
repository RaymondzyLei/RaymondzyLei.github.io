import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import FolderIcon from '@mui/icons-material/Folder';
import { socialLinks } from '../data/social';
import { contactLinks } from '../data/contact';
import { useTilt } from '../hooks/useTilt';

const ContactPaper = styled(Paper)(({ theme }) => ({
  transition: theme.transitions.create(['boxShadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

export const Contact: React.FC = () => {
  const { t } = useTranslation();
  const connectTiltRef = useTilt();
  const linksTiltRef = useTilt();

  return (
    <Box
      id="contact"
      component="section"
      sx={{
        py: 8,
        backgroundColor: 'action.hover',
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

        <Grid container spacing={4} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <Box>
            <ContactPaper ref={connectTiltRef} sx={{ p: 3, height: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: 'text.primary',
                }}
              >
                Connect With Me
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                Feel free to reach out through any of these channels. I'm always happy to connect
                and discuss opportunities.
              </Typography>

              <Stack spacing={2}>
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Box
                      key={link.name}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <IconButton
                        component="a"
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'background.paper',
                          },
                        }}
                      >
                        <Icon />
                      </IconButton>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                          }}
                        >
                          {link.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                          }}
                        >
                          {link.label}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </ContactPaper>
          </Box>

          <Box>
            <ContactPaper ref={linksTiltRef} sx={{ p: 3, height: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: 'text.primary',
                }}
              >
                Useful Links
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                Here are some of my selected projects and articles you might find interesting.
              </Typography>

              <Stack spacing={2}>
                {contactLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Box
                      key={link.name}
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
                          {link.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                          }}
                        >
                          {link.label}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </ContactPaper>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
};

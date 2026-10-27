import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CertDownloadButton } from './CertDownloadButton';
import { timelineData } from '../data/timeline';
import { HomeCard } from './HomeCard';
import { Section } from './Section';

export const Qualifications: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Section id="qualifications" title={t('qualifications.title')}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {timelineData.map((item) => {
          const p = `data.timeline.${item.id}`;
          return (
            <HomeCard key={item.id} sx={{ borderLeft: 4, borderLeftColor: 'primary.main' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'baseline' },
                  gap: 1,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontWeight: 600, color: 'primary.main' }}
                  >
                    {t(`${p}.title`)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}
                  >
                    {t(`${p}.institution`)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                  {t(`${p}.date`)}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.8, whiteSpace: 'pre-line' }}
              >
                {t(`${p}.description`)}
              </Typography>
              {item.file && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <CertDownloadButton
                    file={item.file}
                    label={t(`${p}.certLabel`, '') || t('qualifications.download')}
                  />
                </Box>
              )}
            </HomeCard>
          );
        })}
      </Box>
    </Section>
  );
};

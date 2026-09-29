import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export interface SectionHeadingProps {
  title: string;
  number?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ title, number }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: { xs: 2, md: 3 },
      mb: { xs: 4, md: 6 },
      '@media (max-width: 359px)': { flexWrap: 'wrap', '& > h2': { flexBasis: '100%' } },
    }}
  >
    {number && (
      <Typography
        component="span"
        aria-hidden="true"
        sx={{
          fontSize: { xs: '2.5rem', md: '3.5rem' },
          fontWeight: 300,
          lineHeight: 1,
          letterSpacing: '-0.06em',
          color: 'primary.main',
          opacity: 0.55,
          flexShrink: 0,
          pointerEvents: 'none',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {number}
      </Typography>
    )}
    <Typography
      variant="h3"
      component="h2"
      sx={{
        fontSize: { xs: '1.65rem', sm: '2rem', md: '2.5rem' },
        fontWeight: 'bold',
        textAlign: 'left',
        color: 'text.primary',
        minWidth: 0,
        overflowWrap: 'anywhere',
      }}
    >
      {title}
    </Typography>
    <Box
      aria-hidden="true"
      sx={{
        display: { xs: 'none', sm: 'block' },
        flex: 1,
        borderTop: 1,
        borderColor: 'divider',
        pointerEvents: 'none',
      }}
    />
  </Box>
);

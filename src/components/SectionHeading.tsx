import React from 'react';
import Typography from '@mui/material/Typography';

export interface SectionHeadingProps {
  title: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ title }) => (
  <Typography
    component="h2"
    sx={{
      fontSize: '30px',
      lineHeight: 1.2,
      fontWeight: 700,
      textAlign: 'center',
      color: 'text.primary',
      overflowWrap: 'anywhere',
      mb: 4,
    }}
  >
    {title}
  </Typography>
);

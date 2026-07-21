import React from 'react';
import Typography from '@mui/material/Typography';

/**
 * Shared section heading for the 6-block homepage (ui-ux-pro-max `consistency`).
 * Renders `variant="h3" component="h2"` with the unified mb/weight/alignment.
 * Letter-spacing & line-height come from theme typography (M3 optical sizing),
 * so they need not be repeated here.
 */
export interface SectionHeadingProps {
  title: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ title }) => (
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
    {title}
  </Typography>
);

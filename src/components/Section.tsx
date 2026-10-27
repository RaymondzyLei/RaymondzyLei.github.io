import React from 'react';
import Box from '@mui/material/Box';
import { HOME } from '../styles/colors';
import { SectionHeading } from './SectionHeading';

export interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

/** Shared shell for the five content sections of the homepage. */
export const Section: React.FC<SectionProps> = ({ id, title, children }) => {
  const alternate = id === 'skills' || id === 'academic' || id === 'contact';
  return (
    <Box
      id={id}
      component="section"
      sx={{
        py: 8,
        px: 2,
        scrollMarginTop: { xs: '56px', md: '64px' },
        backgroundColor: alternate ? HOME.light.alternate : HOME.light.plain,
        '[data-mui-color-scheme="dark"] &': {
          backgroundColor: alternate ? HOME.dark.alternate : HOME.dark.plain,
        },
      }}
    >
      <Box sx={{ maxWidth: '1152px', mx: 'auto' }}>
        <SectionHeading title={title} />
        {children}
      </Box>
    </Box>
  );
};

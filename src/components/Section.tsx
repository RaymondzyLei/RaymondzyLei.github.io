import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { useReveal } from '../hooks/useReveal';
import { revealSx } from '../styles/reveal';
import { SectionHeading } from './SectionHeading';

export interface SectionProps {
  id: string;
  title: string;
  maxWidth?: 'md' | 'lg' | 'sm';
  /** Scroll-reveal delay in ms (default 0). */
  revealDelay?: number;
  children: React.ReactNode;
}

/**
 * Shared homepage section shell: scroll-reveal Box[component=section] +
 * Container + SectionHeading. DRYs the 5 homepage sections. NotFound /
 * RedirectPage keep their own full-height centered shells.
 */
export const Section: React.FC<SectionProps> = ({
  id,
  title,
  maxWidth = 'md',
  revealDelay = 0,
  children,
}) => {
  const { ref, isVisible } = useReveal();
  return (
    <Box id={id} ref={ref} component="section" sx={{ py: 8, ...revealSx(isVisible, revealDelay) }}>
      <Container maxWidth={maxWidth}>
        <SectionHeading title={title} />
        {children}
      </Container>
    </Box>
  );
};

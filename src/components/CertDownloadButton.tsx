import React from 'react';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';

/**
 * Shared outlined "download certificate" button for Qualifications (timeline)
 * and Academic (achievements). Same styling/logic so the two sections can't
 * diverge.
 */
export interface CertDownloadButtonProps {
  file: { path: string };
  label: string;
}

export const CertDownloadButton: React.FC<CertDownloadButtonProps> = ({ file, label }) => (
  <Button
    size="small"
    startIcon={<DownloadIcon />}
    href={file.path}
    download={file.path.split('/').pop() || true}
    variant="outlined"
    sx={{
      borderColor: 'primary.main',
      color: 'primary.main',
      textTransform: 'none',
      '&:hover': {
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
      },
    }}
  >
    {label}
  </Button>
);

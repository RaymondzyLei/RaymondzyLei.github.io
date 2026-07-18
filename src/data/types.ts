import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material';

/**
 * Shared shape for social/contact link entries. `icon` is optional - contact
 * links may omit it and fall back to a default (see Contact's FolderIcon).
 */
export interface BaseLink {
  name: string;
  url: string;
  label: string;
  icon?: ComponentType<SvgIconProps>;
}

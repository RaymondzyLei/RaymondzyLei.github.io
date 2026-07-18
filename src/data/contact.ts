import WebIcon from '@mui/icons-material/Web';
import CodeIcon from '@mui/icons-material/Code';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';
import type { SvgIconProps } from '@mui/material';
import type { ComponentType } from 'react';

export interface ContactLink {
  id: string;
  url: string;
  icon?: ComponentType<SvgIconProps>;
}

export const contactLinks: ContactLink[] = [
  { id: 'portfolio-website', url: '#', icon: WebIcon },
  { id: 'github-repos', url: 'https://github.com/RaymondzyLei?tab=repositories', icon: CodeIcon },
  { id: 'blog', url: '#', icon: ArticleIcon },
  { id: 'resume-download', url: '#', icon: DescriptionIcon },
];
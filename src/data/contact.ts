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
  // TODO: replace the placeholder with the portfolio website URL.
  { id: 'portfolio-website', url: '#', icon: WebIcon },
  { id: 'github-repos', url: 'https://github.com/RaymondzyLei?tab=repositories', icon: CodeIcon },
  // TODO: replace the placeholder with the blog URL.
  { id: 'blog', url: '#', icon: ArticleIcon },
  { id: 'resume-download', url: '/resume', icon: DescriptionIcon },
];

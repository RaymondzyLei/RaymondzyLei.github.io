import WebIcon from '@mui/icons-material/Web';
import CodeIcon from '@mui/icons-material/Code';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';
import type { SvgIconProps } from '@mui/material';

export interface ContactLink {
  name: string;
  url: string;
  label: string;
  icon?: React.ComponentType<SvgIconProps>;
}

export const contactLinks: ContactLink[] = [
  // TODO: replace with real link
  { name: 'Portfolio Website', url: '#', label: 'View my latest work', icon: WebIcon },
  { name: 'GitHub Repositories', url: 'https://github.com/RaymondzyLei?tab=repositories', label: 'Open source projects', icon: CodeIcon },
  // TODO: replace with real link
  { name: 'Blog', url: '#', label: 'Articles and tutorials', icon: ArticleIcon },
  // TODO: replace with real link
  { name: 'Resume Download', url: '#', label: 'Get my latest resume', icon: DescriptionIcon },
];

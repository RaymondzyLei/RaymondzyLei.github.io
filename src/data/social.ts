import GitHub from '@mui/icons-material/GitHub';
import XIcon from '@mui/icons-material/X';
import EmailIcon from '@mui/icons-material/Email';
import type { SvgIconProps } from '@mui/material';

export interface SocialLink {
  name: string;
  url: string;
  icon: React.ComponentType<SvgIconProps>;
  label: string;
}

export const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/RaymondzyLei',
    icon: GitHub,
    label: 'https://github.com/RaymondzyLei',
  },
  {
    name: 'X',
    url: 'https://x.com/RaymondzyLei',
    icon: XIcon,
    label: 'https://x.com/RaymondzyLei',
  },
  {
    name: 'Email(School)',
    url: 'mailto:raymond.lei@mail.ustc.edu.cn',
    icon: EmailIcon,
    label: 'raymond.lei@mail.ustc.edu.cn',
  },
  {
    name: 'Email(Personal)',
    url: 'mailto:raymond.zy.lei@outlook.com',
    icon: EmailIcon,
    label: 'raymond.zy.lei@outlook.com',
  },
];

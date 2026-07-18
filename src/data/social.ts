import GitHub from '@mui/icons-material/GitHub';
import XIcon from '@mui/icons-material/X';
import EmailIcon from '@mui/icons-material/Email';
import type { BaseLink } from './types';

export interface SocialLink extends BaseLink {
  // Social links always carry an icon (strengthen BaseLink's optional field).
  icon: NonNullable<BaseLink['icon']>;
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

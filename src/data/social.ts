import GitHub from '@mui/icons-material/GitHub';
import XIcon from '@mui/icons-material/X';
import EmailIcon from '@mui/icons-material/Email';
import type { SvgIconProps } from '@mui/material';
import type { ComponentType } from 'react';

export interface SocialLink {
  id: string;
  url: string;
  icon: ComponentType<SvgIconProps>;
}

export const socialLinks: SocialLink[] = [
  { id: 'github', url: 'https://github.com/RaymondzyLei', icon: GitHub },
  { id: 'x', url: 'https://x.com/RaymondzyLei', icon: XIcon },
  { id: 'email-school', url: 'mailto:raymond.lei@mail.ustc.edu.cn', icon: EmailIcon },
  { id: 'email-personal', url: 'mailto:raymond.zy.lei@outlook.com', icon: EmailIcon },
];

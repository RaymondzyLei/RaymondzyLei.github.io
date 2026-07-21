import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LanguageIcon from '@mui/icons-material/Language';

const LANGUAGES = [
  { code: 'en', labelKey: 'nav.langEn' as const },
  { code: 'zh', labelKey: 'nav.langZh' as const },
] as const;

/** Language picker (IconButton + dropdown). Persists via i18n's languageChanged listener. */
export const LanguageMenu: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget);
  };
  const handleClose = () => setAnchor(null);
  const handleChange = (lang: string) => {
    i18n.changeLanguage(lang);
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-label={t('layout.changeLanguage')}
        title={t('layout.changeLanguage')}
      >
        <LanguageIcon />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={handleClose}>
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            selected={i18n.language === lang.code}
            aria-current={i18n.language === lang.code ? 'true' : undefined}
          >
            {t(lang.labelKey)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

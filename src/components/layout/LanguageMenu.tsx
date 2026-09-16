import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LanguageIcon from '@mui/icons-material/Language';
import { LANGUAGE_OPTIONS } from '../../i18n/i18n';
import type { SupportedLanguage } from '../../i18n/languages';
import { langQueryUrl } from '../../routing';

/** Language picker (IconButton + dropdown). Persists via i18n's languageChanged listener. */
export const LanguageMenu: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget);
  };
  const handleClose = () => setAnchor(null);
  const handleChange = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    // Mirror the choice into the URL at the action point (NOT in the
    // languageChanged listener — i18next fires it during init(), which would
    // rewrite every bare URL to the saved language). Relative replaceState
    // keeps the current path and hash: '/#skills' -> '/?lang=zh#skills'.
    history.replaceState(
      null,
      '',
      langQueryUrl(window.location.pathname, lang, window.location.hash.replace(/^#/, '')),
    );
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
        {LANGUAGE_OPTIONS.map((lang) => (
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

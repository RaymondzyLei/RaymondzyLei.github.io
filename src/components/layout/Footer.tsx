import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { friendLinks } from '../../data/contact';
import { socialLinks } from '../../data/social';
import { SURFACE, TEXT } from '../../styles/colors';
import { focusVisibleRing } from '../../theme';

const footerFocus = {
  '&:focus-visible': { outline: `2px solid ${TEXT.dark.primary}`, outlineOffset: 2 },
};

export function Footer({ isHome }: { isHome: boolean }) {
  const { t } = useTranslation();
  return (
    <Box
      component="footer"
      sx={{
        ...(isHome && { bgcolor: SURFACE.dark.default, color: TEXT.dark.primary }),
        ...(isHome && { fontSize: '13px' }),
        px: 2,
        py: 3,
        '@media print': { display: 'none' },
      }}
    >
      <Box sx={{ maxWidth: '1152px', mx: 'auto' }}>
        {isHome && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              gap: 3,
              pb: 3,
            }}
          >
            <Box>
              <Typography component="p" sx={{ fontSize: '16px', fontWeight: 700 }}>
                {t('hero.name')}
              </Typography>
              <Typography
                component="p"
                sx={{ fontSize: '13px', color: TEXT.dark.secondary, mt: 0.5 }}
              >
                {t('hero.subtitle')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.id}
                      href={link.url}
                      aria-label={t(`data.social.${link.id}.label`)}
                      {...(link.url.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      sx={{
                        ...footerFocus,
                        color: TEXT.dark.secondary,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 44,
                        height: 44,
                        '&:hover': { color: TEXT.dark.primary },
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </Link>
                  );
                })}
              </Box>
            </Box>
            <Box component="section" aria-label={t('contact.friendsTitle')} sx={{ minWidth: 0 }}>
              <Typography component="h2" sx={{ fontSize: '14px', fontWeight: 700 }}>
                {t('contact.friendsTitle')}
              </Typography>
              {friendLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{
                    ...footerFocus,
                    display: 'inline-flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: 44,
                    maxWidth: '100%',
                    color: TEXT.dark.secondary,
                    fontSize: '13px',
                    overflowWrap: 'anywhere',
                    '&:hover': { color: TEXT.dark.primary },
                  }}
                >
                  <Box component="span">{t(`data.friends.${link.id}.name`)}</Box>
                  <Box component="span" sx={{ fontSize: '12px' }}>
                    {t(`data.friends.${link.id}.label`)}
                  </Box>
                </Link>
              ))}
            </Box>
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            columnGap: 2,
            textAlign: 'center',
          }}
        >
          <Link
            href="https://beian.miit.gov.cn/"
            target="_blank"
            variant="body2"
            rel="noopener noreferrer"
            underline="hover"
            sx={{
              ...(isHome ? footerFocus : focusVisibleRing(2)),
              color: isHome ? TEXT.dark.secondary : 'text.secondary',
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 44,
              fontSize: isHome ? '12px' : undefined,
            }}
          >
            {t('layout.icpFiling')}
          </Link>
          <Link
            href="https://beian.mps.gov.cn/#/query/webSearch?code=44011202004418"
            target="_blank"
            variant="body2"
            rel="noopener noreferrer"
            underline="hover"
            sx={{
              ...(isHome ? footerFocus : focusVisibleRing(2)),
              color: isHome ? TEXT.dark.secondary : 'text.secondary',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              minHeight: 44,
              fontSize: isHome ? '12px' : undefined,
            }}
          >
            <Box
              component="img"
              src="/public-security-filing.png"
              alt=""
              width={18}
              height={20}
              sx={{ flexShrink: 0 }}
            />
            {t('layout.publicSecurityFiling')}
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

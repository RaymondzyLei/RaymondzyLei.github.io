import { useEffect, useState, lazy, Suspense } from 'react';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { InitColorSchemeScript } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactLenis } from 'lenis/react';
import theme from './theme';
import { Layout } from './components/Layout';
import { SECTIONS } from './sections';
import { resolveRoute } from './routing';

const NotFound = lazy(() => import('./components/NotFound').then((m) => ({ default: m.NotFound })));
const RedirectPage = lazy(() =>
  import('./components/RedirectPage').then((m) => ({ default: m.RedirectPage })),
);
const ResumePage = lazy(() =>
  import('./components/ResumePage').then((m) => ({ default: m.ResumePage })),
);

/**
 * Keeps <html data-mui-color-scheme> in sync with the MUI mode so the
 * pre-paint inline CSS in index.html (anti-FOUC html background) and the
 * static dual-selector rules in theme.ts (focus ring / ::selection /
 * scrollbar) follow in-app theme toggles. Without this, the attribute is
 * only set once by the head script and goes stale after toggling.
 */
function ColorSchemeAttrSync() {
  const { mode } = useColorScheme();
  useEffect(() => {
    const el = document.documentElement;
    if (mode === 'light' || mode === 'dark') {
      el.setAttribute('data-mui-color-scheme', mode);
      return undefined;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => el.setAttribute('data-mui-color-scheme', mq.matches ? 'dark' : 'light');
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [mode]);
  return null;
}

function App() {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const lenisOptions = reducedMotion ? { duration: 0, smoothWheel: false } : { lerp: 0.1 };

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const route = resolveRoute(pathname);
  const isNotFound = route.type !== 'home';

  return (
    <>
      <InitColorSchemeScript defaultMode="system" />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* Theme light<->dark transitions use the View Transitions API (see
            Navbar handleModeChange). The previous body background-color
            transition is removed: VT's root cross-fade replaces it, and a CSS
            transition would compose muddy on top of the VT snapshot. */}
        <ReactLenis root options={lenisOptions}>
          <ColorSchemeAttrSync />
          <Suspense fallback={null}>
            {route.type === 'resume' ? (
              <ResumePage />
            ) : (
              <Layout isNotFound={isNotFound}>
                {route.type === 'redirect' ? (
                  <RedirectPage rule={route.rule} />
                ) : route.type === 'notFound' ? (
                  <NotFound />
                ) : (
                  <>
                    {SECTIONS.map(({ id, Component }) => (
                      <Component key={id} />
                    ))}
                  </>
                )}
              </Layout>
            )}
          </Suspense>
        </ReactLenis>
      </ThemeProvider>
    </>
  );
}

export default App;

import { useEffect, useState, lazy, Suspense } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { InitColorSchemeScript, GlobalStyles } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactLenis } from 'lenis/react';
import theme from './theme';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { Skills } from './components/Skills';
import { Qualifications } from './components/Qualifications';
import { Academic } from './components/Academic';
import { Portfolio } from './components/Portfolio';
import { Contact } from './components/Contact';
import { resolveRoute } from './routing';

const NotFound = lazy(() => import('./components/NotFound').then((m) => ({ default: m.NotFound })));
const RedirectPage = lazy(() =>
  import('./components/RedirectPage').then((m) => ({ default: m.RedirectPage })),
);
const ResumePage = lazy(() =>
  import('./components/ResumePage').then((m) => ({ default: m.ResumePage })),
);

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
        {/* apple-design §14: ease dark<->light theme changes (avoid abrupt
            brightness jumps). Only transition the body background + base text
            color -- the biggest brightness contributors -- so the swap doesn't
            feel like a flash. Disabled under reduced-motion per a11y guidance. */}
        <GlobalStyles
          styles={{
            body: {
              transition: 'background-color 400ms ease, color 400ms ease',
            },
            '@media (prefers-reduced-motion: reduce)': {
              body: {
                transition: 'none',
              },
            },
          }}
        />
        <ReactLenis root options={lenisOptions}>
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
                    <Hero />
                    <Skills />
                    <Qualifications />
                    <Academic />
                    <Portfolio />
                    <Contact />
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

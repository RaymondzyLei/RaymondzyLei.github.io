import { useEffect, useState, lazy, Suspense } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { InitColorSchemeScript } from '@mui/material';
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
      <InitColorSchemeScript defaultMode="light" />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ReactLenis root options={lenisOptions}>
          <Layout isNotFound={isNotFound}>
            <Suspense fallback={null}>
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
            </Suspense>
          </Layout>
        </ReactLenis>
      </ThemeProvider>
    </>
  );
}

export default App;

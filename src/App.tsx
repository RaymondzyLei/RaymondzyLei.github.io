import { useState } from 'react';
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

function App() {
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const lenisOptions = reducedMotion
    ? { duration: 0, smoothWheel: false }
    : { lerp: 0.1 };

  return (
    <>
      <InitColorSchemeScript defaultMode="light" />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ReactLenis root options={lenisOptions}>
          <Layout>
            <Hero />
            <Skills />
            <Qualifications />
            <Academic />
            <Portfolio />
            <Contact />
          </Layout>
        </ReactLenis>
      </ThemeProvider>
    </>
  );
}

export default App;

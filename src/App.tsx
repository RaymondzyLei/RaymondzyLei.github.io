import { ThemeProvider } from '@mui/material/styles';
import { InitColorSchemeScript } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { Skills } from './components/Skills';
import { Qualifications } from './components/Qualifications';
import { Academic } from './components/Academic';
import { Portfolio } from './components/Portfolio';
import { Contact } from './components/Contact';

function App() {
  return (
    <>
      <InitColorSchemeScript defaultMode="light" />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout>
          <Hero />
          <Skills />
          <Qualifications />
          <Academic />
          <Portfolio />
          <Contact />
        </Layout>
      </ThemeProvider>
    </>
  );
}

export default App;

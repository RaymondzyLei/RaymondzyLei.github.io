import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n/i18n';

// Ubuntu Mono font
import './fonts.css';

// Lenis recommended CSS (html height, scroll-behavior override, etc.)
import 'lenis/dist/lenis.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

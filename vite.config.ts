import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import { SURFACE } from './src/styles/colors';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      // Injects src/styles/colors.ts values into index.html so even the
      // pre-paint anti-FOUC CSS and meta theme-color share the single color
      // source (runs in dev server and build).
      name: 'inject-design-tokens',
      transformIndexHtml(html) {
        return html
          .replaceAll('__COLOR_LIGHT__', SURFACE.light.default)
          .replaceAll('__COLOR_DARK__', SURFACE.dark.default);
      },
    },
    {
      name: 'copy-404-html',
      closeBundle() {
        copyFileSync('dist/index.html', 'dist/404.html');
      },
    },
  ],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (
            id.includes('node_modules/.pnpm/react@') ||
            id.includes('node_modules/.pnpm/react-dom@')
          )
            return 'vendor-react';
          if (id.includes('node_modules/.pnpm/@mui+')) return 'vendor-mui';
          if (
            id.includes('node_modules/.pnpm/i18next@') ||
            id.includes('node_modules/.pnpm/react-i18next@')
          )
            return 'vendor-i18n';
        },
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
          if (id.includes('node_modules/.pnpm/react@') || id.includes('node_modules/.pnpm/react-dom@'))
            return 'vendor-react';
          if (id.includes('node_modules/.pnpm/@mui+'))
            return 'vendor-mui';
          if (id.includes('node_modules/.pnpm/i18next@') || id.includes('node_modules/.pnpm/react-i18next@'))
            return 'vendor-i18n';
        },
      },
    },
  },
});
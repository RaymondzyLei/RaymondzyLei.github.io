import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitest.dev/config/
// Separate from vite.config.ts so the copy-404 build plugin doesn't run during tests.
export default defineConfig({
  plugins: [react()],
  test: {
    // Keep nested worktrees and local tool artifacts out of test discovery.
    dir: './src',
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});

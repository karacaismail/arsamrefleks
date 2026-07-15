/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' => relative asset paths so the build works under any GitHub Pages subpath
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    css: false,
  },
});

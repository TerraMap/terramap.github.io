import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['jquery'],
      output: {
        globals: {
          jquery: 'jQuery',
        },
      },
    },
  },
  resolve: {
    alias: {
      jquery: '/src/jquery-shim.ts',
    },
  },
  test: {
    globals: true,
  },
});

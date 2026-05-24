import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          antd: ['antd', '@ant-design/icons'],
          settings: ['./src/settings.ts', './src/MapHelper.ts'],
        },
      },
    },
  },
  test: {
    globals: true,
  },
});

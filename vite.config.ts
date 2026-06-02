import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          antd: ['antd', '@ant-design/icons'],
          tiles: ['./src/tiles.ts'],
          items: ['./src/items.ts'],
          gamedata: ['./src/walls.ts', './src/npcs.ts', './src/itemPrefixes.ts', './src/MapHelper.ts'],
        },
      },
    },
  },
  test: {
    globals: true,
    exclude: ['local-server/**', 'node_modules/**'],
  },
});

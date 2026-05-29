import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

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
  },
});

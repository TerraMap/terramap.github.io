import { execSync } from 'node:child_process';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { version } from './package.json';

function getGitHash() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __GIT_HASH__: JSON.stringify(getGitHash()),
  },
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/antd') || id.includes('node_modules/@ant-design/icons')) {
            return 'antd';
          }
          if (id.includes('/src/tiles.ts')) {
            return 'tiles';
          }
          if (id.includes('/src/items.ts')) {
            return 'items';
          }
          if (
            id.includes('/src/walls.ts') ||
            id.includes('/src/npcs.ts') ||
            id.includes('/src/itemPrefixes.ts') ||
            id.includes('/src/MapHelper.ts')
          ) {
            return 'gamedata';
          }
        },
      },
    },
  },
  test: {
    globals: true,
    exclude: ['native/**', 'node_modules/**'],
  },
});

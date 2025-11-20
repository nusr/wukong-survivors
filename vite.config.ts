import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const venderConfig = {
  'react-vendor': ['react', 'react-dom'],
  'i18next-vendor': ['i18next', 'react-i18next'],
  'phaser-vendor': ['phaser'],
};

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.ROOT_BASE_URL ? process.env.ROOT_BASE_URL : undefined,
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          for (const [chunkName, chunks] of Object.entries(venderConfig)) {
            if (chunks.some((chunk) => id.includes(`node_modules/${chunk}`))) {
              return chunkName;
            }
          }
        },
      },
    },
  },
});

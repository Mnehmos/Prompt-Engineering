import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://mnehmos.github.io',
  base: process.env.NODE_ENV === 'production' ? '/mnehmos.prompts.research/' : '/',
  output: 'static',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'd3': ['d3'],
            'react': ['react', 'react-dom'],
          }
        }
      }
    }
  }
});

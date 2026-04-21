// astro.config.ts
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://kkrugley.github.io',
  integrations: [react(), mdx()],
  output: 'static',
  server: {
    host: '0.0.0.0',
  },
});

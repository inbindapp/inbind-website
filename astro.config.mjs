import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://inbind.app',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/og/'),
    }),
  ],
});

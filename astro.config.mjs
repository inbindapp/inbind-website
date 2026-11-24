import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import agentMarkdown from './src/integrations/agent-markdown';

export default defineConfig({
  site: 'https://inbind.app',
  // Astro 7 defaults to JSX whitespace rules, which drop the spaces between
  // inline elements on separate lines. Keep the Astro 5 lossless behavior.
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/og/'),
    }),
    agentMarkdown(),
  ],
});

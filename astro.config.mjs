import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import agentMarkdown from './src/integrations/agent-markdown';
import { getAnswers } from './src/utils/answers';

// lastmod tells crawlers which pages changed since their last visit. Only the
// CMS-backed pages have a real date, so static pages are left without one.
let lastmods;
async function lastmodFor(pathname) {
  lastmods ??= (async () => {
    const map = new Map();
    for (const a of await getAnswers()) {
      const date = a.updated ?? a.published;
      if (date) map.set(`/answers/${a.slug}/`, new Date(date));
    }
    const res = await fetch('https://cdn.inbind.app/content/596/posts/_index.json');
    const posts = res.ok ? (await res.json()).items ?? [] : [];
    for (const p of posts) {
      const date = p._meta?.updated_at ?? p._meta?.published_at;
      if (date) map.set(`/blog/${p.slug}/`, new Date(date));
    }
    return map;
  })();
  return (await lastmods).get(pathname);
}

export default defineConfig({
  site: 'https://inbind.app',
  // Astro 7 defaults to JSX whitespace rules, which drop the spaces between
  // inline elements on separate lines. Keep the Astro 5 lossless behavior.
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/og/'),
      serialize: async (item) => {
        const lastmod = await lastmodFor(new URL(item.url).pathname);
        return lastmod ? { ...item, lastmod: lastmod.toISOString() } : item;
      },
    }),
    agentMarkdown(),
  ],
});

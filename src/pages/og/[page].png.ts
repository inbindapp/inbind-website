import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOgImage } from '../../utils/og';

const pages: Record<string, { title: string; description: string }> = {
  home: {
    title: 'Inbind',
    description: 'For people already using AI and markdown, tired of juggling four tools just to get a draft out.',
  },
  pricing: {
    title: 'Pricing',
    description: 'Inbind is free to download and use. Local-first markdown editor with AI editing built in.',
  },
  download: {
    title: 'Download',
    description: 'Download Inbind for macOS, Windows, and Linux. Free to download and use.',
  },
  'use-cases': {
    title: 'Use Cases',
    description: 'If you already use AI and markdown but keep losing context between tools, Inbind is where that workflow comes together.',
  },
};

export const getStaticPaths: GetStaticPaths = () =>
  Object.keys(pages).map((page) => ({ params: { page } }));

export const GET: APIRoute = async ({ params }) => {
  const data = pages[params.page as string];
  const png = await generateOgImage(data.title, data.description);
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};

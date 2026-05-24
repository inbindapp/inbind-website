import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOgImage } from '../../utils/og';

const pages: Record<string, { title: string; description: string }> = {
  home: {
    title: 'Inbind',
    description: 'Take notes the way AI likes to read them. A context-first writing tool for founders and small teams.',
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

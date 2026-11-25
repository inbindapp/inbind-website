import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOgImage } from '../../utils/og';

const pages: Record<string, { title: string; description: string }> = {
  home: {
    title: 'Inbind',
    description: 'A workspace where your AI starts from what your team actually knows. A free markdown editor with AI chat for macOS, Windows and Linux.',
  },
  pricing: {
    title: 'Pricing',
    description: "Inbind is free to download and use. The AI runs on the Claude or ChatGPT subscription you already have, and we don't charge for AI usage.",
  },
  download: {
    title: 'Download',
    description: 'Download Inbind for macOS, Windows and Linux. Free to download and use with the Claude or ChatGPT subscription you already have.',
  },
  'use-cases': {
    title: 'Use cases',
    description: 'How founders, content managers, product marketing managers, engineers and customer success managers use Inbind to turn their notes into work that sounds like them.',
  },
  'content-marketing': {
    title: 'Inbind for content marketing',
    description: 'Write with AI and still sound like your company. Inbind drafts from your own notes, product docs and brand voice, for founders and small teams who publish regularly.',
  },
  privacy: {
    title: 'Privacy & security',
    description: "Your files stay on your computer as plain markdown. Here's what Inbind collects, what it never collects, and how to turn analytics off.",
  },
  about: {
    title: 'About',
    description: 'Inbind is built by two founders who kept running into the same problem: AI content is only as good as the context behind it.',
  },
  blog: {
    title: 'Blog',
    description: 'Notes from the Inbind team on writing with AI, keeping the context behind it current, and building Inbind in the open.',
  },
  answers: {
    title: 'Answers',
    description: 'Straight answers to the questions people ask about writing with Claude, keeping brand docs current and sharing context with a team.',
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

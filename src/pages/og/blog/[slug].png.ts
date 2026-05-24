import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOgImage } from '../../../utils/og';

const COLLECTION_URL = 'https://cdn.inbind.app/content/596/posts';

export const getStaticPaths: GetStaticPaths = async () => {
  const res = await fetch(`${COLLECTION_URL}/_index.json`);
  const data = res.ok ? await res.json() : { items: [] };
  return (data.items ?? []).map((post: any) => ({
    params: { slug: post.slug },
    props: {
      title: post.name,
      description: post['post-summary'] ?? '',
    },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await generateOgImage(props.title, props.description);
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};

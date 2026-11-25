import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOgImage } from '../../../utils/og';
import { getAnswers } from '../../../utils/answers';

export const getStaticPaths: GetStaticPaths = async () => {
  const answers = await getAnswers();
  return answers.map((answer) => ({
    params: { slug: answer.slug },
    props: { title: answer.name, description: answer.shortAnswer },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await generateOgImage(props.title, props.description);
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};

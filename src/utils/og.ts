import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const figtreeRegular = readFileSync(
  resolve('node_modules/@fontsource/figtree/files/figtree-latin-400-normal.woff'),
);
const soraBold = readFileSync(
  resolve('node_modules/@fontsource/sora/files/sora-latin-700-normal.woff'),
);

const logoSvg = readFileSync(resolve('public/logo-color.svg'), 'utf-8');
// Logo SVG viewBox is 1600×600; render at 2× display size for crispness
const LOGO_H = 52;
const LOGO_W = Math.round(LOGO_H * (1600 / 600));
const logoPng = (() => {
  const resvg = new Resvg(logoSvg, { fitTo: { mode: 'height', value: LOGO_H * 2 } });
  const buf = resvg.render().asPng();
  return `data:image/png;base64,${Buffer.from(buf).toString('base64')}`;
})();

function titleFontSize(title: string): number {
  if (title.length <= 30) return 76;
  if (title.length <= 50) return 62;
  return 50;
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '…';
}

export async function generateOgImage(title: string, description: string): Promise<Buffer> {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: '#fffef9',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          fontFamily: '"Figtree"',
        },
        children: [
          // Top: logo
          {
            type: 'img',
            props: {
              src: logoPng,
              style: { height: `${LOGO_H}px`, width: `${LOGO_W}px` },
            },
          },
          // Middle: title + description
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              },
              children: [
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontFamily: '"Sora"',
                      fontWeight: 700,
                      fontSize: `${titleFontSize(title)}px`,
                      lineHeight: 1.1,
                      color: '#2b2b2b',
                      letterSpacing: '-1.5px',
                      margin: '0',
                    },
                    children: truncate(title, 70),
                  },
                },
                {
                  type: 'p',
                  props: {
                    style: {
                      fontFamily: '"Figtree"',
                      fontWeight: 400,
                      fontSize: '28px',
                      lineHeight: 1.5,
                      color: '#7b746b',
                      margin: '0',
                      maxWidth: '800px',
                    },
                    children: truncate(description, 120),
                  },
                },
              ],
            },
          },
          // Bottom: gradient accent bar
          {
            type: 'div',
            props: {
              style: {
                height: '20px',
                borderRadius: '9999px',
                background: 'linear-gradient(90deg, #ff6b6b 0%, #ffd93d 100%)',
                width: '560px',
              },
              children: '',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Figtree', data: figtreeRegular, weight: 400, style: 'normal' },
        { name: 'Sora', data: soraBold, weight: 700, style: 'normal' },
      ],
    },
  );

  return new Resvg(svg).render().asPng();
}

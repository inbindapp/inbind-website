import type { AstroIntegration } from 'astro';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parse, type HTMLElement } from 'node-html-parser';
import TurndownService from 'turndown';
import { markdownPath } from '../utils/markdown';

// Elements that are chrome, decoration or interactive UI rather than content.
// Mark anything else to leave out with `data-md-skip`.
const SKIP_SELECTOR = [
  'script', 'style', 'noscript', 'template', 'svg', 'button',
  'header', 'footer', 'nav',
  '[aria-hidden="true"]', '[data-md-skip]',
].join(', ');

interface PageEntry {
  title: string;
  description: string;
  mdUrl: string;
  published?: string;
  updated?: string;
}

function absolutize(root: HTMLElement, site: URL) {
  for (const el of root.querySelectorAll('a[href], img[src]')) {
    const attr = el.tagName === 'A' ? 'href' : 'src';
    const value = el.getAttribute(attr)!;
    if (value.startsWith('#') || /^[a-z]+:/i.test(value)) continue;
    el.setAttribute(attr, new URL(value, site).toString());
  }
}

// A row of sibling links (download cards, CTA pairs) reads best as a list.
function listifyLinkRows(root: HTMLElement) {
  for (const el of root.querySelectorAll('div')) {
    const kids = el.childNodes.filter((n) => n.nodeType === 1 || n.textContent.trim());
    if (kids.length > 1 && kids.every((n) => (n as HTMLElement).tagName === 'A')) {
      el.innerHTML = `<ul>${kids.map((k) => `<li>${k.toString()}</li>`).join('')}</ul>`;
    }
  }
}

function schemaDates(root: HTMLElement): { published?: string; updated?: string } {
  for (const el of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(el.textContent);
      if (data.datePublished || data.dateModified) {
        return { published: data.datePublished, updated: data.dateModified };
      }
    } catch {}
  }
  return {};
}

function frontmatter(fields: Record<string, string>): string {
  const lines = Object.entries(fields).map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
  return `---\n${lines.join('\n')}\n---\n\n`;
}

function llmsTxt(pages: PageEntry[], site: URL, summary: string): string {
  const item = (p: PageEntry) => `- [${p.title}](${new URL(p.mdUrl, site)}): ${p.description}`;
  const blog = pages
    .filter((p) => p.mdUrl.startsWith('/blog/'))
    .sort((a, b) => (b.published ?? '').localeCompare(a.published ?? ''));
  const answers = pages
    .filter((p) => p.mdUrl.startsWith('/answers/'))
    .sort((a, b) => a.title.localeCompare(b.title));
  const rest = pages
    .filter((p) => !blog.includes(p) && !answers.includes(p))
    .sort((a, b) => (a.mdUrl === '/index.md' ? -1 : b.mdUrl === '/index.md' ? 1 : a.mdUrl.localeCompare(b.mdUrl)));

  return [
    '# Inbind',
    '',
    `> ${summary}`,
    '',
    'Every link below points to a markdown copy of the page. HTML versions live at the same path without `.md`.',
    '',
    '## Pages',
    '',
    ...rest.map(item),
    '',
    '## Blog',
    '',
    ...blog.map(item),
    '',
    '## Answers',
    '',
    'Direct answers to common questions about writing with AI from your own docs. Each page opens with the answer, then the detail and sources.',
    '',
    ...answers.map(item),
    '',
  ].join('\n');
}

/**
 * After the build, writes a markdown copy of every HTML page next to it
 * (dist/pricing/index.html -> dist/pricing.md) and an llms.txt index, so
 * agents can read the site without parsing HTML.
 */
export default function agentMarkdown(): AstroIntegration {
  let site: URL;

  return {
    name: 'agent-markdown',
    hooks: {
      'astro:config:done': ({ config }) => {
        if (!config.site) throw new Error('agent-markdown needs `site` set in astro.config');
        site = new URL(config.site);
      },
      'astro:build:done': async ({ dir, pages, logger }) => {
        const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
        // Turndown only fences <pre><code>. Our command snippets are bare <pre>.
        turndown.addRule('bare-pre', {
          filter: (node) => node.nodeName === 'PRE' && !node.querySelector('code'),
          replacement: (_content, node) => `\n\n\`\`\`\n${node.textContent}\n\`\`\`\n\n`,
        });
        // Turndown has no table support and flattens cells into loose lines.
        // Comparison tables matter to agents, so emit GFM pipe tables.
        turndown.addRule('table', {
          filter: 'table',
          replacement: (_content, node) => {
            const cell = (el: Element) =>
              turndown.turndown((el as HTMLElement).innerHTML).replace(/\s*\n+\s*/g, ' ').replace(/\|/g, '\\|').trim();
            const rows = Array.from((node as HTMLTableElement).querySelectorAll('tr'))
              .map((tr) => Array.from(tr.children).map(cell));
            if (!rows.length) return '';
            const width = Math.max(...rows.map((r) => r.length));
            const line = (r: string[]) => `| ${Array.from({ length: width }, (_, i) => r[i] ?? '').join(' | ')} |`;
            const [head, ...body] = rows;
            return `\n\n${[line(head), line(Array(width).fill('---')), ...body.map(line)].join('\n')}\n\n`;
          },
        });
        turndown.addRule('inline-quote', {
          filter: 'q',
          replacement: (content) => `"${content}"`,
        });
        const entries: PageEntry[] = [];
        let summary = '';

        for (const { pathname } of pages) {
          const htmlFile = new URL(`${pathname}index.html`.replace(/^\/?/, ''), dir);
          let html: string;
          try {
            html = await readFile(htmlFile, 'utf-8');
          } catch {
            continue; // Non-HTML routes such as /og/*.png
          }

          const root = parse(html);
          const title = (root.querySelector('title')?.textContent ?? '').replace(/\s*\|\s*Inbind$/, '').trim();
          const description = root.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
          const url = new URL(pathname, site).toString();
          const mdUrl = markdownPath(`/${pathname}`);
          const { published, updated } = schemaDates(root);
          if (mdUrl === '/index.md') summary = description;

          const body = root.querySelector('body')!;
          body.querySelectorAll(SKIP_SELECTOR).forEach((el) => el.remove());
          body.querySelectorAll('img[alt=""]').forEach((el) => el.remove());
          absolutize(body, site);
          listifyLinkRows(body);

          const markdown = turndown.turndown(body.innerHTML).replace(/\n{3,}/g, '\n\n').trim();
          const meta: Record<string, string> = { title, description, url };
          if (published) meta.published = published;
          if (updated) meta.updated = updated;
          const prompt = body.querySelector('[data-answer-prompt]')?.textContent.trim();
          if (prompt) meta.prompt = prompt;

          await writeFile(new URL(mdUrl.slice(1), dir), `${frontmatter(meta)}${markdown}\n`);
          entries.push({ title: mdUrl === '/index.md' ? 'Home' : title, description, mdUrl, published, updated });
        }

        await writeFile(new URL('llms.txt', dir), llmsTxt(entries, site, summary));
        logger.info(`Wrote ${entries.length} markdown pages and llms.txt to ${fileURLToPath(dir)}`);
      },
    },
  };
}

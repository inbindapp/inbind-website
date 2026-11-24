/**
 * Where the markdown copy of a page lives: `/` -> `/index.md`,
 * `/pricing/` -> `/pricing.md`. The files are written at build time by
 * src/integrations/agent-markdown.ts.
 */
export function markdownPath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return `${trimmed || '/index'}.md`;
}

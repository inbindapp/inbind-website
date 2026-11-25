/**
 * AEO answers: one page per question people ask an AI assistant, fetched from
 * the CMS at build time. The listing only carries slug and name, so we fetch
 * every item once and share the result between the pages and the OG images.
 */
const COLLECTION_URL = 'https://cdn.inbind.app/content/596/aeo-articles';

export interface Answer {
  slug: string;
  name: string;
  body: string;
  shortAnswer: string;
  /** How we imagine someone phrasing this to an AI assistant. */
  targetPrompt?: string;
  author?: { name: string; slug?: string; image?: string };
  /** ISO date of the last content review, from the CMS `last-updated` field. */
  updated?: string;
  /** ISO date the item was first published in the CMS. */
  published?: string;
}

let cache: Promise<Answer[]> | undefined;

function isoDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const d = new Date(value.replace(' ', 'T'));
  return Number.isNaN(d.valueOf()) ? undefined : d.toISOString();
}

async function fetchJson(path: string): Promise<any> {
  const res = await fetch(`${COLLECTION_URL}/${path}`);
  if (!res.ok) throw new Error(`Fetching ${COLLECTION_URL}/${path} failed: ${res.status}`);
  return res.json();
}

async function load(): Promise<Answer[]> {
  const index = await fetchJson('_index.json');
  // An item the index still lists can be gone (unpublished or renamed before
  // the index is rebuilt). Skip those, but let any other failure stop the build.
  const items = await Promise.all(
    ((index.items ?? []) as { slug: string }[]).map(async ({ slug }) => {
      const res = await fetch(`${COLLECTION_URL}/${slug}.json`);
      if (res.status === 404) {
        console.warn(`[answers] Skipping "${slug}": listed in _index.json but its item returns 404`);
        return undefined;
      }
      if (!res.ok) throw new Error(`Fetching ${COLLECTION_URL}/${slug}.json failed: ${res.status}`);
      return res.json();
    }),
  );
  return items
    .filter((item) => item !== undefined)
    .filter((item) => item._meta?.status === undefined || item._meta.status === 'published')
    .map((item): Answer => ({
      slug: item.slug,
      name: item.name,
      body: item.body ?? '',
      shortAnswer: item['short-answer'] ?? '',
      targetPrompt: item['target-prompt']?.trim() || undefined,
      author: item.author?.name
        ? { name: item.author.name, slug: item.author.slug, image: item.author.image?.url }
        : undefined,
      updated: isoDate(item['last-updated']) ?? isoDate(item._meta?.updated_at),
      published: isoDate(item._meta?.created_at) ?? isoDate(item._meta?.published_at),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getAnswers(): Promise<Answer[]> {
  cache ??= load();
  return cache;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

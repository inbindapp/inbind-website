# Inbind Marketing Website

Astro 5 static site deployed to GitHub Pages at inbind.app. Pushes to `main` auto-deploy via GitHub Actions (`.github/workflows/`).

## Dev commands

```
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # serve dist/ locally
```

## Stack

- **Astro 5** — static output, no adapter
- **TypeScript** — strict null checks
- **Plain CSS** — design tokens in `src/styles/tokens.css`, marketing styles in `src/styles/marketing.css`
- **Fonts** — Sora (display), Figtree (body), JetBrains Mono (code), loaded via Google Fonts in `Layout.astro`
- **Blog content** — fetched at build time from `https://cdn.inbind.app/content/596/posts`

## Adding a page

1. Create `src/pages/your-page.astro` using the shared `<Layout>` component.
2. Add an entry to the `pages` map in `src/pages/og/[page].png.ts` with the page's title and description.
3. Pass `ogImage="/og/your-page.png"` to `<Layout>`.

## OG images

Dynamic share images (1200×630 PNG) generated at build time via `satori` + `@resvg/resvg-js`.

- Generator: `src/utils/og.ts` — `generateOgImage(title, description)` returns a PNG buffer. Scales title font size by length; truncates title at 70 chars and description at 120 chars.
- Static pages: `src/pages/og/[page].png.ts` — hardcoded map, one entry per page.
- Blog posts: `src/pages/og/blog/[slug].png.ts` — auto-generated per post from CMS data.

`Layout.astro` emits all `og:*` and `twitter:*` meta tags automatically once `ogImage` is set.

## URL utility

Always use the `url()` helper from `src/utils/url.ts` for internal links and asset paths. It handles the base URL correctly for GitHub Pages.

```astro
import { url } from '../utils/url';
<a href={url('download')}>Download</a>
```

## Brand tokens

Key values (full set in `src/styles/tokens.css`):

| Token | Value |
|---|---|
| Background | `#fffef9` — warm cream, never pure white |
| Text | `#2b2b2b` — warm ink, never pure black |
| Subtle text | `#7b746b` |
| Accent | `#ff6b6b` (orange) |
| Accent gradient | `linear-gradient(90deg, #ff6b6b 0%, #ffd93d 100%)` |

The gradient is reserved for the logo and small accents. Never use it as a section background.

## Voice & tone

Inbind's voice is **The Everyman**. A trusted peer, not a corporate expert. Friendly not formal, clear not complicated, honest not exaggerated.

**Sentence style:** Short sentences. Contractions everywhere (`it's`, `you'll`, `don't`). One idea per sentence. Sentence case everywhere, never Title Case in UI or headings.

**No em dashes.** The brand voice explicitly bans them. Use a period and start a fresh sentence instead, or rephrase. This mirrors how someone actually talks in short bursts.

**Pronouns:** "You and we" — the reader is `you`, Inbind speaks as `we`.

**Words we never use:**
- Hype: "revolutionary", "cutting-edge", "game-changing", "seamless", "effortless", "magical"
- B2B-jargon: "leverage", "synergy", "ecosystem", "all-in-one"
- Adjacent traps: "supercharge", "10x", "next-gen", "AI-powered" as filler, "unleash", "world-class"
- More than one exclamation mark per paragraph
- Emoji — zero, anywhere

**Words we embrace:** "real", "actually", "honestly", "we learned", "we found", "you can", "we don't", "we haven't".

## Design reference

The full design system (colors, type, component patterns, voice doc) lives in `inbind-design-system/project/README.md`. Read it before making visual or copy decisions.

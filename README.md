# Shikaku+ — Landing Page

Marketing / landing site for **Shikaku+**, the daily Shikaku puzzle game. Built
with SvelteKit (Svelte 5). The page features a playable daily puzzle, a roadmap,
and a "Support Us" funding section with a live donations bar.

This is an internal repo — notes here are for us and any collaborator, not a
public pitch.

## Run

```sh
npm install
npm run dev          # dev server
npm run dev -- --open
```

## Other commands

```sh
npm run build        # production build
npm run preview      # preview the production build
npm run check        # svelte-check (types + a11y + unused CSS)
npm run lint         # eslint
npm run test         # vitest (see src/lib/puzzle.test.js)
```

## Going live — the things that aren't obvious from the code

- **Donations bar** — [`src/lib/donations.js`](src/lib/donations.js) reads the
  total raised from a published Google Sheet. It's currently using
  `FALLBACK_RAISED` because `SHEET_CSV_URL` is empty. To go live, publish the
  sheet to web as CSV and paste the URL into `SHEET_CSV_URL`. The full how-to is
  in the comment block at the top of that file.

- **CTA links** — in [`src/routes/+page.svelte`](src/routes/+page.svelte):
  - `PLAY_URL` → `https://shikaku.plus` (the full Flutter web app; also the
    "Open app" / "Open the full game" buttons)
  - `SUPPORT_URL` → `https://paymongo.page/l/shikaku-plus` (the funding page)

- **Daily puzzle** — [`src/lib/daily.js`](src/lib/daily.js) generates a
  deterministic 6×6 Easy puzzle seeded by the day number. The day rolls over at
  **06:00 Philippine Time** (UTC+8). Progress is saved to `localStorage` per
  puzzle (see [`src/lib/storage.js`](src/lib/storage.js)).

- **Support / Foundation timer** — the "Support Us" section
  ([`src/lib/Support.svelte`](src/lib/Support.svelte)) has a hard-coded
  Foundation deadline of **end of August 2026** and exclusive supporter badges
  that are intentionally one-time-only. Bump the `DEADLINE` constant when that
  changes.

## Layout

- `src/routes/+page.svelte` — the landing page (hero + daily board, about,
  roadmap, support, footer)
- `src/routes/{privacy-policy,terms-of-service,data-deletion}/` — legal pages
- `src/lib/*.svelte` — page sections (`Board`, `Support`, `Roadmap`, `About`, …)
- `src/lib/{daily,puzzle,game,storage,donations}.js` — puzzle + funding logic
- `src/lib/tokens.css` — the design system (colors, the single `--radius`, board
  geometry). Match new UI to these.

## Deploy

Uses `@sveltejs/adapter-auto`, which picks an adapter based on the host (Vercel,
Netlify, etc.). If deploying somewhere it can't detect, install and configure the
matching [SvelteKit adapter](https://svelte.dev/docs/kit/adapters).

## Docs

Setup guides, feature specs, and session logs live in [`docs/`](docs/):

- [`BLOG_SETUP.md`](docs/BLOG_SETUP.md) — blog/admin CMS setup
- [`DONATIONS_SETUP.md`](docs/DONATIONS_SETUP.md) — donations bar / webhooks setup
- [`COUNTER.md`](docs/COUNTER.md) — "boards solved" counter spec
- [`LANDING_HANDOFF.md`](docs/LANDING_HANDOFF.md) — data-deletion / legal handoff notes
- [`attrib_export.md`](docs/attrib_export.md) — in-app credits/licenses export
- [`landing_page_attrib_prompt.md`](docs/landing_page_attrib_prompt.md) — spec for the Credits/Open-source landing sections
- `log_*.md` — dated session logs

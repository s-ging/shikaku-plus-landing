# Session notes — 2026-07-01 (Credits section + docs cleanup)

Two workstreams: adding an "About/Credits" section to the landing page (ported
verbatim from the app's in-app About/Licenses pages), and cleaning up the
repo's root-level markdown clutter into `docs/`.

`npx svelte-check` → **0 errors** after the code changes. Verified by running
`npm run dev` and curling the rendered page to confirm both new sections and
all pub.dev/flutter.dev links render correctly.

---

## A. Credits + open-source library sections

Source of truth: a point-in-time export of the app's About/Licenses content
(`docs/attrib_export.md`) and a spec for placing it on the landing page
(`docs/landing_page_attrib_prompt.md`).

- **`src/lib/Credits.svelte`** — NEW. Art / alpha feedback / fonts / game code
  / icons attribution, plus byline + version. Matches the existing
  `About`/`Roadmap` card pattern (`.card`, `--font-ui` heading, `--button-fill`
  links). Credits the GPL-3.0 game code ("shikaku" by Zaphoood) plainly,
  without asserting a compliance position for Shikaku+ itself — that's still
  an open question internally, not something to state on a public page.
- **`src/lib/OpenSource.svelte`** — NEW. Table of the 14 direct `pubspec.yaml`
  dependencies, each linked to its `pub.dev` page (Flutter SDK links to
  `flutter.dev` instead, since it's not a pub.dev package). Notes that the
  full transitive/engine-level license dump (Flutter/Skia, ~33k lines) is only
  in the app itself (Settings → About → Licenses), not reproduced here.
- **`src/routes/+page.svelte`** — mounted `<Credits />` and `<OpenSource />`
  after the About/Roadmap two-column section, before the footer (which
  already had the Privacy/Terms/Data-deletion legal links — nothing new
  needed there).

## B. Docs cleanup — new `docs/` subdirectory

Root had accumulated seven loose `.md` files with no organization. Moved
everything except `README.md` (which stays at root by convention) into
`docs/`:

- `BLOG_SETUP.md`, `COUNTER.md`, `DONATIONS_SETUP.md`, `LANDING_HANDOFF.md`,
  `attrib_export.md`, `landing_page_attrib_prompt.md`,
  `log_2026_07_01_feature.md` → `docs/`
- Removed a stray duplicate: `src/routes/terms-of-service/LANDING_HANDOFF.md`
  was an identical, misplaced copy of the root file (likely an accidental
  `git add` from inside that folder in a prior session) — deleted, not moved.
- Updated the two source comments that referenced these docs by bare filename
  (`.env.example`, `src/routes/api/webhooks/{alchemy,wise}/+server.js`) to
  point at `docs/...` so they still resolve.
- Added a "Docs" section to `README.md` linking each file in `docs/` so
  they're still discoverable from the repo root.

---

## Files touched

`src/lib/Credits.svelte` (NEW) · `src/lib/OpenSource.svelte` (NEW) ·
`src/routes/+page.svelte` · `README.md` · `.env.example` ·
`src/routes/api/webhooks/alchemy/+server.js` ·
`src/routes/api/webhooks/wise/+server.js` ·
`docs/` (new dir; 7 files moved in) ·
`src/routes/terms-of-service/LANDING_HANDOFF.md` (removed, stray duplicate)

## Open items

1. GPL-3.0 compliance question for Shikaku+ itself (whether being a GPL-3.0
   derivative requires Shikaku+ to ship under GPL-3.0 with source available)
   is still unresolved — tracked in `docs/attrib_export.md` §5, not addressed
   by this session's landing-page copy.
2. The pre-existing uncommitted `src/routes/admin/login/+page.svelte` change
   and Turnstile/editor open items from `docs/log_2026_07_01_feature.md` are
   unrelated to this session and were left as-is.

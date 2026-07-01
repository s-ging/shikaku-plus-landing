# Session notes — 2026-07-01

Complete record of every change made this session on **go.shikaku.plus**. Six
workstreams (A–F): a new on-page Changelog section, a git-history binary cleanup,
finishing the already-built blog/admin CMS go-live, wiring Cloudflare Turnstile
into admin sign-in, fixing an SSR crash that surfaced while testing it, and
scoping (not yet building) the Tiptap editor's image-upload + visual-polish gap.

`npx svelte-check` → **0 errors** after every code workstream. Verified live
behavior with a headless-Chromium screenshot pass (light + dark) and a local
SSR repro using the real production env values pulled from the live page's own
public config.

---

## A. New "Changelog" section on the landing page

Turned a changelog brief (Badges / Player Tags / Fixes, July 1 2026) into a
page section matching the site's existing card language (`About`, `Roadmap`,
`Support`).

- **`src/lib/Changelog.svelte`** — NEW. One `.card` with a header row
  (heading + "Latest" pill + date) and a 3-column grid of accent-colored
  groups (Badges = amber `--button-fill`, Player Tags = `#6A8AAA` matching the
  Hokan accent, Fixes = neutral). List items use small square bullets (echoes
  the game's rectangle motif) instead of round ones; inline `<code>` chips for
  literal values (`#AB12CD`, `R`). Collapses to one column under the site's
  existing 880px breakpoint.
- **`src/routes/+page.svelte`** — mounted `<Changelog />` between the hero/board
  and the About/Roadmap two-column section ("underneath the game," per the
  brief).

Verified with a headless-Chromium screenshot in both `prefers-color-scheme:
light` and `dark` — renders flush with the rest of the page in both.

---

## B. Git history cleanup — accidental 56MB binary removed

Found mid-session: a prior commit (`changelog`, made directly by the project
owner via VS Code, not by this session) had swept up a stray
`static/app-release.aab` (Android App Bundle, ~56MB) alongside the Changelog
code, and it was already pushed to `origin/master`.

- Confirmed via `git log --all -- static/app-release.aab` that the binary only
  ever existed in that one commit — no multi-commit history to rewrite.
- `git commit --amend` on that single commit to drop the file from its tree
  (the Changelog code changes stayed).
- `git push --force-with-lease origin master` (explicit owner sign-off given
  before force-pushing to `master`).
- `git reflog expire --expire=now --all && git gc --prune=now --aggressive` —
  `.git` dropped from **55M → 871K** locally once the rewritten ref replaced
  the dangling one.
- **`.gitignore`** — added `*.aab`, `*.apk`, `*.ipa` so a build artifact can't
  land in this repo again.

---

## C. Blog go-live — finishing what was already built

The blog/admin CMS (`/admin`, `/admin/login`, `/admin/new`, `/admin/[id]`,
public `/blog`, `/blog/[slug]`, Tiptap editor, Supabase-backed `posts` table)
was already fully coded from a prior session (`BLOG_SETUP.md`). This session
closed the remaining infra/config gaps:

- **`src/routes/+page.svelte`** — added the `/blog` link to the footer next to
  the legal links (the one thing `BLOG_SETUP.md` explicitly left for the owner
  to place).
- Verified via SQL in the Supabase editor that `posts` has RLS **enabled**
  (`relrowsecurity = true`) and both policies exist and are scoped to the real
  admin email (`hello.shikaku.plus@gmail.com`) in both `qual` and `with_check`
  — confirmed anon can only read `published = true` rows, admin (matched by
  JWT email) has full access.
- Confirmed `ADMIN_EMAIL`, `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`
  already set on Cloudflare Pages (reused from the donations-bar setup) and
  the Supabase Auth user for that email already existed.

---

## D. Cloudflare Turnstile wired into admin sign-in

The shared Supabase project has Bot/Abuse Protection (Turnstile) enabled
project-wide for the live game's signup flows — `/admin/login`'s
`signInWithPassword` call had no way to satisfy it, failing with
`captcha protection: request disallowed (no captcha_token found)`.

- **`src/routes/admin/login/+page.svelte`** — loads the Turnstile script,
  renders the widget via the explicit JS render API (not the declarative
  `cf-turnstile` div, for tighter control over reset-on-error), captures the
  token into `captchaToken`, and passes it as
  `signInWithPassword({ email, password, options: { captchaToken } })`. Resets
  the widget on a failed attempt (Turnstile tokens are single-use).
  **Deliberately reuses the game's existing Turnstile widget** (site key
  `0x4AAAAAADppnL_dBhZXMcMH`) rather than creating a new one — Supabase stores
  one Turnstile secret per project, so a second widget's tokens would never
  validate. The only Cloudflare-dashboard change needed was adding
  `go.shikaku.plus` and `localhost` to that widget's allowed domains.
- **`src/app.d.ts`** — NEW ambient `Window.turnstile` type (render/reset/remove)
  so the above type-checks cleanly.
- **`.env.example`**, **`BLOG_SETUP.md`** — documented the new
  `PUBLIC_TURNSTILE_SITE_KEY` var and the "reuse the existing widget" reasoning
  so it isn't rediscovered later.

---

## E. SSR crash fix — `window` referenced inside `onDestroy`

Surfaced as a `500` on `/admin/login` immediately after B shipped — both
locally and on the live site.

- **Root cause**: the new Turnstile cleanup callback,
  `onDestroy(() => { if (window.turnstile && widgetId) ... })`, referenced
  `window` unconditionally. Unlike `onMount`, Svelte's `onDestroy` **also runs
  during server-side rendering** — so every SSR pass of `/admin/login` threw
  `ReferenceError: window is not defined` and the page 500'd for every visitor.
- **Fix**: guarded with `typeof window !== 'undefined'`.
- **Verification**: reproduced locally first — built a local `.env` from the
  exact production values (pulled the public, non-secret `PUBLIC_SUPABASE_URL`
  / `PUBLIC_SUPABASE_ANON_KEY` straight out of the live page's own embedded
  SvelteKit config), ran `npm run dev`, and `curl`'d `/admin/login` to get the
  real stack trace (production masks it as a generic "Internal Error"). Status
  went `500 → 200` after the fix; a Playwright screenshot confirmed the
  Sign-in form + Turnstile widget render correctly. Owner confirmed sign-in
  now works live.

---

## F. Tiptap editor gaps — scoped, not yet built

Owner feedback after first real use of `/admin/new`: the editor "looks like
complete garbage," is "way too simple," and **pasted images do nothing** — the
current `StarterKit` + `Link` setup never had an image extension or a
paste/drop handler. Owner chose to log this for later rather than scope a
priority right now. Logged as three pending todos, not started:

1. Add a Tiptap image extension + paste/drop-to-upload handler in
   `src/lib/Editor.svelte`.
2. Create a Supabase Storage bucket + RLS policies for blog post images
   (public-read, admin-write — same email-gated pattern as `posts`; no new
   service, reuses the existing free-tier Supabase project).
3. Restyle the editor toolbar: real icons instead of text glyphs (`B`, `I`,
   `H2`, `❝`, `</>`), better spacing/visual hierarchy.

---

## Files touched

`src/lib/Changelog.svelte` (NEW) · `src/routes/+page.svelte` ·
`src/routes/admin/login/+page.svelte` · `src/app.d.ts` · `.env.example` ·
`BLOG_SETUP.md` · `.gitignore` · `static/app-release.aab` (removed from git
history)

---

## Open items

1. **Confirm the Cloudflare Pages redeploy** picked up `PUBLIC_TURNSTILE_SITE_KEY`
   — it was added to the dashboard but a fresh build/deploy is what actually
   applies it (per `BLOG_SETUP.md`'s existing note that env vars need a
   redeploy to take effect).
2. **Editor image upload + toolbar polish** (workstream F) — scoped into three
   todos, owner has not yet picked a starting point.
3. **Old `app-release.aab` blob** is unreachable from any ref on both local and
   origin, but the self-hosted git host (`s-ging`) may still hold it on disk
   until it runs its own server-side `gc` — outside this session's control.
4. **Login fix (workstream E) commit status** — left uncommitted at the
   owner's request mid-session pending their own commit/push pattern; confirm
   it actually landed before relying on it being live.

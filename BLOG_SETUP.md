# Blog — setup

A self-owned blog: posts live in **your Supabase**, you write them in a private
Tiptap dashboard at `/admin`, and they render at `/blog`. No third-party CMS.

```
/admin (you, gated)  ── Tiptap ──▶  Supabase `posts` table  ──▶  /blog (public, published only)
```

## Routes

| Route | Who | What |
|---|---|---|
| `/blog` | public | list of published posts |
| `/blog/<slug>` | public | one published post |
| `/admin` | you | list / publish / delete |
| `/admin/new`, `/admin/<id>` | you | write & edit (Tiptap) |
| `/admin/login` | you | email + password sign-in |

---

## 1. Create the `posts` table (Supabase SQL editor)

Replace `you@example.com` with **your** admin email in the two policies.

```sql
create table public.posts (
  id           bigint generated always as identity primary key,
  title        text        not null,
  slug         text        not null unique,
  excerpt      text        not null default '',
  content_html text        not null default '',
  published    boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.posts enable row level security;

-- Public can read PUBLISHED posts only.
create policy "public read published" on public.posts
  for select to anon using (published = true);

-- The admin (matched by email on their JWT) can do everything.
create policy "admin all" on public.posts
  for all to authenticated
  using      ((auth.jwt() ->> 'email') = 'you@example.com')
  with check ((auth.jwt() ->> 'email') = 'you@example.com');
```

## 2. Create your admin user

Supabase → **Authentication → Users → Add user** → your email + a password
(check "Auto Confirm").

> **Shared project note:** your game's players live in the same `auth.users`
> pool as this admin user — that's completely fine. Access is gated by **email**
> (the `ADMIN_EMAIL` guard + the RLS policies below check
> `auth.jwt() ->> 'email'`), not by being in a separate pool. A random player
> account can't match your admin email, so it can't reach `/admin` or write
> posts. **Do NOT disable public sign-ups** here — that would block player
> registration. The email match is what protects you.

## 3. Env vars (Cloudflare Pages → Settings → Environment variables, + `.env` local)

- `ADMIN_EMAIL` = the same email (the `/admin` guard checks this).
- `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` — already set for the donation bar; the blog reuses them.

> ⚠️ The admin email lives in **two** places that must match: `ADMIN_EMAIL`
> (server guard) **and** the RLS policies above (database). Update both if it
> ever changes.

**Redeploy** after adding env vars (Cloudflare picks them up on a new build).

---

## How it works / good to know

- **Auth:** `signInWithPassword` → session in cookies (`@supabase/ssr`). `src/hooks.server.js` reads it per request; `src/routes/admin/+layout.server.js` redirects anyone who isn't `ADMIN_EMAIL`. RLS is the real lock — even if the guard were bypassed, the DB rejects non-admin writes.
- **Editing:** Tiptap (`src/lib/Editor.svelte`) outputs **HTML**, stored in `content_html`, rendered with `{@html …}` on the post page. Safe here because only you (the authenticated admin) can write it.
- **Slugs** auto-fill from the title until you edit the slug field. The public URL is `/blog/<slug>`.
- **Drafts:** `published = false` stays invisible to the public (RLS); flip it from the list or the editor's "Published" checkbox.
- **Link to it:** add `<a href="/blog">Blog</a>` wherever you want (e.g. the footer in `src/routes/+page.svelte`) — I left that out so you can place it.

## Local dev

Put the same vars in `.env`, then `npm run dev`. Without them, `/blog` shows
"no posts" and `/admin` bounces to login — the main landing page is unaffected.

## What I couldn't do

Create the Supabase table/user or set env vars (need your project). Everything
code-side — auth wiring, editor, admin CRUD, public pages — is built and builds clean.

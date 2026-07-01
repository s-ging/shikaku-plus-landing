# Landing / Website Handoff — Shikaku+

Two things the **landing site** (go.shikaku.plus) owns. The Supabase SQL for both
already lives in the **app** repo (`supabase/migrations/20260627010000_16_account_deletion.sql`)
— do NOT recreate it on the landing side; just call / publish as below.

---

## A. Data-deletion disclosure (Google Play blocker)

**Play Console → Data safety → account deletion URL:** register
`https://go.shikaku.plus/data-deletion` (already live; append the copy below).

**What the app actually does on "Delete account"** (Settings → Account → Delete
account → confirm) — keep the public copy truthful to this:
- **Permanently deleted:** account identity, sign-in methods (email / Google /
  Discord), display name/profile, saved puzzles, daily progress, and the
  per-user gameplay event log. Local on-device data is wiped too.
- **Retained, anonymized:** aggregate gameplay stats (e.g. total puzzles solved)
  are kept in a **de-linked** form with **no user id** — they can no longer be
  tied to the person — so community totals (the global counter) stay accurate.
- **Irreversible**, effective immediately.

**Suggested copy for go.shikaku.plus/data-deletion (and privacy policy / ToS):**

> ### Deleting your Shikaku+ account
> You can delete your account and data at any time:
> - **In the app:** Settings → Account → Delete account.
> - **Or here:** [request deletion form / contact].
>
> When you delete your account we permanently remove your identity, sign-in
> methods (email, Google, Discord), display name, saved puzzles, daily progress,
> and your individual gameplay history. This is immediate and cannot be undone.
>
> We retain **anonymized, aggregate** statistics — for example the total number
> of puzzles solved across all players — in a form that is no longer linked to
> you or any account. This keeps community totals accurate and does not identify
> you.

> ⚠️ Make the privacy policy / ToS say the same thing so the disclosure is
> consistent across the app store listing, the data-deletion page, and the ToS.

---

## B. Global "boards solved" counter (the earlier Task 2)

The DB function already exists (app repo migration 16) and **already sums live +
retired stats**, so deletions don't make the number drop:

```sql
-- public.global_boards_solved() : returns bigint, granted to anon + authenticated
select public.global_boards_solved();
```

Client call:
```dart
final n = await supabase.rpc('global_boards_solved') as int;
```

Display rules (this is the only part the landing page builds):
- **Fire-and-forget on load.** Never block first paint. If it's null / errors /
  offline, render nothing — the page must look intentional without it.
- **Round DOWN** so it's always a safe under-statement: nearest 100 above ~1,000,
  nearest 50 below. e.g. `1,247 → "1,200+"`, `83 → "50+"`. Show the `+`.
  Rounding is pure display logic — lives on the landing page, not in the RPC.
- Thousands separators; hero-stat sizing.
- One fetch per load — no polling / realtime.

RLS note: a plain client `select sum(...) from user_stats` would be scoped to one
row by RLS — that's why it's a `SECURITY DEFINER` RPC. Use the RPC, not a table read.

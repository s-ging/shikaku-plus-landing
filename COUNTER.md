Add a live "boards solved" counter to the landing page.

Goal: display a global, all-users aggregate of total puzzles solved — one big number — fetched live from Supabase, rounded down to a clean figure so we never overpromise.

Data source: Supabase table user_stats, column boards_finished (int, one row per user). We want SUM(boards_finished) across all rows.

Gotcha — RLS will block a naive query. user_stats has row-level security scoping reads to the current user's own row, so a client select('boards_finished') returns just one row, not the global sum. Use a SECURITY DEFINER RPC that sums server-side. Add this migration:


create or replace function public.global_boards_solved()
returns bigint
language sql
security definer
set search_path = public
as $$ select coalesce(sum(boards_finished), 0) from user_stats $$;

grant execute on function public.global_boards_solved() to anon, authenticated;
Client call: final n = await supabase.rpc('global_boards_solved') as int;

Display rules:

Fire-and-forget on load. Never block first paint on it. If the fetch is null / errors / offline, render nothing (no zero, no spinner sticking around) — the page must look intentional without it.
Round DOWN to a clean bucket so the number is always a safe under-statement: nearest 100 above ~1,000, nearest 50 below that. e.g. 1,247 → "1,200+", 83 → "50+". Show the +. This bucketing is pure display logic and lives here in the landing page, not in any shared data layer.
Format with thousands separators; size it as a hero stat.
Do not add per-user fetching, polling, or live subscriptions — one fetch per page load is enough.
// boardsSolved.js — one-shot fetch of the global "boards solved" tally.
//
// A SECURITY DEFINER RPC (`public.global_boards_solved`) sums boards_finished
// across every user_stats row server-side. A plain client
// `select sum(...) from user_stats` can't do this: RLS scopes the read to the
// caller's own row, so the client would only ever see its own count. The RPC
// (granted to anon + authenticated) bypasses that to return the true global sum,
// and already folds in retired/anonymized stats so account deletions never make
// the number drop.
//
// This is intentionally fire-and-forget and one-shot — NO realtime, NO polling.
// One fetch per page load is enough for a hero stat. The caller never blocks
// first paint on it: on null / error / missing config it resolves to null and
// the page simply renders nothing in its place.
//
// Display rounding (bucketing the raw count down to a safe under-statement) is
// pure presentation and deliberately lives in the landing page, not here.
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { cleanSupabaseUrl } from '$lib/supabaseUrl.js';

/**
 * Fetch the global count of boards solved across all players.
 * @returns {Promise<number | null>} the raw sum, or null if unavailable.
 */
export async function fetchGlobalBoardsSolved() {
	if (!browser) return null;

	const url = cleanSupabaseUrl(env.PUBLIC_SUPABASE_URL);
	const key = env.PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !key) return null;

	try {
		const { createClient } = await import('@supabase/supabase-js');
		const supabase = createClient(url, key, { auth: { persistSession: false } });
		const { data, error } = await supabase.rpc('global_boards_solved');
		if (error) return null;
		// The RPC returns bigint; supabase-js hands it back as a number (or a
		// numeric string for very large values). Coerce and validate.
		const n = Number(data);
		return Number.isFinite(n) ? n : null;
	} catch {
		// Offline / blocked / SDK failure — render nothing rather than break.
		return null;
	}
}

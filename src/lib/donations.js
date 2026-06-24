// donations.js — live "amount raised" feed for the support thermometer.
//
// PRIMARY: Supabase Realtime. The four payment webhooks (see
// src/routes/api/webhooks/*) upsert rows into the `donations` table; this store
// loads the running total once, then subscribes to INSERTs so the bar ticks up
// the instant money lands — no polling, no refresh.
//
// FALLBACK: if Supabase env vars aren't set, it falls back to the old
// publish-a-Google-Sheet-as-CSV behaviour (poll + refetch on focus), and if
// neither is configured it just shows FALLBACK_RAISED so nothing breaks.
//
// Configure (in .env — see .env.example):
//   PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY
import { readable } from 'svelte/store';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

/** Legacy: published-to-web CSV URL for a donations sheet. Empty = unused. */
const SHEET_CSV_URL = '';

/** Re-fetch interval for the CSV fallback path. */
const POLL_MS = 30_000;

/** Shown before the first load, or if nothing is configured. */
export const FALLBACK_RAISED = 25;

/**
 * Sum the numeric values in column A of a CSV string (legacy fallback path).
 * @param {string} csv
 * @returns {number}
 */
export function parseRaised(csv) {
	let total = 0;
	for (const line of csv.split(/\r?\n/)) {
		const cell = line.split(',')[0]?.trim().replace(/["$,\s]/g, '') ?? '';
		const n = Number.parseFloat(cell);
		if (Number.isFinite(n)) total += n;
	}
	return total;
}

/**
 * Live store of the total amount raised (USD).
 * @type {import('svelte/store').Readable<number>}
 */
export const raised = readable(FALLBACK_RAISED, (set) => {
	if (!browser) return;

	const SUPA_URL = env.PUBLIC_SUPABASE_URL;
	const SUPA_KEY = env.PUBLIC_SUPABASE_ANON_KEY;

	// —— Primary: Supabase Realtime ——
	if (SUPA_URL && SUPA_KEY) {
		let cleanup = () => {};
		let cancelled = false;

		(async () => {
			const { createClient } = await import('@supabase/supabase-js');
			if (cancelled) return;
			const supabase = createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: false } });

			// Sum only CONFIRMED donations (pending Wise/PayPal credits don't count
			// until you tick them). Re-reading the sum on *any* table change keeps
			// the bar correct through inserts, confirm-flips, edits and deletes.
			async function refresh() {
				const { data } = await supabase.from('donations').select('usd_amount').eq('confirmed', true);
				if (!cancelled) set((data ?? []).reduce((s, r) => s + Number(r.usd_amount ?? 0), 0));
			}
			await refresh();

			const channel = supabase
				.channel('donations-feed')
				.on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, refresh)
				.subscribe();

			cleanup = () => supabase.removeChannel(channel);
		})();

		return () => {
			cancelled = true;
			cleanup();
		};
	}

	// —— Fallback: published Google Sheet CSV ——
	if (SHEET_CSV_URL) {
		let stopped = false;
		async function load() {
			try {
				const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
				if (!res.ok) return;
				const total = parseRaised(await res.text());
				if (!stopped && Number.isFinite(total)) set(total);
			} catch {
				/* network blip — keep the last value */
			}
		}
		load();
		const id = setInterval(load, POLL_MS);
		const onWake = () => document.visibilityState === 'visible' && load();
		window.addEventListener('focus', onWake);
		document.addEventListener('visibilitychange', onWake);
		return () => {
			stopped = true;
			clearInterval(id);
			window.removeEventListener('focus', onWake);
			document.removeEventListener('visibilitychange', onWake);
		};
	}

	// Neither configured — keep the fallback value.
});

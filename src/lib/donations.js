// donations.js — live "amount raised" feed for the support thermometer.
//
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO GO LIVE
// 1. Make a Google Sheet. Put donation amounts down column A (one per row).
//    A header in row 1 (e.g. "amount") is fine — non-numeric cells are ignored.
//    A single-cell sheet holding just the running total also works (it's a
//    sum of one number).
// 2. File → Share → Publish to web → choose the sheet → CSV → Publish.
//    Copy the URL — it looks like:
//      https://docs.google.com/spreadsheets/d/e/<long-id>/pub?gid=0&single=true&output=csv
// 3. Paste it into SHEET_CSV_URL below.
//
// Until SHEET_CSV_URL is set, the bar shows FALLBACK_RAISED so nothing breaks.
//
// Feeding the sheet automatically (the "I donate → number goes up" half):
//   - Manual: type the new total / append a row. The page picks it up within
//     POLL_MS, and instantly when the tab regains focus.
//   - Automatic: point your payment provider's webhook (Ko-fi, Stripe, BMC, …)
//     at a Google Apps Script / Zapier that appends the amount as a new row.
//     This file doesn't need to change — it just reads the column total.
// ─────────────────────────────────────────────────────────────────────────────

import { readable } from 'svelte/store';
import { browser } from '$app/environment';

/** Published-to-web CSV URL for the donations sheet. Empty = use fallback. */
const SHEET_CSV_URL = '';

/** Re-fetch interval while the page is open. */
const POLL_MS = 30_000;

/** Shown before the first successful fetch, or if the sheet is unreachable. */
export const FALLBACK_RAISED = 25;

/**
 * Sum the numeric values in column A of a CSV string.
 * Strips currency symbols / thousands separators; skips header / blank cells.
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
 * Live store of the total amount raised (USD). Polls the sheet on an interval
 * and refetches immediately whenever the tab regains focus — so coming back
 * from a donation flow shows the updated number right away.
 * @type {import('svelte/store').Readable<number>}
 */
export const raised = readable(FALLBACK_RAISED, (set) => {
	// No fetching during SSR or before the sheet is configured.
	if (!browser || !SHEET_CSV_URL) return;

	let stopped = false;

	async function load() {
		try {
			const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
			if (!res.ok) return; // keep last good value
			const total = parseRaised(await res.text());
			if (!stopped && Number.isFinite(total)) set(total);
		} catch {
			/* network blip — keep the last value */
		}
	}

	load();
	const id = setInterval(load, POLL_MS);
	const onWake = () => {
		if (document.visibilityState === 'visible') load();
	};
	window.addEventListener('focus', onWake);
	document.addEventListener('visibilitychange', onWake);

	return () => {
		stopped = true;
		clearInterval(id);
		window.removeEventListener('focus', onWake);
		document.removeEventListener('visibilitychange', onWake);
	};
});

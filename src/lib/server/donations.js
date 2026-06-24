// server/donations.js — the write side of the funding tally.
//
// Every payment webhook (PayMongo, PayPal, Wise, crypto/Alchemy) funnels into
// `recordDonation()`, which normalises the amount to USD and upserts one row
// into the Supabase `donations` table. The browser bar ($lib/donations.js)
// is subscribed to that table over Realtime, so the moment a row lands the
// thermometer ticks up — no refresh.
//
// Idempotency: webhooks retry. We upsert on (provider, ref) and ignore dupes,
// so a provider re-delivering the same event can never double-count.
//
// This module is server-only (it holds the service-role key). Never import it
// from a component or anything that ships to the browser.
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

const supabase =
	env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
		? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
				auth: { persistSession: false }
		  })
		: null;

// Rough static FX → USD. The goal/bar is denominated in USD, but PayMongo
// charges PHP, PayPal/Wise can be anything, crypto stablecoins are ~$1. Keep
// these roughly current, or swap `toUsd` for a live FX feed if you care about
// exactness. Unknown currencies fall through to a 1:1 pass-through.
const USD_RATES = /** @type {Record<string, number>} */ ({
	USD: 1,
	USDC: 1,
	USDT: 1,
	PHP: 1 / 58,
	EUR: 1.08,
	GBP: 1.27,
	AUD: 0.66,
	CAD: 0.73,
	SGD: 0.74,
	JPY: 1 / 157
});

/**
 * Convert a gross amount in `currency` to USD. Returns the input unchanged for
 * currencies we don't have a rate for (logged so you can add it).
 * @param {number} amount
 * @param {string} currency
 * @returns {number}
 */
export function toUsd(amount, currency) {
	const code = (currency || 'USD').toUpperCase();
	const rate = USD_RATES[code];
	if (rate == null) {
		console.warn(`[donations] no FX rate for ${code} — recording 1:1`);
		return amount;
	}
	return Math.round(amount * rate * 100) / 100;
}

// Providers whose accounts ALSO receive non-donation money (client invoices,
// refunds, transfers from friends…). Their payments land as `confirmed = false`
// and are NOT counted on the bar until you tick them confirmed in Supabase.
// - 'wise' : balance also receives client/work payments
// Crypto's client payments are filtered out at source instead (CRYPTO_IGNORE_FROM
// in the Alchemy handler), so crypto auto-confirms. Add 'paypal' here if your
// personal PayPal gets work pay.
const NEEDS_REVIEW = new Set(['wise']);

/**
 * Record one payment. Safe to call repeatedly with the same `ref` — duplicates
 * are ignored. Ambiguous providers (see NEEDS_REVIEW) are stored unconfirmed.
 * @param {{ provider: string, amount: number, currency: string, ref: string }} d
 */
export async function recordDonation({ provider, amount, currency, ref }) {
	const usd_amount = toUsd(amount, currency);
	const confirmed = !NEEDS_REVIEW.has(provider);
	if (!supabase) {
		// No datastore wired yet — log so it's visible in server output, but never
		// throw: a 500 here would make providers retry forever.
		console.warn('[donations] Supabase not configured; would record', {
			provider,
			amount,
			currency,
			usd_amount,
			ref,
			confirmed
		});
		return;
	}
	const { error } = await supabase
		.from('donations')
		.upsert(
			{ provider, amount, currency, usd_amount, ref, confirmed },
			{ onConflict: 'provider,ref', ignoreDuplicates: true }
		);
	if (error) console.error('[donations] insert failed', error);
}

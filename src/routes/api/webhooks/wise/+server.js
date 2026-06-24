// Wise webhook → records incoming credits to your Wise balance.
// Docs: https://docs.wise.com/guides/developer/webhooks
// Wise signs the raw body with their private key; you verify with Wise's
// PUBLIC key (RSA-SHA256, signature base64 in `X-Signature-SHA256`).
//
// Subscribe via the Wise API (see DONATIONS_SETUP.md §5) to the
// "balances#credit" event with delivery schema version 4.0.0. Confirmed
// payload shape (schema 4.0.0):
//   { event_type: "balances#credit", schema_version, sent_at,
//     data: { amount, currency, post_transaction_balance_amount,
//             occurred_at, transaction_type: "credit", resource: {...} } }
//
// HEADS UP: this fires on EVERY credit to the balance, not only donation-link
// payments, and creating the subscription sends one test event. Both can land
// a stray row — delete it from the Supabase table editor.
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { recordDonation } from '$lib/server/donations.js';
import { rsaValid } from '$lib/server/verify.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const raw = await request.text();
	const sig = request.headers.get('x-signature-sha256') ?? '';

	const ok = await rsaValid(env.WISE_PUBLIC_KEY, raw, sig);
	if (!ok) throw error(401, 'bad signature');

	const evt = JSON.parse(raw);
	const d = evt?.data ?? {};
	const amount = Number(d.amount ?? 0);

	// Only real, positive credits. (Wise's creation test event uses a 0/sample
	// amount, so this also sidesteps double-counting the test.)
	if (evt.event_type === 'balances#credit' && amount > 0) {
		await recordDonation({
			provider: 'wise',
			amount,
			currency: d.currency ?? 'USD',
			// occurred_at is stable across Wise retries → natural idempotency key.
			ref: `${d.occurred_at ?? evt.sent_at ?? ''}:${amount}`
		});
	}
	return json({ received: true });
}

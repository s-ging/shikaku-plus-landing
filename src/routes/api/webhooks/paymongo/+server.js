// PayMongo webhook → records QR Ph / card payments.
// Docs: https://developers.paymongo.com/docs/webhooks
// Signature header: `Paymongo-Signature: t=<ts>,te=<testSig>,li=<liveSig>`
// where each sig = HMAC-SHA256( `${t}.${rawBody}` , webhookSecret ).
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { recordDonation } from '$lib/server/donations.js';
import { hmacValid } from '$lib/server/verify.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const raw = await request.text();
	const header = request.headers.get('paymongo-signature') ?? '';
	const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=')));
	const live = env.PAYMONGO_WEBHOOK_MODE === 'live';
	const provided = live ? parts.li : parts.te;

	const valid = await hmacValid(env.PAYMONGO_WEBHOOK_SECRET, `${parts.t}.${raw}`, provided);
	if (!valid) throw error(401, 'bad signature');

	const evt = JSON.parse(raw);
	const attr = evt?.data?.attributes; // the event envelope
	const type = attr?.type; // e.g. "payment.paid" / "link.payment.paid"

	if (type === 'payment.paid' || type === 'link.payment.paid') {
		const pay = attr?.data?.attributes ?? {};
		await recordDonation({
			provider: 'paymongo',
			amount: (pay.amount ?? 0) / 100, // PayMongo amounts are in centavos
			currency: pay.currency ?? 'PHP',
			ref: attr?.data?.id ?? `paymongo:${parts.t}`
		});
	}
	return json({ received: true });
}

// PayPal webhook → records completed captures. Requires a *business* account +
// a REST app + a registered webhook (you get a webhook id).
// Docs: https://developer.paypal.com/api/rest/webhooks/
// Verification is done by calling PayPal's verify-webhook-signature API with
// the transmission headers + your webhook id (the robust, documented method).
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { recordDonation } from '$lib/server/donations.js';

const BASE =
	env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const raw = await request.text();
	const ok = await verify(request.headers, raw);
	if (!ok) throw error(401, 'bad signature');

	const evt = JSON.parse(raw);
	if (evt.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
		const amt = evt.resource?.amount ?? {};
		await recordDonation({
			provider: 'paypal',
			amount: Number(amt.value ?? 0),
			currency: amt.currency_code ?? 'USD',
			ref: evt.resource?.id ?? evt.id
		});
	}
	return json({ received: true });
}

/**
 * @param {Headers} headers
 * @param {string} rawBody
 */
async function verify(headers, rawBody) {
	const cred = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`);
	const tokRes = await fetch(`${BASE}/v1/oauth2/token`, {
		method: 'POST',
		headers: { Authorization: `Basic ${cred}`, 'Content-Type': 'application/x-www-form-urlencoded' },
		body: 'grant_type=client_credentials'
	});
	const { access_token } = await tokRes.json();

	const res = await fetch(`${BASE}/v1/notifications/verify-webhook-signature`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({
			auth_algo: headers.get('paypal-auth-algo'),
			cert_url: headers.get('paypal-cert-url'),
			transmission_id: headers.get('paypal-transmission-id'),
			transmission_sig: headers.get('paypal-transmission-sig'),
			transmission_time: headers.get('paypal-transmission-time'),
			webhook_id: env.PAYPAL_WEBHOOK_ID,
			webhook_event: JSON.parse(rawBody)
		})
	});
	const v = await res.json();
	return v.verification_status === 'SUCCESS';
}

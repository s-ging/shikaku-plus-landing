// Alchemy "Address Activity" webhook → records incoming USDC/USDT (ETH) to the
// donation wallet. This is the near-instant crypto signal.
// Docs: https://docs.alchemy.com/reference/address-activity-webhook
// Signature: header `x-alchemy-signature` = HMAC-SHA256(rawBody, signingKey).
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { recordDonation } from '$lib/server/donations.js';
import { hmacValid } from '$lib/server/verify.js';

// Crypto is OFF for now (it's not offered on the page, and the shared address
// also receives client payments). Records nothing while false — flip to true
// after moving to a dedicated donation wallet to re-enable. See DONATIONS_SETUP §3/§6.
const CRYPTO_ENABLED = false;

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const raw = await request.text();
	const provided = request.headers.get('x-alchemy-signature') ?? '';

	const valid = await hmacValid(env.ALCHEMY_SIGNING_KEY, raw, provided);
	if (!valid) throw error(401, 'bad signature');

	// Acknowledge (200) but record nothing while crypto is disabled.
	if (!CRYPTO_ENABLED) return json({ received: true, ignored: 'crypto disabled' });

	const evt = JSON.parse(raw);
	const wallet = (env.DONATION_ETH_ADDRESS ?? '').toLowerCase();

	// Senders to exclude (e.g. a client who pays you at this same address).
	// Comma-separated in CRYPTO_IGNORE_FROM; their transfers are skipped entirely
	// so only genuine donations are recorded.
	const ignoreFrom = new Set(
		(env.CRYPTO_IGNORE_FROM ?? '')
			.toLowerCase()
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
	);

	for (const act of evt?.event?.activity ?? []) {
		if ((act.toAddress ?? '').toLowerCase() !== wallet) continue;
		if (ignoreFrom.has((act.fromAddress ?? '').toLowerCase())) continue; // not a donation
		const asset = (act.asset ?? '').toUpperCase();
		if (asset !== 'USDC' && asset !== 'USDT') continue;
		await recordDonation({
			provider: 'crypto',
			amount: Number(act.value ?? 0), // Alchemy gives the decimal token amount
			currency: asset,
			ref: `${act.hash}:${act.log?.logIndex ?? act.rawContract?.address ?? ''}`
		});
	}
	return json({ received: true });
}

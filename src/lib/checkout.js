// Polar checkout links for /support (Kris, 2026-11-26). Polar is the merchant of
// record; the polar-webhook edge function in the app repo grants the perk.
// Paste each link from Polar (Products → Checkout Links). Empty = the button
// shows as "Coming soon" and links nowhere.

/** One-time Foundation, pay what you want. */
export const FOUNDATION_CHECKOUT = '';

/** Supporter packs: one link holding all six month products. */
export const SUPPORTER_CHECKOUT = '';

/** Badge tiers by amount: keep in sync with lib/iap_catalog.dart in the app. */
export const FOUNDATION_TIERS = [
	{ tier: 1, min: 1, name: 'Foundation ★' },
	{ tier: 2, min: 5, name: 'Foundation ★★' },
	{ tier: 3, min: 20, name: 'Foundation ★★★' },
	{ tier: 4, min: 50, name: 'Foundation ★★★★' }
];

/** Supporter packs: prices as in lib/iap_catalog.dart. */
export const SUPPORTER_PACKS = [
	{ months: 1, usd: '1.99' },
	{ months: 2, usd: '3.98' },
	{ months: 3, usd: '5.00' },
	{ months: 4, usd: '7.96' },
	{ months: 6, usd: '9.00' },
	{ months: 12, usd: '15.00' }
];

export const SUPPORT_EMAIL = 'hello@shikaku.plus';

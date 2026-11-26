// Polar checkout links for /support (Kris, 2026-11-26). Polar is the merchant of
// record; the polar-webhook edge function in the app repo grants the perk.
// Paste each link from Polar (Products → Checkout Links). Empty = the button
// shows as "Coming soon" and links nowhere.

/** One-time Foundation, pay what you want. */
export const FOUNDATION_CHECKOUT = '';

/** Supporter: one product, the buyer picks how many months (Polar unit pricing). */
export const SUPPORTER_CHECKOUT = '';

/** Badge tiers by amount: keep in sync with lib/iap_catalog.dart in the app. */
export const FOUNDATION_TIERS = [
	{ tier: 1, min: 1, name: 'Foundation ★' },
	{ tier: 2, min: 5, name: 'Foundation ★★' },
	{ tier: 3, min: 20, name: 'Foundation ★★★' },
	{ tier: 4, min: 50, name: 'Foundation ★★★★' }
];


export const SUPPORT_EMAIL = 'hello@shikaku.plus';

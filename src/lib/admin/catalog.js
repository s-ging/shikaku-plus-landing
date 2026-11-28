// What the admin panel knows about Shikaku+ (the players page, /admin/players).
// Everything game-specific lives here so the panel can be reused on another
// project by swapping this file. The database side is app migration 56, part 2
// (shikaku-plus-info project/admin-panel-2026-11-26.md).

/** Badges Krischan grants by hand. Ids live in the database: never rename one. */
export const HAND_BADGES = [
	{ id: 'new_player', name: 'New Player' },
	{ id: 'beta', name: 'Beta Tester' },
	{ id: 'feedback', name: 'Contributor' },
	{ id: 'prevs', name: 'PreVS' },
	{ id: '26_vol_0', name: 'Ed. 26 • Volume 0' },
	{ id: 'supporter_1', name: 'Supporter I' },
	{ id: 'supporter_2', name: 'Supporter II' },
	{ id: 'supporter_3', name: 'Supporter III' },
	{ id: 'supporter_4', name: 'Supporter IV' }
];

/**
 * Earned by playing (app lib/badge_catalog.dart): shown, never granted here.
 * @type {Record<string, string>}
 */
export const EARNED_BADGES = {
	shikaku_classic_1: 'Classic Initiate',
	shikaku_classic_50: 'Classic Enthusiast',
	shikaku_classic_100: 'Classic Veteran',
	shikaku_classic_200: 'Classic Expert',
	shikaku_hokan_1: 'Hokan Initiate',
	shikaku_hokan_50: 'Hokan Enthusiast',
	shikaku_hokan_100: 'Hokan Veteran',
	shikaku_hokan_200: 'Hokan Expert',
	time_attack_1: 'In A Rush',
	time_attack_50: 'Time Attacked',
	time_attack_100: 'Time Attacker',
	time_attack_200: 'Time Expert',
	time_attack_500: 'Time Attack Master',
	blitz_1: 'Quickie',
	blitz_50: 'Blitzed',
	blitz_100: 'Speedster',
	blitz_200: 'Blitz Expert',
	blitz_500: 'Blitz Master',
	tekazu_1: 'Lock In',
	tekazu_50: 'Locked Out',
	tekazu_100: 'Lockdown',
	tekazu_200: 'Tekazu Expert',
	tekazu_500: 'Tekazu Master'
};

/**
 * A badge's picture: the app's own art (app assets/images/badges), copied to
 * static/admin/badges (Krischan, 2026-11-28). A badge added to the app needs
 * its SVG copied there too; until then it shows by name only.
 * @param {string | null | undefined} id
 */
export function badgeIcon(id) {
	if (!id || !(HAND_BADGES.some((b) => b.id === id) || id in EARNED_BADGES)) return null;
	return `/admin/badges/${id.replaceAll('_', '-')}.svg`;
}

/** A Foundation tier's picture (1–4). @param {number} n */
export function tierIcon(n) {
	return n >= 1 && n <= 4 ? `/admin/badges/foundation-${n}.svg` : null;
}

/** @param {string | null | undefined} id */
export function badgeName(id) {
	if (!id) return '';
	const m = /^foundation_([1-4])$/.exec(id);
	if (m) return 'Foundation ' + '★'.repeat(Number(m[1]));
	return HAND_BADGES.find((b) => b.id === id)?.name ?? EARNED_BADGES[id] ?? id;
}

// Message templates. Placeholder words: Krischan writes the real ones.
// {name} and {badge} are filled in before sending.
export const TEMPLATES = [
	{
		key: 'bug',
		label: 'Reported a bug',
		title: 'Thanks for the bug report',
		body: 'Hi {name}, thanks for reporting that bug. It helps everyone. Here is the {badge} badge as a thank-you.'
	},
	{
		key: 'player',
		label: 'Reported a player',
		title: 'Thanks for the report',
		body: 'Hi {name}, thanks for helping keep Shikaku+ friendly. Here is the {badge} badge.'
	},
	{
		key: 'foundation',
		label: 'Foundation',
		title: 'Welcome to the Foundation',
		body: 'Hi {name}, thank you for backing Shikaku+. Your {badge} badge and tag editing are on your account now.'
	},
	{
		key: 'beta',
		label: 'Beta tester',
		title: 'Thanks for testing',
		body: 'Hi {name}, thanks for playing the early builds. Here is the {badge} badge.'
	}
];

/** Limits the database enforces (player_messages, admin_actions). */
export const LIMITS = { title: 60, body: 500, reason: 200 };

/**
 * @param {string} text
 * @param {{ name: string, badge: string }} vars
 */
export function fill(text, vars) {
	return text.replaceAll('{name}', vars.name).replaceAll('{badge}', vars.badge || 'new');
}

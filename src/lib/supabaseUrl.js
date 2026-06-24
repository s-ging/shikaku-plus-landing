/**
 * Normalize a Supabase project URL.
 *
 * supabase-js wants the BARE project origin (https://xxxx.supabase.co) and
 * appends /rest/v1, /auth/v1, /realtime/v1 itself. If the env var accidentally
 * includes a trailing slash or a `/rest/v1` suffix (easy to paste by mistake),
 * the paths double up — e.g. /rest/v1/rest/v1/… → 404s, websocket failures,
 * and "Invalid path" on auth. This strips those so it works either way.
 *
 * @param {string | undefined | null} url
 * @returns {string}
 */
export function cleanSupabaseUrl(url) {
	if (!url) return '';
	return url
		.trim()
		.replace(/\/+$/, '') // trailing slash(es)
		.replace(/\/(rest|auth|realtime|storage)\/v1$/, '') // a pasted API path
		.replace(/\/+$/, '');
}

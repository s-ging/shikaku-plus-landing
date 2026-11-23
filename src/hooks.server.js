// Wires a per-request Supabase client (with cookie-based auth) into every
// request, so server loads and the admin guard can read the logged-in session.
// If Supabase env vars aren't set, locals.supabase is null and the public site
// still works (only /blog and /admin need it).
import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import { cleanSupabaseUrl } from '$lib/supabaseUrl.js';

// Short addresses (Krischan, 2026-11-23). Our own pages move for good (301,
// query kept); links out are 302 so they can change later without browsers
// remembering the old target.
/** @type {Record<string, string>} */
const ALIASES = {
	'/terms': '/terms-of-service',
	'/tos': '/terms-of-service'
};
const X = 'https://x.com/shikaku_plus';
const GOOGLE_PLAY = 'https://play.google.com/store/apps/details?id=plus.shikaku.app';
/** @type {Record<string, string>} */
const LINKS_OUT = {
	'/x': X,
	'/twitter': X,
	'/android': GOOGLE_PLAY,
	'/play_android': GOOGLE_PLAY
};

export async function handle({ event, resolve }) {
	// After the domain swap (shikaku-plus-info decision 0024), go.shikaku.plus is
	// an old address: every URL goes permanently to the same path on
	// shikaku.plus. Shipped apps link to go.shikaku.plus/privacy-policy,
	// /terms-of-service, /data-deletion and /support (lib/external_links.dart).
	if (event.url.hostname === 'go.shikaku.plus') {
		return new Response(null, {
			status: 301,
			headers: { Location: `https://shikaku.plus${event.url.pathname}${event.url.search}` }
		});
	}

	const path = event.url.pathname.replace(/\/+$/, '').toLowerCase();
	const out = LINKS_OUT[path];
	if (out) {
		return new Response(null, { status: 302, headers: { Location: out } });
	}
	const alias = ALIASES[path];
	if (alias) {
		return new Response(null, {
			status: 301,
			headers: { Location: `${alias}${event.url.search}` }
		});
	}

	const url = cleanSupabaseUrl(env.PUBLIC_SUPABASE_URL);
	const key = env.PUBLIC_SUPABASE_ANON_KEY;

	if (url && key) {
		event.locals.supabase = createServerClient(url, key, {
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet) => {
					for (const { name, value, options } of cookiesToSet) {
						event.cookies.set(name, value, { ...options, path: '/' });
					}
				}
			}
		});

		event.locals.safeGetSession = async () => {
			const supabase = /** @type {import('@supabase/supabase-js').SupabaseClient} */ (
				event.locals.supabase
			);
			const {
				data: { session }
			} = await supabase.auth.getSession();
			if (!session) return { session: null, user: null };
			// getUser() re-validates the JWT against Supabase (getSession alone is spoofable).
			const {
				data: { user },
				error
			} = await supabase.auth.getUser();
			if (error) return { session: null, user: null };
			return { session, user };
		};
	} else {
		event.locals.supabase = null;
		event.locals.safeGetSession = async () => ({ session: null, user: null });
	}

	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
}

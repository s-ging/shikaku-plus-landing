// Wires a per-request Supabase client (with cookie-based auth) into every
// request, so server loads and the admin guard can read the logged-in session.
// If Supabase env vars aren't set, locals.supabase is null and the public site
// still works (only /blog and /admin need it).
import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import { cleanSupabaseUrl } from '$lib/supabaseUrl.js';

export async function handle({ event, resolve }) {
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

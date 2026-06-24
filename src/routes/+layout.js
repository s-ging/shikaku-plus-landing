// Creates a Supabase client usable from components (data.supabase). On the
// browser it persists the session to cookies; on the server it reads the
// cookies forwarded by +layout.server.js. Returns null if Supabase isn't
// configured so the public site keeps working.
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import { cleanSupabaseUrl } from '$lib/supabaseUrl.js';

export async function load({ data, depends, fetch }) {
	depends('supabase:auth');

	const url = cleanSupabaseUrl(env.PUBLIC_SUPABASE_URL);
	const key = env.PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !key) return { supabase: null, session: null, user: null };

	const supabase = isBrowser()
		? createBrowserClient(url, key, { global: { fetch } })
		: createServerClient(url, key, {
				global: { fetch },
				cookies: { getAll: () => data.cookies ?? [] }
		  });

	const {
		data: { session }
	} = await supabase.auth.getSession();
	const {
		data: { user }
	} = await supabase.auth.getUser();

	return { supabase, session, user };
}

// Surfaces the session + cookies so the universal +layout.js can rebuild a
// Supabase client on both server and client.
export async function load({ locals: { safeGetSession }, cookies }) {
	const { session, user } = await safeGetSession();
	return { session, user, cookies: cookies.getAll() };
}

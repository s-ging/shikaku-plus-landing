// Gate: only the admin (ADMIN_EMAIL) may see anything under /admin except the
// login page. RLS on the `posts` table enforces the same rule at the database,
// so this is defence-in-depth, not the only lock.
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function load({ locals: { safeGetSession }, url }) {
	const { user } = await safeGetSession();
	const isLogin = url.pathname === '/admin/login';
	const isAdmin = !!user && !!env.ADMIN_EMAIL && user.email === env.ADMIN_EMAIL;

	if (!isAdmin && !isLogin) throw redirect(303, '/admin/login');
	if (isAdmin && isLogin) throw redirect(303, '/admin');

	return { isAdmin };
}

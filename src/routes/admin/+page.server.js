// Admin post list. The guard in +layout.server.js has already confirmed the
// caller is the admin, and RLS lets the owner read drafts + published alike.
export async function load({ locals: { supabase } }) {
	if (!supabase) return { posts: [] };
	const { data: posts } = await supabase
		.from('posts')
		.select('id, title, slug, published, post_type, updated_at')
		.order('updated_at', { ascending: false });
	return { posts: posts ?? [] };
}

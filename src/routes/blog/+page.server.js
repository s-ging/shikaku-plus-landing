// Public blog index — published posts only (RLS also enforces this for anon).
export async function load({ locals: { supabase } }) {
	if (!supabase) return { posts: [] };
	const { data: posts } = await supabase
		.from('posts')
		.select('title, slug, excerpt, created_at')
		.eq('published', true)
		.order('created_at', { ascending: false });
	return { posts: posts ?? [] };
}

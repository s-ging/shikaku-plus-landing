import { error } from '@sveltejs/kit';

export async function load({ params, locals: { supabase } }) {
	if (!supabase) throw error(404, 'Post not found');
	const { data: post } = await supabase
		.from('posts')
		.select('title, excerpt, content_html, created_at')
		.eq('slug', params.slug)
		.eq('published', true)
		.single();
	if (!post) throw error(404, 'Post not found');
	return { post };
}
